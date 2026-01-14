import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  title: string;
  message: string;
  tokens?: string[];
  topic?: string;
  data?: Record<string, string>;
}

// Generate JWT for Google OAuth2
async function createJWT(clientEmail: string, privateKey: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encode = (obj: object) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${unsignedToken}.${signatureB64}`;
}

// Get OAuth2 access token
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwt = await createJWT(clientEmail, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OAuth2 token error:", errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Send notification via FCM v1 API
async function sendFCMv1(
  projectId: string,
  accessToken: string,
  message: {
    topic?: string;
    token?: string;
    notification: { title: string; body: string };
    data?: Record<string, string>;
    android?: object;
    apns?: object;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.error("FCM v1 error:", text);
      return { success: false, error: text };
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch {
      return { success: true, data: text };
    }
  } catch (error: any) {
    console.error("FCM v1 request failed:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
    const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");

    console.log("FCM v1 config - Project ID:", !!projectId, "Client Email:", !!clientEmail, "Private Key:", !!privateKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { title, message, tokens, topic, data }: PushNotificationRequest = body;

    if (!title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Title and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing push notification: ${title}`);

    // If FCM v1 is not configured, skip but return success for in-app notifications
    if (!projectId || !clientEmail || !privateKey) {
      console.log("FCM v1 not fully configured, skipping push notification");
      return new Response(
        JSON.stringify({
          success: true,
          message: "In-app notification will be created (FCM not configured)",
          fcmSkipped: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get OAuth2 access token
    let accessToken: string;
    try {
      // Handle escaped newlines in private key (common when stored as env var)
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
      accessToken = await getAccessToken(clientEmail, formattedPrivateKey);
      console.log("Successfully obtained OAuth2 access token");
    } catch (error: any) {
      console.error("Failed to get access token:", error);
      return new Response(
        JSON.stringify({
          success: true,
          message: "In-app notification will be created (FCM auth failed)",
          fcmSuccess: false,
          fcmError: error.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build FCM v1 message
    const fcmMessage: any = {
      notification: {
        title,
        body: message,
      },
      data: data || {},
      android: {
        notification: {
          sound: "default",
          channel_id: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    let results: any[] = [];

    // Send to specific tokens
    if (tokens && tokens.length > 0) {
      console.log(`Sending to ${tokens.length} device tokens`);
      
      for (const token of tokens) {
        const result = await sendFCMv1(projectId, accessToken, {
          ...fcmMessage,
          token,
        });
        results.push({ token: token.substring(0, 20) + "...", ...result });
      }
    }
    // Send to a topic
    else {
      const targetTopic = topic || "all";
      console.log(`Sending to topic: ${targetTopic}`);
      
      const result = await sendFCMv1(projectId, accessToken, {
        ...fcmMessage,
        topic: targetTopic,
      });
      results.push(result);
    }

    const allSuccess = results.every((r) => r.success);

    return new Response(
      JSON.stringify({
        success: true,
        message: allSuccess
          ? "Push notification sent successfully via FCM v1"
          : "Push notification partially sent",
        fcmSuccess: allSuccess,
        fcmVersion: "v1",
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in push notification handler:", error);
    return new Response(
      JSON.stringify({
        success: true,
        message: "In-app notification will be created (push failed)",
        fcmSuccess: false,
        fcmError: error.message,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
