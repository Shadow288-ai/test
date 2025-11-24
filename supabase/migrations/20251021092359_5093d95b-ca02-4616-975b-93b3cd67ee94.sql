-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Clients can view their own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Admins can insert holdings for any client" ON portfolio_holdings;
DROP POLICY IF EXISTS "Clients can insert their own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Admins can update all holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Clients can update their own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Clients can delete their own holdings" ON portfolio_holdings;

-- Create new PERMISSIVE policies (default)
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

-- Do the same for client_portfolios
DROP POLICY IF EXISTS "Admins can view all portfolios" ON client_portfolios;
DROP POLICY IF EXISTS "Clients can view their own portfolios" ON client_portfolios;
DROP POLICY IF EXISTS "Admins can insert portfolios for any client" ON client_portfolios;
DROP POLICY IF EXISTS "Clients can insert their own portfolios" ON client_portfolios;
DROP POLICY IF EXISTS "Admins can update all portfolios" ON client_portfolios;
DROP POLICY IF EXISTS "Clients can update their own portfolios" ON client_portfolios;
DROP POLICY IF EXISTS "Clients can delete their own portfolios" ON client_portfolios;

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