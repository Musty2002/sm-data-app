import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Create JWT for Google OAuth2
async function createJWT(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  let privateKey = serviceAccount.private_key;
  
  // Handle escaped newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const pemContents = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
}

// Exchange JWT for OAuth2 access token
async function getAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const jwt = await createJWT(serviceAccount);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OAuth2 token exchange failed:', errorText);
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Send FCM v1 notification
async function sendFCMv1(
  projectId: string,
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; errorCode?: string; error?: string }> {
  const message: Record<string, unknown> = {
    message: {
      token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          channel_id: 'default',
          sound: 'default',
        },
      },
    },
  };

  if (data) {
    (message.message as Record<string, unknown>).data = data;
  }

  console.log(`Sending FCM to token: ${token.substring(0, 20)}...`);

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    console.error('FCM send failed:', JSON.stringify(responseData));
    const errorCode = responseData?.error?.details?.[0]?.errorCode || 
                      responseData?.error?.status || 
                      'UNKNOWN';
    return { 
      success: false, 
      errorCode,
      error: responseData?.error?.message || 'Unknown error'
    };
  }

  console.log('FCM send success:', responseData.name);
  return { success: true, messageId: responseData.name };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get service account from environment - supports full JSON or separate keys
    let serviceAccount: { project_id: string; client_email: string; private_key: string };
    
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    
    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid service account JSON' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Fallback to separate environment variables
      const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
      const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
      const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY');
      
      if (!projectId || !clientEmail || !privateKey) {
        console.error('Firebase not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Firebase not configured. Add FIREBASE_SERVICE_ACCOUNT secret.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      serviceAccount = { project_id: projectId, client_email: clientEmail, private_key: privateKey };
    }

    const projectId = serviceAccount.project_id;
    if (!projectId || !serviceAccount.client_email || !serviceAccount.private_key) {
      console.error('Service account missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid service account: missing required fields' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { token, title, body, data } = await req.json() as PushRequest;

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: token, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing push notification: "${title}" to token: ${token.substring(0, 20)}...`);

    // Get OAuth2 access token
    const accessToken = await getAccessToken(serviceAccount);
    console.log('Successfully obtained OAuth2 access token');

    // Send the notification
    const result = await sendFCMv1(projectId, accessToken, token, title, body, data);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Push notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
