import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MINIMUM_WITHDRAWAL = 100;

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
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Get cashback wallet
    const { data: cashbackWallet, error: cashbackError } = await supabase
      .from('cashback_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (cashbackError || !cashbackWallet) {
      return new Response(JSON.stringify({ success: false, message: 'Cashback wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check minimum withdrawal amount
    if (cashbackWallet.balance < MINIMUM_WITHDRAWAL) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Minimum withdrawal amount is ₦${MINIMUM_WITHDRAWAL}. Your current cashback balance is ₦${cashbackWallet.balance}.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const withdrawAmount = cashbackWallet.balance;

    // Get main wallet
    const { data: mainWallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError || !mainWallet) {
      return new Response(JSON.stringify({ success: false, message: 'Main wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transfer from cashback to main wallet
    // 1. Deduct from cashback wallet
    const { error: deductError } = await supabase
      .from('cashback_wallets')
      .update({
        balance: 0,
        total_withdrawn: cashbackWallet.total_withdrawn + withdrawAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (deductError) {
      console.error('Error deducting from cashback wallet:', deductError);
      return new Response(JSON.stringify({ success: false, message: 'Failed to withdraw cashback' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Add to main wallet
    const { error: addError } = await supabase
      .from('wallets')
      .update({
        balance: mainWallet.balance + withdrawAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (addError) {
      console.error('Error adding to main wallet:', addError);
      // Rollback cashback deduction
      await supabase
        .from('cashback_wallets')
        .update({
          balance: withdrawAmount,
          total_withdrawn: cashbackWallet.total_withdrawn,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return new Response(JSON.stringify({ success: false, message: 'Failed to add to main wallet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Record cashback transaction
    await supabase
      .from('cashback_transactions')
      .insert({
        user_id: userId,
        amount: withdrawAmount,
        type: 'withdrawn',
        category: 'withdrawal',
        description: `Withdrawn ₦${withdrawAmount} cashback to main wallet`
      });

    // 4. Record main wallet transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: withdrawAmount,
        type: 'credit',
        category: 'deposit',
        description: `Cashback withdrawal`,
        status: 'completed'
      });

    console.log(`Successfully withdrew ₦${withdrawAmount} cashback for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully withdrawn ₦${withdrawAmount} to your main wallet`,
      amount: withdrawAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in withdraw-cashback function:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});