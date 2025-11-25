import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real stock prices
const STOCK_PRICES: Record<string, number> = {
  AAPL: 278.93, MSFT: 468.40, GOOGL: 325.91, META: 627.28, NVDA: 171.90,
  AMD: 197.73, INTC: 35.38, AVGO: 379.83, CSCO: 76.37, ORCL: 190.99,
  ADBE: 316.72, CRM: 228.93, JNJ: 207.08, UNH: 326.01, PFE: 25.765,
  ABBV: 232.37, TMO: 591.325, ABT: 127.76, DHR: 230.00, LLY: 1086.23,
  BMY: 49.11, AMGN: 339.18, JPM: 298.86, BAC: 52.30, WFC: 84.24,
  C: 100.81, GS: 789.48, MS: 162.87, BLK: 1021.50, SCHW: 90.04,
  AXP: 357.61, USB: 48.475, AMZN: 227.52, TSLA: 410.80, HD: 344.23,
  MCD: 309.04, NKE: 63.18, SBUX: 84.31, TGT: 85.80, LOW: 235.38,
  PG: 147.86, KO: 72.725, PEP: 146.38, WMT: 105.80, COST: 886.69,
  MDLZ: 56.52, XOM: 115.34, CVX: 149.27, COP: 86.49, SLB: 35.09,
  EOG: 104.87, BA: 178.01, CAT: 551.62, GE: 288.80, MMM: 171.63,
  HON: 189.45, UPS: 94.89, LIN: 407.67, APD: 257.97, ECL: 273.60,
  SPY: 667.66, QQQ: 600.40, IWM: 242.29, DIA: 466.25, VTI: 328.69,
  VOO: 614.32, VEA: 60.25, VWO: 53.49, XLK: 274.98, XLF: 250.12,
  XLE: 88.07, XLV: 157.56, XLI: 150.06, XLY: 230.11, XLP: 77.71,
  XLU: 88.69, AGG: 100.79, BND: 74.78, TLT: 90.46, LQD: 111.60,
  EFA: 93.30, EEM: 53.40, IEMG: 65.93, ARKK: 75.34, ICLN: 16.24,
  'BTC-USD': 86618.76, 'ETH-USD': 2977.57, 'BNB-USD': 843.31,
  'XRP-USD': 2.17, 'ADA-USD': 0.41, 'SOL-USD': 133.78, 'DOT-USD': 2.19,
  'DOGE-USD': 0.1466, 'MATIC-USD': 0.1333, 'AVAX-USD': 13.77,
  'LINK-USD': 12.72, 'UNI-USD': 5.92, 'LTC-USD': 83.78, 'ATOM-USD': 2.43,
  'XLM-USD': 0.2430,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch all holdings
    const { data: holdings, error: fetchError } = await supabaseClient
      .from('portfolio_holdings')
      .select('id, stock_ticker, shares');

    if (fetchError) {
      throw fetchError;
    }

    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No holdings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const holding of holdings) {
      const price = STOCK_PRICES[holding.stock_ticker];
      
      if (price) {
        const marketValue = Number(holding.shares) * price;
        
        const { error } = await supabaseClient
          .from('portfolio_holdings')
          .update({ market_value: marketValue })
          .eq('id', holding.id);

        if (error) {
          errors.push(`${holding.stock_ticker}: ${error.message}`);
        } else {
          updatedCount++;
        }
      } else {
        errors.push(`${holding.stock_ticker}: No price data available`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updatedCount,
        totalAttempted: holdings.length,
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
