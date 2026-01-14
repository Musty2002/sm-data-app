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

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
    
    // Log for debugging
    console.log("Firebase Server Key configured:", !!firebaseServerKey);
    console.log("Firebase Server Key length:", firebaseServerKey?.length || 0);

    if (!firebaseServerKey) {
      console.error("FIREBASE_SERVER_KEY not configured");
      // Return success anyway - in-app notifications will still work
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "FCM not configured, but in-app notifications will work",
          fcmSkipped: true
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log(`Sending push notification: ${title}`);

    // Build FCM message payload
    const fcmPayload: any = {
      notification: {
        title,
        body: message,
        sound: "default",
        badge: "1",
      },
      data: {
        ...data,
        title,
        message,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    let results: any[] = [];

    // Send to specific tokens
    if (tokens && tokens.length > 0) {
      console.log(`Sending to ${tokens.length} device tokens`);
      
      // FCM allows up to 1000 tokens per request
      const batchSize = 1000;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Authorization": `key=${firebaseServerKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...fcmPayload,
            registration_ids: batch,
          }),
        });

        const result = await response.json();
        console.log("FCM batch response:", result);
        results.push(result);
      }
    } 
    // Send to a topic (all users subscribed to that topic)
    else if (topic) {
      console.log(`Sending to topic: ${topic}`);
      
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${firebaseServerKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fcmPayload,
          to: `/topics/${topic}`,
        }),
      });

      const result = await response.json();
      console.log("FCM topic response:", result);
      results.push(result);
    }
    // Send to all (broadcast topic)
    else {
      console.log("Sending to all users via 'all' topic");
      
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${firebaseServerKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fcmPayload,
          to: "/topics/all",
        }),
      });

      const result = await response.json();
      console.log("FCM broadcast response:", result);
      results.push(result);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Push notification sent successfully",
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
