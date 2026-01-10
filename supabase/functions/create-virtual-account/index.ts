import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateVirtualAccountRequest {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paymentPointApiSecret = Deno.env.get("PAYMENTPOINT_API_SECRET")!;
    const paymentPointApiKey = Deno.env.get("PAYMENTPOINT_API_KEY")!;
    const paymentPointBusinessId = Deno.env.get("PAYMENTPOINT_BUSINESS_ID")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, name, phoneNumber }: CreateVirtualAccountRequest = await req.json();

    console.log(`Creating virtual account for user: ${userId}, email: ${email}`);

    // Call PaymentPoint API to create virtual account
    const paymentPointResponse = await fetch("https://api.paymentpoint.co/api/v1/createVirtualAccount", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paymentPointApiSecret}`,
        "Content-Type": "application/json",
        "api-key": paymentPointApiKey,
      },
      body: JSON.stringify({
        email: email,
        name: name,
        phoneNumber: phoneNumber,
        bankCode: ["20946"], // PalmPay
        businessId: paymentPointBusinessId,
      }),
    });

    const paymentPointData = await paymentPointResponse.json();
    console.log("PaymentPoint response:", JSON.stringify(paymentPointData));

    if (paymentPointData.status !== "success") {
      console.error("PaymentPoint error:", paymentPointData);
      return new Response(
        JSON.stringify({ error: "Failed to create virtual account", details: paymentPointData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first bank account from the response
    const bankAccount = paymentPointData.bankAccounts?.[0];
    if (!bankAccount) {
      console.error("No bank account in response");
      return new Response(
        JSON.stringify({ error: "No bank account returned from PaymentPoint" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the user's profile with the virtual account number
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        account_number: bankAccount.accountNumber,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully created virtual account: ${bankAccount.accountNumber} for user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        accountName: bankAccount.accountName,
        customerId: paymentPointData.customer?.customer_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error creating virtual account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
