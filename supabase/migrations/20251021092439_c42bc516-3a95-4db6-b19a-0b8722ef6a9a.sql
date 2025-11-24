-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'portfolio_holdings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON portfolio_holdings';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'client_portfolios') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON client_portfolios';
    END LOOP;
END $$;

-- Create new PERMISSIVE policies for portfolio_holdings
CREATE POLICY "Admins can view all holdings"
  ON portfolio_holdings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own holdings"
  ON portfolio_holdings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can insert holdings"
  ON portfolio_holdings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own holdings"
  ON portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can update holdings"
  ON portfolio_holdings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can update their own holdings"
  ON portfolio_holdings FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own holdings"
  ON portfolio_holdings FOR DELETE
  USING (auth.uid() = client_id);

-- Create new PERMISSIVE policies for client_portfolios
CREATE POLICY "Admins can view all portfolios"
  ON client_portfolios FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own portfolios"
  ON client_portfolios FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can insert portfolios"
  ON client_portfolios FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own portfolios"
  ON client_portfolios FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can update portfolios"
  ON client_portfolios FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can update their own portfolios"
  ON client_portfolios FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own portfolios"
  ON client_portfolios FOR DELETE
  USING (auth.uid() = client_id);