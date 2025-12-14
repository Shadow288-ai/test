import { describe, it, expect } from 'vitest';

import { getRealStockPrice, STOCK_PRICES } from '../data/stockPrices';

describe('getRealStockPrice', () => {
  it('should return the correct price for a known ticker', () => {
 
    const aaplPrice = STOCK_PRICES['AAPL'];
    expect(getRealStockPrice('AAPL')).toBe(aaplPrice);
  });

  it('should be case insensitive', () => {
    const msftPrice = STOCK_PRICES['MSFT'];
    expect(getRealStockPrice('msft')).toBe(msftPrice);
    expect(getRealStockPrice('mSfT')).toBe(msftPrice);
  });

  it('should return null for unknown tickers', () => {
    expect(getRealStockPrice('UNKNOWN_TICKER_999')).toBeNull();
  });

  it('should handle crypto tickers if present', () => {
    
    if (STOCK_PRICES['BTC-USD']) {
      expect(getRealStockPrice('BTC-USD')).toBe(STOCK_PRICES['BTC-USD']);
    }
  });
});
