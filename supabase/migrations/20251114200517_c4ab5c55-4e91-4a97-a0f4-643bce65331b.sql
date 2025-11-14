-- Create portfolio_holdings table to store client portfolio data
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  stock_ticker text NOT NULL,
  stock_name text NOT NULL,
  sector text NOT NULL,
  region text NOT NULL,
  shares numeric NOT NULL,
  market_value numeric NOT NULL,
  volatility numeric NOT NULL,
  acquisition_date date NOT NULL,
  cost_basis numeric NOT NULL,
  portfolio_weight numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, stock_ticker)
);

-- Enable RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Enable all access for portfolio_holdings table"
ON public.portfolio_holdings
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_portfolio_holdings_client_id ON public.portfolio_holdings(client_id);
CREATE INDEX idx_portfolio_holdings_sector ON public.portfolio_holdings(sector);
CREATE INDEX idx_portfolio_holdings_region ON public.portfolio_holdings(region);