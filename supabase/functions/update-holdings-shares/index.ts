import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HoldingUpdate {
  ticker: string;
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS for this admin operation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // CSV data from the uploaded file
    const updates: HoldingUpdate[] = [
      { ticker: 'AAPL', quantity: 100 },
      { ticker: 'MSFT', quantity: 50 },
      { ticker: 'GOOGL', quantity: 75 },
      { ticker: 'META', quantity: 30 },
      { ticker: 'NVDA', quantity: 25 },
      { ticker: 'AMD', quantity: 40 },
      { ticker: 'INTC', quantity: 100 },
      { ticker: 'AVGO', quantity: 10 },
      { ticker: 'CSCO', quantity: 80 },
      { ticker: 'ORCL', quantity: 60 },
      { ticker: 'ADBE', quantity: 20 },
      { ticker: 'CRM', quantity: 35 },
      { ticker: 'JNJ', quantity: 50 },
      { ticker: 'UNH', quantity: 20 },
      { ticker: 'PFE', quantity: 150 },
      { ticker: 'ABBV', quantity: 40 },
      { ticker: 'TMO', quantity: 18 },
      { ticker: 'ABT', quantity: 55 },
      { ticker: 'DHR', quantity: 28 },
      { ticker: 'LLY', quantity: 15 },
      { ticker: 'BMY', quantity: 85 },
      { ticker: 'AMGN', quantity: 25 },
      { ticker: 'JPM', quantity: 45 },
      { ticker: 'BAC', quantity: 180 },
      { ticker: 'WFC', quantity: 140 },
      { ticker: 'C', quantity: 120 },
      { ticker: 'GS', quantity: 18 },
      { ticker: 'MS', quantity: 65 },
      { ticker: 'BLK', quantity: 10 },
      { ticker: 'SCHW', quantity: 85 },
      { ticker: 'AXP', quantity: 38 },
      { ticker: 'USB', quantity: 135 },
      { ticker: 'AMZN', quantity: 40 },
      { ticker: 'TSLA', quantity: 25 },
      { ticker: 'HD', quantity: 20 },
      { ticker: 'MCD', quantity: 22 },
      { ticker: 'NKE', quantity: 55 },
      { ticker: 'SBUX', quantity: 62 },
      { ticker: 'TGT', quantity: 42 },
      { ticker: 'LOW', quantity: 28 },
      { ticker: 'PG', quantity: 42 },
      { ticker: 'KO', quantity: 105 },
      { ticker: 'PEP', quantity: 38 },
      { ticker: 'WMT', quantity: 115 },
      { ticker: 'COST', quantity: 12 },
      { ticker: 'MDLZ', quantity: 82 },
      { ticker: 'XOM', quantity: 55 },
      { ticker: 'CVX', quantity: 40 },
      { ticker: 'COP', quantity: 48 },
      { ticker: 'SLB', quantity: 102 },
      { ticker: 'EOG', quantity: 45 },
      { ticker: 'BA', quantity: 32 },
      { ticker: 'CAT', quantity: 22 },
      { ticker: 'GE', quantity: 55 },
      { ticker: 'MMM', quantity: 62 },
      { ticker: 'HON', quantity: 32 },
      { ticker: 'UPS', quantity: 38 },
      { ticker: 'LIN', quantity: 18 },
      { ticker: 'APD', quantity: 22 },
      { ticker: 'ECL', quantity: 32 },
      { ticker: 'SPY', quantity: 25 },
      { ticker: 'QQQ', quantity: 30 },
      { ticker: 'IWM', quantity: 50 },
      { ticker: 'DIA', quantity: 28 },
      { ticker: 'VTI', quantity: 40 },
      { ticker: 'VOO', quantity: 22 },
      { ticker: 'VEA', quantity: 200 },
      { ticker: 'VWO', quantity: 220 },
      { ticker: 'XLK', quantity: 55 },
      { ticker: 'XLF', quantity: 250 },
      { ticker: 'XLE', quantity: 110 },
      { ticker: 'XLV', quantity: 70 },
      { ticker: 'XLI', quantity: 90 },
      { ticker: 'XLY', quantity: 58 },
      { ticker: 'XLP', quantity: 125 },
      { ticker: 'XLU', quantity: 140 },
      { ticker: 'AGG', quantity: 90 },
      { ticker: 'BND', quantity: 120 },
      { ticker: 'TLT', quantity: 100 },
      { ticker: 'LQD', quantity: 82 },
      { ticker: 'EFA', quantity: 130 },
      { ticker: 'EEM', quantity: 220 },
      { ticker: 'IEMG', quantity: 180 },
      { ticker: 'ARKK', quantity: 195 },
      { ticker: 'ICLN', quantity: 420 },
      { ticker: 'BTC-USD', quantity: 0.5 },
      { ticker: 'ETH-USD', quantity: 2 },
      { ticker: 'BNB-USD', quantity: 10 },
      { ticker: 'XRP-USD', quantity: 5000 },
      { ticker: 'ADA-USD', quantity: 8000 },
      { ticker: 'SOL-USD', quantity: 25 },
      { ticker: 'DOT-USD', quantity: 400 },
      { ticker: 'DOGE-USD', quantity: 20000 },
      { ticker: 'MATIC-USD', quantity: 3500 },
      { ticker: 'AVAX-USD', quantity: 80 },
      { ticker: 'LINK-USD', quantity: 200 },
      { ticker: 'UNI-USD', quantity: 450 },
      { ticker: 'LTC-USD', quantity: 35 },
      { ticker: 'ATOM-USD', quantity: 300 },
      { ticker: 'XLM-USD', quantity: 15000 },
    ];

    let updatedCount = 0;
    const errors: string[] = [];

    for (const update of updates) {
      const { error } = await supabaseClient
        .from('portfolio_holdings')
        .update({ shares: update.quantity })
        .eq('stock_ticker', update.ticker);

      if (error) {
        errors.push(`${update.ticker}: ${error.message}`);
      } else {
        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updatedCount,
        totalAttempted: updates.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
