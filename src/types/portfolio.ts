export type AssetType = 'Stock' | 'ETF' | 'Crypto';
export type AppRole = 'admin' | 'client';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface ClientPortfolio {
  id: string;
  client_id: string;
  portfolio_name: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHolding {
  id: string;
  client_id: string;
  portfolio_id: string;
  stock_ticker: string;
  stock_name: string;
  sector: string;
  region: string;
  asset_type: AssetType;
  shares: number;
  market_value: number;
  cost_basis: number;
  portfolio_weight: number;
  volatility: number;
  acquisition_date: string;
  expected_sell_date: string | null;
  is_bullish: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility with existing code
export interface LegacyPortfolioHolding {
  Client_ID: string;
  Stock_Ticker: string;
  Stock_Name: string;
  Sector: string;
  Region: string;
  Shares: number;
  Market_Value: number;
  Volatility: number;
  Acquisition_Date: string;
  Cost_Basis: number;
  Portfolio_Weight: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ClientRiskScore {
  clientId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  totalValue: number;
  holdingsCount: number;
  avgVolatility: number;
  sectorConcentration: number;
  topSector: string;
  regionConcentration: number;
  topRegion: string;
}

export interface RiskMetrics {
  totalClients: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  totalAUM: number;
  avgRiskScore: number;
}
