import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YahooQuoteResponse {
  quoteResponse: {
    result: Array<{
      symbol: string;
      regularMarketPrice?: number;
      regularMarketPreviousClose?: number;
    }>;
  };
}

async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    
    console.log(`[update-stock-prices] Fetching price for ${symbol}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      console.error(`[update-stock-prices] HTTP error for ${symbol}: ${response.status}`);
      return null;
    }

    const data: YahooQuoteResponse = await response.json();
    
    if (!data.quoteResponse?.result?.[0]) {
      console.warn(`[update-stock-prices] No data for ${symbol}`);
      return null;
    }

    const quote = data.quoteResponse.result[0];
    const price = quote.regularMarketPrice ?? quote.regularMarketPreviousClose;

    if (!price || isNaN(price)) {
      console.warn(`[update-stock-prices] Invalid price for ${symbol}`);
      return null;
    }

    console.log(`[update-stock-prices] Got price for ${symbol}: $${price}`);
    return price;
  } catch (error) {
    console.error(`[update-stock-prices] Error fetching ${symbol}:`, error);
    return null;
  }
}

async function processBatch(
  supabaseClient: any,
  tickers: string[],
  batchNumber: number,
  totalBatches: number
): Promise<{ updated: number; errors: string[] }> {
  console.log(`[update-stock-prices] Processing batch ${batchNumber}/${totalBatches} (${tickers.length} tickers)`);
  
  let updated = 0;
  const errors: string[] = [];

  for (const ticker of tickers) {
    try {
      const price = await fetchYahooPrice(ticker);

      if (price === null) {
        errors.push(`No price data for ${ticker}`);
        continue;
      }

      // Get all holdings for this ticker
      const { data: holdings, error: fetchError } = await supabaseClient
        .from('portfolio_holdings')
        .select('id, shares')
        .eq('stock_ticker', ticker);

      if (fetchError) {
        console.error(`[update-stock-prices] Error fetching holdings for ${ticker}:`, fetchError);
        errors.push(`DB error for ${ticker}: ${fetchError.message}`);
        continue;
      }

      if (!holdings || holdings.length === 0) {
        console.log(`[update-stock-prices] No holdings found for ${ticker}`);
        continue;
      }

      // Update each holding
      for (const holding of holdings) {
        const marketValue = price * (holding.shares || 0);

        const { error: updateError } = await supabaseClient
          .from('portfolio_holdings')
          .update({ market_value: marketValue })
          .eq('id', holding.id);

        if (updateError) {
          console.error(`[update-stock-prices] Error updating holding ${holding.id}:`, updateError);
          errors.push(`Update error for ${ticker} (${holding.id}): ${updateError.message}`);
        } else {
          updated++;
          console.log(`[update-stock-prices] Updated ${ticker} holding ${holding.id}: $${marketValue}`);
        }
      }

      // Small delay between individual ticker requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`[update-stock-prices] Exception processing ${ticker}:`, error);
      errors.push(`Exception for ${ticker}: ${error.message}`);
    }
  }

  return { updated, errors };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[update-stock-prices] === Starting stock price update ===');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all unique tickers from holdings
    const { data: holdings, error: holdingsError } = await supabaseClient
      .from('portfolio_holdings')
      .select('stock_ticker')
      .not('stock_ticker', 'is', null);

    if (holdingsError) {
      throw new Error(`Failed to fetch holdings: ${holdingsError.message}`);
    }

    if (!holdings || holdings.length === 0) {
      console.log('[update-stock-prices] No holdings found');
      return new Response(
        JSON.stringify({ message: 'No holdings to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get unique tickers
    const uniqueTickers = Array.from(
      new Set(holdings.map((h: any) => h.stock_ticker).filter(Boolean))
    );

    console.log(`[update-stock-prices] Found ${uniqueTickers.length} unique tickers`);

    // Batch processing - 10 tickers per batch to avoid throttling
    const BATCH_SIZE = 10;
    const batches: string[][] = [];
    
    for (let i = 0; i < uniqueTickers.length; i += BATCH_SIZE) {
      batches.push(uniqueTickers.slice(i, i + BATCH_SIZE));
    }

    console.log(`[update-stock-prices] Processing ${batches.length} batches of ${BATCH_SIZE} tickers`);

    let totalUpdated = 0;
    const allErrors: string[] = [];

    // Process batches with delays between them
    for (let i = 0; i < batches.length; i++) {
      const { updated, errors } = await processBatch(
        supabaseClient,
        batches[i],
        i + 1,
        batches.length
      );

      totalUpdated += updated;
      allErrors.push(...errors);

      // Delay between batches (except after the last one)
      if (i < batches.length - 1) {
        console.log('[update-stock-prices] Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const result = {
      message: 'Stock prices update completed',
      totalTickers: uniqueTickers.length,
      totalUpdated,
      batches: batches.length,
      errors: allErrors.length > 0 ? allErrors.slice(0, 10) : [], // Limit errors in response
      timestamp: new Date().toISOString(),
    };

    console.log('[update-stock-prices] === Update completed ===', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('[update-stock-prices] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
