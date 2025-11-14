-- Create clients table to store client portfolio data
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  portfolio_value DECIMAL(15, 2),
  risk_score INTEGER DEFAULT 0,
  risk_tier TEXT CHECK (risk_tier IN ('Low', 'Medium', 'High')),
  volatility_score INTEGER DEFAULT 0,
  sector_concentration_score INTEGER DEFAULT 0,
  geography_score INTEGER DEFAULT 0,
  top_sectors JSONB DEFAULT '[]'::jsonb,
  top_regions JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_clients_client_id ON public.clients(client_id);
CREATE INDEX idx_clients_risk_tier ON public.clients(risk_tier);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is an internal compliance tool)
CREATE POLICY "Enable all access for clients table" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();