import { PortfolioHolding, ClientRiskScore, RiskLevel } from '@/types/portfolio';

/**
 * Rule-based risk scoring engine for client portfolios
 * Evaluates risk based on volatility, sector concentration, and geographic exposure
 */

export const calculateClientRiskScore = (holdings: PortfolioHolding[]): ClientRiskScore => {
  if (holdings.length === 0) {
    throw new Error('No holdings provided for risk calculation');
  }

  const clientId = holdings[0].Client_ID;
  const totalValue = holdings.reduce((sum, h) => sum + h.Market_Value, 0);
  const holdingsCount = holdings.length;

  // Calculate average volatility (weighted by portfolio weight)
  const avgVolatility = holdings.reduce(
    (sum, h) => sum + (h.Volatility * h.Portfolio_Weight) / 100,
    0
  );

  // Calculate sector concentration (Herfindahl index)
  const sectorMap = new Map<string, number>();
  holdings.forEach(h => {
    const current = sectorMap.get(h.Sector) || 0;
    sectorMap.set(h.Sector, current + h.Portfolio_Weight);
  });
  
  const sectorConcentration = Array.from(sectorMap.values()).reduce(
    (sum, weight) => sum + Math.pow(weight / 100, 2),
    0
  );

  const topSector = Array.from(sectorMap.entries()).sort((a, b) => b[1] - a[1])[0][0];

  // Calculate region concentration
  const regionMap = new Map<string, number>();
  holdings.forEach(h => {
    const current = regionMap.get(h.Region) || 0;
    regionMap.set(h.Region, current + h.Portfolio_Weight);
  });

  const regionConcentration = Array.from(regionMap.values()).reduce(
    (sum, weight) => sum + Math.pow(weight / 100, 2),
    0
  );

  const topRegion = Array.from(regionMap.entries()).sort((a, b) => b[1] - a[1])[0][0];

  // Risk Scoring Algorithm (0-100 scale)
  let riskScore = 0;

  // Factor 1: Volatility (0-25 points)
  // Adjusted thresholds for more realistic scoring
  if (avgVolatility > 40) riskScore += 25;
  else if (avgVolatility > 30) riskScore += 20;
  else if (avgVolatility > 25) riskScore += 15;
  else if (avgVolatility > 20) riskScore += 10;
  else if (avgVolatility > 15) riskScore += 5;
  else riskScore += 2;

  // Factor 2: Sector Concentration (0-20 points)
  // Herfindahl index: 1.0 = all in one sector, 0 = perfectly distributed
  if (sectorConcentration > 0.7) riskScore += 20;
  else if (sectorConcentration > 0.5) riskScore += 15;
  else if (sectorConcentration > 0.35) riskScore += 10;
  else if (sectorConcentration > 0.25) riskScore += 5;
  else riskScore += 2;

  // Factor 3: Geographic Concentration (0-20 points)
  if (regionConcentration > 0.8) riskScore += 20;
  else if (regionConcentration > 0.6) riskScore += 15;
  else if (regionConcentration > 0.45) riskScore += 10;
  else if (regionConcentration > 0.3) riskScore += 5;
  else riskScore += 2;

  // Factor 4: Portfolio Diversification (0-15 points)
  // Fewer holdings = higher concentration risk
  if (holdingsCount < 3) riskScore += 15;
  else if (holdingsCount < 5) riskScore += 10;
  else if (holdingsCount < 8) riskScore += 7;
  else if (holdingsCount < 12) riskScore += 4;
  else if (holdingsCount < 20) riskScore += 2;
  else riskScore += 0;

  // Factor 5: Individual Position Size Risk (0-20 points)
  // Check for oversized individual positions
  const maxPositionWeight = Math.max(...holdings.map(h => h.Portfolio_Weight));
  if (maxPositionWeight > 40) riskScore += 20;
  else if (maxPositionWeight > 30) riskScore += 15;
  else if (maxPositionWeight > 20) riskScore += 10;
  else if (maxPositionWeight > 15) riskScore += 6;
  else if (maxPositionWeight > 10) riskScore += 3;
  else riskScore += 0;
  
  // Determine risk level based on total score (0-100)
  // Adjusted thresholds for more realistic distribution
  let riskLevel: RiskLevel;
  if (riskScore >= 60) riskLevel = 'High';
  else if (riskScore >= 30) riskLevel = 'Medium';
  else riskLevel = 'Low';

  return {
    clientId,
    riskLevel,
    riskScore,
    totalValue,
    holdingsCount,
    avgVolatility: Number(avgVolatility.toFixed(2)),
    sectorConcentration: Number(sectorConcentration.toFixed(3)),
    topSector,
    regionConcentration: Number(regionConcentration.toFixed(3)),
    topRegion,
  };
};

export const calculateRiskForAllClients = (holdings: PortfolioHolding[]): ClientRiskScore[] => {
  const clientMap = new Map<string, PortfolioHolding[]>();
  
  holdings.forEach(holding => {
    const clientHoldings = clientMap.get(holding.Client_ID) || [];
    clientHoldings.push(holding);
    clientMap.set(holding.Client_ID, clientHoldings);
  });

  return Array.from(clientMap.values()).map(calculateClientRiskScore);
};
