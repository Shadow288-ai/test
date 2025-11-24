-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('client', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create asset type enum
CREATE TYPE public.asset_type AS ENUM ('Stock', 'ETF', 'Crypto');

-- Create client_portfolios table
CREATE TABLE public.client_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_name text NOT NULL DEFAULT 'My Portfolio',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, portfolio_name)
);

-- Enable RLS
ALTER TABLE public.client_portfolios ENABLE ROW LEVEL SECURITY;

-- Create portfolio_holdings table
CREATE TABLE public.portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.client_portfolios(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  asset_type asset_type NOT NULL,
  is_bullish boolean NOT NULL DEFAULT true,
  expected_sell_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for client_portfolios
CREATE POLICY "Clients can view their own portfolios"
  ON public.client_portfolios FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own portfolios"
  ON public.client_portfolios FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own portfolios"
  ON public.client_portfolios FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own portfolios"
  ON public.client_portfolios FOR DELETE
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all portfolios"
  ON public.client_portfolios FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert portfolios for any client"
  ON public.client_portfolios FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all portfolios"
  ON public.client_portfolios FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for portfolio_holdings
CREATE POLICY "Clients can view their own holdings"
  ON public.portfolio_holdings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own holdings"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own holdings"
  ON public.portfolio_holdings FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own holdings"
  ON public.portfolio_holdings FOR DELETE
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all holdings"
  ON public.portfolio_holdings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert holdings for any client"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all holdings"
  ON public.portfolio_holdings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_portfolios_updated_at
  BEFORE UPDATE ON public.client_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();