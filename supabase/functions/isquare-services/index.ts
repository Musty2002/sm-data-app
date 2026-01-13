import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ISQUARE_BASE_URL = 'https://isquaredata.com/api';

interface ServiceRequest {
  action: 'get-services' | 'purchase';
  serviceType: 'data' | 'airtime';
  // For purchases
  plan?: number; // plan id for data
  phone_number?: string;
  amount?: number;
  plan_name?: string; // plan name for cashback calculation
  network?: number; // network id for airtime
}

async function makeISquareRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: object) {
  const username = Deno.env.get('ISQUARE_USERNAME');
  const password = Deno.env.get('ISQUARE_PASSWORD');
  
  if (!username || !password) {
    throw new Error('iSquare API credentials not configured');
  }

  const credentials = btoa(`${username}:${password}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  console.log(`Making iSquare request to: ${ISQUARE_BASE_URL}${endpoint}`);
  
  const response = await fetch(`${ISQUARE_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  console.log(`iSquare response status: ${response.status}`);
  console.log(`iSquare response data:`, JSON.stringify(data));
  
  if (!response.ok) {
    throw new Error(data.message || data.detail || 'iSquare API request failed');
  }
  
  return data;
}

async function getDataServices() {
  return await makeISquareRequest('/data/services/');
}

async function purchaseData(planId: number, phoneNumber: string, reference: string) {
  return await makeISquareRequest('/data/buy/', 'POST', {
    plan: planId,
    phone_number: phoneNumber,
    reference,
    disable_validation: false,
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
    return false;
  }

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

// Calculate cashback for data (5 naira per 1GB)
function calculateCashback(dataSizeGB: number): number {
  return Math.floor(dataSizeGB) * 5;
}

// Add cashback to user's cashback wallet
async function addCashback(
  supabase: any,
  userId: string,
  amount: number,
  category: string,
  transactionDescription: string
): Promise<boolean> {
  if (amount <= 0) return true;

  try {
    let { data: cashbackWallet, error: fetchError } = await supabase
      .from('cashback_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !cashbackWallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('cashback_wallets')
        .insert({ user_id: userId, balance: 0, total_earned: 0, total_withdrawn: 0 })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating cashback wallet:', createError);
        return false;
      }
      cashbackWallet = newWallet;
    }

    const { error: updateError } = await supabase
      .from('cashback_wallets')
      .update({
        balance: cashbackWallet.balance + amount,
        total_earned: cashbackWallet.total_earned + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating cashback wallet:', updateError);
      return false;
    }

    await supabase
      .from('cashback_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'earned',
        category,
        description: `Cashback from ${transactionDescription}`
      });

    console.log(`Added ${amount} naira cashback for ${category} purchase`);
    return true;
  } catch (error) {
    console.error('Error adding cashback:', error);
    return false;
  }
}

// Process referral bonus when user buys >= 1GB data
async function processReferralBonus(supabase: any, userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single();

    if (!profile || !profile.referred_by) {
      return;
    }

    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referee_id', profile.id)
      .eq('referrer_id', profile.referred_by)
      .single();

    if (!referral || referral.status === 'completed' || referral.status === 'bonus_paid') {
      return;
    }

    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('id', profile.referred_by)
      .single();

    if (!referrerProfile) {
      return;
    }

    const referrerBonus = referral.referrer_bonus || 200;
    const refereeBonus = referral.referee_bonus || 100;

    // Credit referrer's wallet
    const { data: referrerWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', referrerProfile.user_id)
      .single();

    if (referrerWallet) {
      await supabase
        .from('wallets')
        .update({ 
          balance: referrerWallet.balance + referrerBonus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', referrerProfile.user_id);

      await supabase.from('transactions').insert({
        user_id: referrerProfile.user_id,
        amount: referrerBonus,
        type: 'credit',
        category: 'referral_bonus',
        description: 'Referral bonus - friend bought data',
        status: 'completed',
      });
    }

    // Credit referee's wallet
    const { data: refereeWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (refereeWallet) {
      await supabase
        .from('wallets')
        .update({ 
          balance: refereeWallet.balance + refereeBonus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      await supabase.from('transactions').insert({
        user_id: userId,
        amount: refereeBonus,
        type: 'credit',
        category: 'referral_bonus',
        description: 'Welcome bonus for first data purchase',
        status: 'completed',
      });
    }

    await supabase
      .from('referrals')
      .update({ 
        status: 'completed',
        bonus_paid_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    console.log(`Referral bonus paid: Referrer ${referrerBonus}, Referee ${refereeBonus}`);
  } catch (error) {
    console.error('Error processing referral bonus:', error);
  }
}

// Extract data size from plan name
function extractDataSizeGB(planName: string): number {
  const gbMatch = planName.match(/(\d+\.?\d*)\s*GB/i);
  if (gbMatch) {
    return parseFloat(gbMatch[1]);
  }
  
  const mbMatch = planName.match(/(\d+\.?\d*)\s*MB/i);
  if (mbMatch) {
    return parseFloat(mbMatch[1]) / 1024;
  }
  
  return 0;
}

// Services to include from iSquare (cheaper rates)
const ISQUARE_SERVICE_IDS = [
  7,  // MTN CORPORATE DATA
  12, // MTN DIRECT COUPON
  17, // MTN SMART DATA (AWOOF)
  6,  // 9MOBILE SME DATA
  16, // GLO AWOOF
];

// Transform iSquare data format to match RGC format for compatibility
function transformISquareDataServices(data: any[]) {
  const transformed: any[] = [];
  
  for (const service of data) {
    // Only include services we want from iSquare
    if (!ISQUARE_SERVICE_IDS.includes(service.id)) {
      continue;
    }
    
    const serviceName = service.name?.toUpperCase() || '';
    
    for (const plan of service.plans || []) {
      if (!plan.is_active) continue;
      
      // Determine category name based on service
      let category = serviceName;
      let network = 'MTN';
      
      if (service.id === 7) {
        category = 'MTN CORPORATE';
        network = 'MTN';
      } else if (service.id === 12) {
        category = 'MTN DIRECT COUPON';
        network = 'MTN';
      } else if (service.id === 17) {
        category = 'MTN AWOOF DATA';
        network = 'MTN';
      } else if (service.id === 6) {
        category = '9MOBILE SME';
        network = '9MOBILE';
      } else if (service.id === 16) {
        category = 'GLO AWOOF';
        network = 'GLO';
      }
      
      transformed.push({
        id: plan.id,
        product_id: plan.id,
        service: 'Data',
        amount: plan.reseller_amount, // Use reseller price (selling price)
        name: plan.name,
        category: category,
        available: plan.is_active,
        provider: 'isquare',
        network: network,
      });
    }
  }
  
  return transformed;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Handle get-services
    if (action === 'get-services') {
      if (serviceType === 'data') {
        const result = await getDataServices();
        const transformed = transformISquareDataServices(result);
        return new Response(JSON.stringify({ success: true, data: transformed }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Unsupported service type for iSquare');
    }

    // Handle purchases - auth required
    if (action === 'purchase') {
      if (!userId) {
        return new Response(JSON.stringify({ success: false, message: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let amount = 0;
      let description = '';

      try {
        if (serviceType === 'data') {
          if (!body.plan || !body.phone_number || !body.amount) {
            throw new Error('Missing required fields for data purchase');
          }
          
          amount = body.amount;
          description = `Data purchase - ${body.phone_number}`;
          const reference = `ISQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Deduct from wallet first
          const deducted = await deductFromWallet(supabase, userId, amount);
          if (!deducted) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient balance' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const result = await purchaseData(body.plan, body.phone_number, reference);
          
          const planName = body.plan_name || '';
          const dataSizeGB = extractDataSizeGB(planName);
          
          await recordTransaction(
            supabase, 
            userId, 
            amount, 
            'data', 
            description, 
            result.status === 'success' ? 'completed' : 'pending',
            result.reference || reference, 
            { 
              mobile_number: body.phone_number, 
              plan: body.plan, 
              plan_name: planName,
              provider: 'isquare'
            }
          );

          // Calculate and add cashback
          const dataCashback = calculateCashback(dataSizeGB);
          if (dataSizeGB >= 1) {
            await processReferralBonus(supabase, userId);
          }
          if (dataCashback > 0) {
            await addCashback(supabase, userId, dataCashback, 'data', description);
          }

          return new Response(JSON.stringify({ 
            success: true, 
            data: result,
            reference: result.reference || reference 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('Unsupported service type for iSquare purchase');
        }

      } catch (purchaseError: any) {
        console.error('Purchase failed:', purchaseError);
        
        await recordTransaction(
          supabase, 
          userId, 
          amount, 
          serviceType, 
          description, 
          'failed', 
          undefined, 
          { error: purchaseError.message, provider: 'isquare' }
        );

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
    console.error('Error in isquare-services function:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
