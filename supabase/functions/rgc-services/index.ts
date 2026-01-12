import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RGC_BASE_URL = 'https://api.rgcdata.com.ng';

interface ServiceRequest {
  action: 'get-services' | 'validate' | 'purchase';
  serviceType: 'airtime' | 'data' | 'cable' | 'electricity';
  // For purchases
  network?: string | number; // airtime network code / id
  amount?: number;
  mobile_number?: string;
  plan?: number; // product_id for data
  plan_id?: number; // product_id for cable
  smart_card_number?: string;
  discoid?: number; // product_id for electricity
  MeterType?: 'PREPAID' | 'POSTPAID';
  meter_number?: string;
  // For validation
  cable_name?: string;
}

async function makeRGCRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: object) {
  const apiKey = Deno.env.get('RGC_DATA_API_KEY');
  
  if (!apiKey) {
    throw new Error('RGC_DATA_API_KEY not configured');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  console.log(`Making RGC request to: ${RGC_BASE_URL}${endpoint}`);
  
  const response = await fetch(`${RGC_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  console.log(`RGC response status: ${response.status}`);
  console.log(`RGC response data:`, JSON.stringify(data));
  
  if (!response.ok && !data.success) {
    throw new Error(data.message || 'RGC API request failed');
  }
  
  return data;
}

async function getServices(serviceType: string) {
  const endpoint = `/api/v2/services/${serviceType}`;
  return await makeRGCRequest(endpoint);
}

async function validateCable(smartCardNumber: string, cableName: string) {
  const endpoint = `/api/v2/validation/cable?smart_card_number=${encodeURIComponent(smartCardNumber)}&cable_name=${encodeURIComponent(cableName)}`;
  return await makeRGCRequest(endpoint);
}

async function validateElectricity(meterNumber: string, discoid: number, meterType: string) {
  const endpoint = `/api/v2/validation/electricity?meter_number=${encodeURIComponent(meterNumber)}&discoid=${discoid}&meter_type=${encodeURIComponent(meterType)}`;
  return await makeRGCRequest(endpoint);
}

async function purchaseAirtime(network: string, amount: number, mobileNumber: string) {
  return await makeRGCRequest('/api/v2/purchase/airtime', 'POST', {
    network,
    amount,
    mobile_number: mobileNumber,
  });
}

async function purchaseData(plan: number, mobileNumber: string) {
  return await makeRGCRequest('/api/v2/purchase/data', 'POST', {
    plan,
    mobile_number: mobileNumber,
  });
}

async function purchaseCable(planId: number, smartCardNumber: string) {
  return await makeRGCRequest('/api/v2/purchase/cable', 'POST', {
    plan_id: planId,
    smart_card_number: smartCardNumber,
  });
}

async function purchaseElectricity(discoid: number, meterType: string, meterNumber: string, amount: number) {
  return await makeRGCRequest('/api/v2/purchase/electricity', 'POST', {
    discoid,
    MeterType: meterType,
    meter_number: meterNumber,
    amount,
  });
}

async function recordTransaction(
  supabase: any,
  userId: string,
  amount: number,
  category: string,
  description: string,
  status: 'completed' | 'pending' | 'failed',
  reference?: string | undefined,
  metadata?: object
) {
  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    amount,
    type: 'debit',
    category,
    description,
    status,
    reference,
    metadata,
  });

  if (error) {
    console.error('Error recording transaction:', error);
  }
}

async function deductFromWallet(supabase: any, userId: string, amount: number): Promise<boolean> {
  // Get current balance
  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (fetchError || !wallet) {
    console.error('Error fetching wallet:', fetchError);
    return false;
  }

  if (wallet.balance < amount) {
    return false; // Insufficient balance
  }

  // Deduct amount
  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance - amount, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error deducting from wallet:', updateError);
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    const body: ServiceRequest = await req.json();
    const { action, serviceType } = body;

    console.log(`Processing ${action} for ${serviceType}`, JSON.stringify(body));

    // Handle get-services - no auth required
    if (action === 'get-services') {
      const result = await getServices(serviceType);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle validation - no auth required
    if (action === 'validate') {
      let result;
      if (serviceType === 'cable' && body.smart_card_number && body.cable_name) {
        result = await validateCable(body.smart_card_number, body.cable_name);
      } else if (serviceType === 'electricity' && body.meter_number && body.discoid && body.MeterType) {
        result = await validateElectricity(body.meter_number, body.discoid, body.MeterType);
      } else {
        throw new Error('Invalid validation parameters');
      }
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle purchases - auth required
    if (action === 'purchase') {
      if (!userId) {
        return new Response(JSON.stringify({ success: false, message: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let result;
      let amount = 0;
      let description = '';

      try {
        if (serviceType === 'airtime') {
          if (body.network === undefined || body.amount === undefined || body.mobile_number === undefined) {
            throw new Error('Missing required fields for airtime purchase');
          }

          // network should be sent as a string per RGC API docs
          const networkValue = String(body.network);

          amount = body.amount;
          description = `Airtime purchase - ${body.mobile_number}`;

          // Check and deduct balance first
          const deducted = await deductFromWallet(supabase, userId, amount);
          if (!deducted) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient balance' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          result = await purchaseAirtime(networkValue, body.amount, body.mobile_number);
          await recordTransaction(
            supabase,
            userId,
            amount,
            'airtime',
            description,
            'completed',
            undefined,
            { mobile_number: body.mobile_number, network: networkValue }
          );

        } else if (serviceType === 'data') {
          if (!body.plan || !body.mobile_number || !body.amount) {
            throw new Error('Missing required fields for data purchase');
          }
          amount = body.amount;
          description = `Data purchase - ${body.mobile_number}`;

          const deducted = await deductFromWallet(supabase, userId, amount);
          if (!deducted) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient balance' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          result = await purchaseData(body.plan, body.mobile_number);
          await recordTransaction(supabase, userId, amount, 'data', description, 'completed', undefined, { mobile_number: body.mobile_number, plan: body.plan });

        } else if (serviceType === 'cable') {
          if (!body.plan_id || !body.smart_card_number || !body.amount) {
            throw new Error('Missing required fields for cable purchase');
          }
          amount = body.amount;
          description = `TV subscription - ${body.smart_card_number}`;

          const deducted = await deductFromWallet(supabase, userId, amount);
          if (!deducted) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient balance' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          result = await purchaseCable(body.plan_id, body.smart_card_number);
          await recordTransaction(supabase, userId, amount, 'tv', description, 'completed', undefined, { smart_card_number: body.smart_card_number, plan_id: body.plan_id });

        } else if (serviceType === 'electricity') {
          if (!body.discoid || !body.MeterType || !body.meter_number || !body.amount) {
            throw new Error('Missing required fields for electricity purchase');
          }
          amount = body.amount;
          description = `Electricity purchase - ${body.meter_number}`;

          const deducted = await deductFromWallet(supabase, userId, amount);
          if (!deducted) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient balance' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          result = await purchaseElectricity(body.discoid, body.MeterType, body.meter_number, body.amount);
          await recordTransaction(supabase, userId, amount, 'electricity', description, 'completed', undefined, { meter_number: body.meter_number, discoid: body.discoid, meter_type: body.MeterType });

        } else {
          throw new Error('Invalid service type');
        }

        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (purchaseError: any) {
        // If purchase fails after deduction, we need to refund
        console.error('Purchase failed:', purchaseError);
        
        // Record failed transaction
        await recordTransaction(supabase, userId, amount, serviceType === 'cable' ? 'tv' : serviceType, description, 'failed', undefined, { error: purchaseError.message });

        // Refund the wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (wallet) {
          await supabase
            .from('wallets')
            .update({ balance: wallet.balance + amount, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        return new Response(JSON.stringify({ success: false, message: purchaseError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in rgc-services function:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
