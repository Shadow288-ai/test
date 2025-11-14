-- Create a default portfolio for the client user
INSERT INTO client_portfolios (client_id, portfolio_name)
VALUES ('6399cdf9-c0d2-43a7-a928-d2f45de17dcc', 'My Portfolio')
ON CONFLICT DO NOTHING;

-- Add sample portfolio holdings for demo purposes
INSERT INTO portfolio_holdings (
  client_id, 
  portfolio_id, 
  stock_ticker, 
  stock_name, 
  sector, 
  region, 
  asset_type,
  shares, 
  market_value, 
  cost_basis, 
  portfolio_weight, 
  volatility, 
  acquisition_date,
  is_bullish
) 
SELECT 
  '6399cdf9-c0d2-43a7-a928-d2f45de17dcc',
  cp.id,
  ticker_data.ticker,
  ticker_data.name,
  ticker_data.sector,
  ticker_data.region,
  ticker_data.asset_type,
  ticker_data.shares,
  ticker_data.market_value,
  ticker_data.cost_basis,
  ticker_data.portfolio_weight,
  ticker_data.volatility,
  ticker_data.acquisition_date,
  ticker_data.is_bullish
FROM client_portfolios cp
CROSS JOIN (
  VALUES 
    ('AAPL', 'Apple Inc.', 'Technology', 'North America', 'Stock'::asset_type, 100, 17500, 150, 35.0, 18.5, '2024-01-15'::date, true),
    ('MSFT', 'Microsoft Corporation', 'Technology', 'North America', 'Stock'::asset_type, 75, 12750, 155, 25.5, 16.2, '2024-02-01'::date, true),
    ('GOOGL', 'Alphabet Inc.', 'Technology', 'North America', 'Stock'::asset_type, 50, 10000, 185, 20.0, 19.8, '2024-01-20'::date, true),
    ('JPM', 'JPMorgan Chase & Co.', 'Financials', 'North America', 'Stock'::asset_type, 60, 6000, 140, 12.0, 22.3, '2024-03-10'::date, false),
    ('JNJ', 'Johnson & Johnson', 'Healthcare', 'North America', 'Stock'::asset_type, 40, 3750, 155, 7.5, 12.1, '2024-02-15'::date, true)
) AS ticker_data(ticker, name, sector, region, asset_type, shares, market_value, cost_basis, portfolio_weight, volatility, acquisition_date, is_bullish)
WHERE cp.client_id = '6399cdf9-c0d2-43a7-a928-d2f45de17dcc'
ON CONFLICT (portfolio_id, stock_ticker) DO NOTHING;