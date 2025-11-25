// src/lib/priceUpdater.ts
import { supabase } from '@/integrations/supabase/client';
import { getRealStockPrice } from '@/data/stockPrices';

const ALPHAVANTAGE_API_KEY = import.meta.env
  .VITE_ALPHA_VANTAGE_API_KEY as string | undefined;

const HOLDINGS_TABLE = 'portfolio_holdings';
const PRICE_COLUMN = 'market_value';

type HoldingRow = {
  id: string;
  stock_ticker: string | null;
  shares: number | string | null;
};

async function getStockPrice(symbol: string): Promise<number | null> {
  // First try to get real price from our data
  const realPrice = getRealStockPrice(symbol);
  if (realPrice !== null) {
    console.log('[priceUpdater] Got real price for', symbol, '=', realPrice);
    return realPrice;
  }

  // Fallback to API if available
  if (!ALPHAVANTAGE_API_KEY) {
    console.error('[priceUpdater] VITE_ALPHA_VANTAGE_API_KEY is not set and no real price available');
    return null;
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${ALPHAVANTAGE_API_KEY}`;

  console.log('[priceUpdater] Fetching price from API for', symbol);

  const res = await fetch(url);
  if (!res.ok) {
    console.error('[priceUpdater] HTTP error for', symbol, res.status);
    return null;
  }

  const data = await res.json();

  if (data['Note'] || data['Error Message']) {
    console.warn('[priceUpdater] Alpha Vantage note/error for', symbol, data);
    return null;
  }

  const quote = data['Global Quote'];
  if (!quote) {
    console.warn('[priceUpdater] No Global Quote for', symbol, data);
    return null;
  }

  const priceStr = quote['05. price'];
  const price = priceStr ? Number(priceStr) : NaN;

  if (Number.isNaN(price)) {
    console.warn('[priceUpdater] Invalid price for', symbol, priceStr);
    return null;
  }

  console.log('[priceUpdater] Got API price for', symbol, '=', price);
  return price;
}

export type TopRefreshResult = {
  updatedSymbols: number;
  totalSymbols: number;
  errors: string[];
  prices: Record<string, number>; // per-share prices by ticker
};

/**
 * Refresh prices ONLY for the given tickers for the current user
 * and return a map of ticker -> latest per-share price.
 */
export async function refreshTopHoldingsPricesForCurrentUser(
  tickers: string[]
): Promise<TopRefreshResult> {
  console.log('[priceUpdater] === refreshTopHoldingsPricesForCurrentUser START ===');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('[priceUpdater] getUser error:', authError);
  }
  const user = authData?.user;
  if (!user) {
    console.error('[priceUpdater] Not authenticated, aborting');
    throw new Error('Not authenticated');
  }

  const cleanTickers = Array.from(
    new Set(tickers.filter((t) => !!t))
  ) as string[];

  if (cleanTickers.length === 0) {
    console.log('[priceUpdater] No tickers passed in, aborting');
    return { updatedSymbols: 0, totalSymbols: 0, errors: [], prices: {} };
  }

  console.log('[priceUpdater] Top tickers to refresh:', cleanTickers);

  const { data: holdings, error } = await supabase
    .from(HOLDINGS_TABLE)
    .select('id, stock_ticker, shares')
    .eq('client_id', user.id)
    .in('stock_ticker', cleanTickers);

  if (error) {
    console.error('[priceUpdater] Error fetching holdings:', error);
    throw error;
  }

  if (!holdings || holdings.length === 0) {
    console.log('[priceUpdater] No holdings found for these tickers');
    return { updatedSymbols: 0, totalSymbols: 0, errors: [], prices: {} };
  }

  const typedHoldings = holdings as HoldingRow[];

  let updatedSymbols = 0;
  const errors: string[] = [];
  const prices: Record<string, number> = {};

  for (const symbol of cleanTickers) {
    try {
      const pricePerShare = await getStockPrice(symbol);

      if (pricePerShare == null) {
        errors.push(`No price for ${symbol}`);
      } else {
        prices[symbol] = pricePerShare; // 👈 store price for the UI

        const rowsForSymbol = typedHoldings.filter(
          (h) => h.stock_ticker === symbol
        );

        console.log(
          `[priceUpdater] Updating ${rowsForSymbol.length} rows for`,
          symbol,
          'with price',
          pricePerShare
        );

        for (const row of rowsForSymbol) {
          const shares = Number(row.shares ?? 0);
          const newValue = pricePerShare * shares;

          const { error: updateError } = await supabase
            .from(HOLDINGS_TABLE)
            .update({ [PRICE_COLUMN]: newValue })
            .eq('id', row.id);

          if (updateError) {
            console.error(
              `[priceUpdater] UPDATE error for ${symbol} (row ${row.id})`,
              updateError
            );
            errors.push(
              `Update error for ${symbol} (row ${row.id}): ${updateError.message}`
            );
          } else {
            console.log(
              `[priceUpdater] Updated row ${row.id} market_value →`,
              newValue
            );
          }
        }

        updatedSymbols++;
      }
    } catch (e: any) {
      console.error('[priceUpdater] Exception processing symbol', symbol, e);
      errors.push(`Exception for ${symbol}: ${e.message || String(e)}`);
    }

    // adjust if needed for rate limit
    await new Promise((r) => setTimeout(r, 1000));
  }

  const summary: TopRefreshResult = {
    updatedSymbols,
    totalSymbols: cleanTickers.length,
    errors,
    prices,
  };

  console.log(
    '[priceUpdater] === refreshTopHoldingsPricesForCurrentUser DONE ===',
    summary
  );

  return summary;
}
