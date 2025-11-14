export interface PortfolioHolding {
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
