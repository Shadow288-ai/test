// Stock sector and region mapping
const STOCK_INFO: Record<string, { sector: string; region: string; name: string }> = {
  // Technology
  AAPL: { sector: 'Technology', region: 'US', name: 'Apple Inc.' },
  MSFT: { sector: 'Technology', region: 'US', name: 'Microsoft Corp.' },
  GOOGL: { sector: 'Technology', region: 'US', name: 'Alphabet Inc.' },
  META: { sector: 'Technology', region: 'US', name: 'Meta Platforms Inc.' },
  NVDA: { sector: 'Technology', region: 'US', name: 'NVIDIA Corp.' },
  AMD: { sector: 'Technology', region: 'US', name: 'Advanced Micro Devices' },
  INTC: { sector: 'Technology', region: 'US', name: 'Intel Corp.' },
  AVGO: { sector: 'Technology', region: 'US', name: 'Broadcom Inc.' },
  CSCO: { sector: 'Technology', region: 'US', name: 'Cisco Systems Inc.' },
  ORCL: { sector: 'Technology', region: 'US', name: 'Oracle Corp.' },
  ADBE: { sector: 'Technology', region: 'US', name: 'Adobe Inc.' },
  CRM: { sector: 'Technology', region: 'US', name: 'Salesforce Inc.' },
  NOW: { sector: 'Technology', region: 'US', name: 'ServiceNow Inc.' },
  INTU: { sector: 'Technology', region: 'US', name: 'Intuit Inc.' },
  QCOM: { sector: 'Technology', region: 'US', name: 'Qualcomm Inc.' },
  TXN: { sector: 'Technology', region: 'US', name: 'Texas Instruments' },
  ADI: { sector: 'Technology', region: 'US', name: 'Analog Devices Inc.' },
  AMAT: { sector: 'Technology', region: 'US', name: 'Applied Materials' },
  LRCX: { sector: 'Technology', region: 'US', name: 'Lam Research' },
  KLAC: { sector: 'Technology', region: 'US', name: 'KLA Corp.' },
  
  // Healthcare
  JNJ: { sector: 'Healthcare', region: 'US', name: 'Johnson & Johnson' },
  UNH: { sector: 'Healthcare', region: 'US', name: 'UnitedHealth Group' },
  PFE: { sector: 'Healthcare', region: 'US', name: 'Pfizer Inc.' },
  ABBV: { sector: 'Healthcare', region: 'US', name: 'AbbVie Inc.' },
  TMO: { sector: 'Healthcare', region: 'US', name: 'Thermo Fisher Scientific' },
  ABT: { sector: 'Healthcare', region: 'US', name: 'Abbott Laboratories' },
  DHR: { sector: 'Healthcare', region: 'US', name: 'Danaher Corp.' },
  LLY: { sector: 'Healthcare', region: 'US', name: 'Eli Lilly and Co.' },
  BMY: { sector: 'Healthcare', region: 'US', name: 'Bristol-Myers Squibb' },
  AMGN: { sector: 'Healthcare', region: 'US', name: 'Amgen Inc.' },
  GILD: { sector: 'Healthcare', region: 'US', name: 'Gilead Sciences' },
  CVS: { sector: 'Healthcare', region: 'US', name: 'CVS Health Corp.' },
  CI: { sector: 'Healthcare', region: 'US', name: 'Cigna Corp.' },
  HUM: { sector: 'Healthcare', region: 'US', name: 'Humana Inc.' },
  REGN: { sector: 'Healthcare', region: 'US', name: 'Regeneron Pharmaceuticals' },
  
  // Financials
  JPM: { sector: 'Financials', region: 'US', name: 'JPMorgan Chase & Co.' },
  BAC: { sector: 'Financials', region: 'US', name: 'Bank of America' },
  WFC: { sector: 'Financials', region: 'US', name: 'Wells Fargo & Co.' },
  C: { sector: 'Financials', region: 'US', name: 'Citigroup Inc.' },
  GS: { sector: 'Financials', region: 'US', name: 'Goldman Sachs Group' },
  MS: { sector: 'Financials', region: 'US', name: 'Morgan Stanley' },
  BLK: { sector: 'Financials', region: 'US', name: 'BlackRock Inc.' },
  SCHW: { sector: 'Financials', region: 'US', name: 'Charles Schwab Corp.' },
  AXP: { sector: 'Financials', region: 'US', name: 'American Express Co.' },
  USB: { sector: 'Financials', region: 'US', name: 'U.S. Bancorp' },
  PNC: { sector: 'Financials', region: 'US', name: 'PNC Financial Services' },
  TFC: { sector: 'Financials', region: 'US', name: 'Truist Financial Corp.' },
  COF: { sector: 'Financials', region: 'US', name: 'Capital One Financial' },
  BK: { sector: 'Financials', region: 'US', name: 'Bank of New York Mellon' },
  STT: { sector: 'Financials', region: 'US', name: 'State Street Corp.' },
  
  // Add more sectors...
  AMZN: { sector: 'Consumer Discretionary', region: 'US', name: 'Amazon.com Inc.' },
  TSLA: { sector: 'Consumer Discretionary', region: 'US', name: 'Tesla Inc.' },
  HD: { sector: 'Consumer Discretionary', region: 'US', name: 'Home Depot Inc.' },
  MCD: { sector: 'Consumer Discretionary', region: 'US', name: 'McDonald\'s Corp.' },
  NKE: { sector: 'Consumer Discretionary', region: 'US', name: 'Nike Inc.' },
  SBUX: { sector: 'Consumer Discretionary', region: 'US', name: 'Starbucks Corp.' },
  TGT: { sector: 'Consumer Discretionary', region: 'US', name: 'Target Corp.' },
  LOW: { sector: 'Consumer Discretionary', region: 'US', name: 'Lowe\'s Companies' },
  TJX: { sector: 'Consumer Discretionary', region: 'US', name: 'TJX Companies Inc.' },
  BKNG: { sector: 'Consumer Discretionary', region: 'US', name: 'Booking Holdings Inc.' },
  MAR: { sector: 'Consumer Discretionary', region: 'US', name: 'Marriott International' },
  ABNB: { sector: 'Consumer Discretionary', region: 'US', name: 'Airbnb Inc.' },
  
  PG: { sector: 'Consumer Staples', region: 'US', name: 'Procter & Gamble Co.' },
  KO: { sector: 'Consumer Staples', region: 'US', name: 'Coca-Cola Co.' },
  PEP: { sector: 'Consumer Staples', region: 'US', name: 'PepsiCo Inc.' },
  WMT: { sector: 'Consumer Staples', region: 'US', name: 'Walmart Inc.' },
  COST: { sector: 'Consumer Staples', region: 'US', name: 'Costco Wholesale' },
  
  XOM: { sector: 'Energy', region: 'US', name: 'Exxon Mobil Corp.' },
  CVX: { sector: 'Energy', region: 'US', name: 'Chevron Corp.' },
  COP: { sector: 'Energy', region: 'US', name: 'ConocoPhillips' },
  
  BA: { sector: 'Industrials', region: 'US', name: 'Boeing Co.' },
  CAT: { sector: 'Industrials', region: 'US', name: 'Caterpillar Inc.' },
  GE: { sector: 'Industrials', region: 'US', name: 'General Electric Co.' },
  MMM: { sector: 'Industrials', region: 'US', name: '3M Co.' },
  HON: { sector: 'Industrials', region: 'US', name: 'Honeywell International' },
  UPS: { sector: 'Industrials', region: 'US', name: 'United Parcel Service' },
  
  MDLZ: { sector: 'Consumer Staples', region: 'US', name: 'Mondelez International' },
  SLB: { sector: 'Energy', region: 'US', name: 'Schlumberger NV' },
  EOG: { sector: 'Energy', region: 'US', name: 'EOG Resources Inc.' },
  LIN: { sector: 'Materials', region: 'US', name: 'Linde PLC' },
  APD: { sector: 'Materials', region: 'US', name: 'Air Products & Chemicals' },
  ECL: { sector: 'Materials', region: 'US', name: 'Ecolab Inc.' },
  
  // ETFs - Broad Market
  SPY: { sector: 'ETF - Broad Market', region: 'US', name: 'SPDR S&P 500 ETF' },
  QQQ: { sector: 'ETF - Broad Market', region: 'US', name: 'Invesco QQQ Trust' },
  IWM: { sector: 'ETF - Broad Market', region: 'US', name: 'iShares Russell 2000 ETF' },
  DIA: { sector: 'ETF - Broad Market', region: 'US', name: 'SPDR Dow Jones Industrial Average ETF' },
  VTI: { sector: 'ETF - Broad Market', region: 'US', name: 'Vanguard Total Stock Market ETF' },
  VOO: { sector: 'ETF - Broad Market', region: 'US', name: 'Vanguard S&P 500 ETF' },
  VEA: { sector: 'ETF - International', region: 'Global', name: 'Vanguard FTSE Developed Markets ETF' },
  VWO: { sector: 'ETF - Emerging Markets', region: 'Global', name: 'Vanguard FTSE Emerging Markets ETF' },
  
  // ETFs - Sector Specific
  XLK: { sector: 'ETF - Technology', region: 'US', name: 'Technology Select Sector SPDR Fund' },
  XLF: { sector: 'ETF - Financials', region: 'US', name: 'Financial Select Sector SPDR Fund' },
  XLE: { sector: 'ETF - Energy', region: 'US', name: 'Energy Select Sector SPDR Fund' },
  XLV: { sector: 'ETF - Healthcare', region: 'US', name: 'Health Care Select Sector SPDR Fund' },
  XLI: { sector: 'ETF - Industrials', region: 'US', name: 'Industrial Select Sector SPDR Fund' },
  XLY: { sector: 'ETF - Consumer Discretionary', region: 'US', name: 'Consumer Discretionary Select Sector SPDR Fund' },
  XLP: { sector: 'ETF - Consumer Staples', region: 'US', name: 'Consumer Staples Select Sector SPDR Fund' },
  XLU: { sector: 'ETF - Utilities', region: 'US', name: 'Utilities Select Sector SPDR Fund' },
  
  // ETFs - Bond & Fixed Income
  AGG: { sector: 'ETF - Bonds', region: 'US', name: 'iShares Core U.S. Aggregate Bond ETF' },
  BND: { sector: 'ETF - Bonds', region: 'US', name: 'Vanguard Total Bond Market ETF' },
  TLT: { sector: 'ETF - Bonds', region: 'US', name: 'iShares 20+ Year Treasury Bond ETF' },
  LQD: { sector: 'ETF - Bonds', region: 'US', name: 'iShares iBoxx Investment Grade Corporate Bond ETF' },
  
  // ETFs - International & Emerging
  EFA: { sector: 'ETF - International', region: 'Global', name: 'iShares MSCI EAFE ETF' },
  EEM: { sector: 'ETF - Emerging Markets', region: 'Global', name: 'iShares MSCI Emerging Markets ETF' },
  IEMG: { sector: 'ETF - Emerging Markets', region: 'Global', name: 'iShares Core MSCI Emerging Markets ETF' },
  
  // ETFs - Thematic
  ARKK: { sector: 'ETF - Innovation', region: 'US', name: 'ARK Innovation ETF' },
  ICLN: { sector: 'ETF - Clean Energy', region: 'Global', name: 'iShares Global Clean Energy ETF' },
  
  // Cryptocurrency
  'BTC-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Bitcoin' },
  'ETH-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Ethereum' },
  'BNB-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Binance Coin' },
  'XRP-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Ripple' },
  'ADA-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Cardano' },
  'SOL-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Solana' },
  'DOT-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Polkadot' },
  'DOGE-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Dogecoin' },
  'MATIC-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Polygon' },
  'AVAX-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Avalanche' },
  'LINK-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Chainlink' },
  'UNI-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Uniswap' },
  'LTC-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Litecoin' },
  'ATOM-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Cosmos' },
  'XLM-USD': { sector: 'Cryptocurrency', region: 'Global', name: 'Stellar' },
};

export const getStockInfo = (ticker: string) => {
  return STOCK_INFO[ticker.toUpperCase()] || {
    sector: 'Unknown',
    region: 'US',
    name: ticker,
  };
};

// Fetch current stock price with better fallback logic
export const fetchCurrentPrice = async (ticker: string): Promise<number> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
      body: { ticker, type: 'current' }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data.price) {
      throw new Error('No price data returned');
    }

    return data.price;
  } catch (error) {
    console.warn(`Failed to fetch from Polygon.io for ${ticker}, using fallback`, error);
    
    // Fallback: generate realistic simulated price based on asset type
    const stockInfo = getStockInfo(ticker);
    
    // Crypto prices (high value)
    if (ticker.includes('-USD')) {
      if (ticker.includes('BTC')) return 45000 + Math.random() * 5000;
      if (ticker.includes('ETH')) return 2500 + Math.random() * 500;
      return 50 + Math.random() * 200;
    }
    
    // ETF prices (moderate value)
    if (stockInfo.sector.includes('ETF')) {
      return 100 + Math.random() * 300;
    }
    
    // Regular stock prices
    return 50 + Math.random() * 450;
  }
};

// Fetch historical data with better fallback and error handling
export const fetchHistoricalData = async (ticker: string, days: number = 30) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
      body: { ticker, type: 'historical' }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data.data) {
      throw new Error('No historical data returned');
    }

    return data.data.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString(),
      price: item.price
    }));
  } catch (error) {
    console.warn(`Failed to fetch historical data for ${ticker}, using simulated data`, error);
    
    // Generate realistic simulated historical data
    const currentPrice = await fetchCurrentPrice(ticker);
    const volatility = 0.02; // 2% daily volatility
    
    return Array.from({ length: days }, (_, i) => {
      const daysAgo = days - i;
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = currentPrice * (1 + randomChange * Math.sqrt(daysAgo));
      
      return {
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: Math.max(price, 1),
      };
    });
  }
};

// Calculate volatility from historical prices
export const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 15;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualized volatility (assuming 252 trading days)
  return stdDev * Math.sqrt(252) * 100;
};
