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

// Helper function to safely parse FCM response
async function parseFCMResponse(response: Response): Promise<{ ok: boolean; data?: any; error?: string }> {
  const text = await response.text();
  
  // Check if response is HTML (error page)
  if (text.trim().startsWith('<')) {
    console.error("FCM returned HTML instead of JSON. The legacy API may be deprecated.");
    return { 
      ok: false, 
      error: "FCM legacy API is deprecated. Please use FCM v1 API with service account." 
    };
  }
  
  try {
    const data = JSON.parse(text);
    return { ok: response.ok, data };
  } catch (e) {
    console.error("Failed to parse FCM response:", text.substring(0, 200));
    return { ok: false, error: "Invalid response from FCM" };
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
    
    console.log("Firebase Server Key configured:", !!firebaseServerKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { title, message, tokens, topic, data }: PushNotificationRequest = body;

    if (!title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Title and message are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing push notification: ${title}`);

    // If no Firebase key, skip FCM but return success for in-app notifications
    if (!firebaseServerKey) {
      console.log("FCM not configured, skipping push notification");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "In-app notification will be created (FCM not configured)",
          fcmSkipped: true
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Build FCM message payload
    const fcmPayload: any = {
      notification: {
        title,
        body: message,
        sound: "default",
      },
      data: {
        ...data,
        title,
        message,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    let fcmResult: { ok: boolean; data?: any; error?: string } = { ok: false };

    // Try to send via FCM
    try {
      const targetTopic = topic || "all";
      console.log(`Attempting to send to topic: ${targetTopic}`);
      
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${firebaseServerKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fcmPayload,
          to: `/topics/${targetTopic}`,
        }),
      });

      fcmResult = await parseFCMResponse(response);
      
      if (fcmResult.ok && fcmResult.data) {
        console.log("FCM success:", fcmResult.data);
      } else {
        console.log("FCM failed:", fcmResult.error || "Unknown error");
      }
    } catch (fcmError: any) {
      console.error("FCM request failed:", fcmError.message);
      fcmResult = { ok: false, error: fcmError.message };
    }

    // Always return success - in-app notifications are handled separately by the frontend
    // FCM is just an optional push notification enhancement
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: fcmResult.ok 
          ? "Push notification sent successfully" 
          : "In-app notification will be created (FCM unavailable)",
        fcmSuccess: fcmResult.ok,
        fcmError: fcmResult.error || null,
        fcmData: fcmResult.data || null
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in push notification handler:", error);
    // Still return success for in-app notification flow
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "In-app notification will be created (push failed)",
        fcmSuccess: false,
        fcmError: error.message 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
