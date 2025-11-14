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

  // Risk Scoring Algorithm
  let riskScore = 0;

  // Factor 1: Volatility (0-40 points)
  // Higher volatility = higher risk
  if (avgVolatility > 30) riskScore += 40;
  else if (avgVolatility > 20) riskScore += 30;
  else if (avgVolatility > 15) riskScore += 20;
  else riskScore += 10;

  // Factor 2: Sector Concentration (0-30 points)
  // Higher concentration = higher risk
  if (sectorConcentration > 0.5) riskScore += 30;
  else if (sectorConcentration > 0.33) riskScore += 20;
  else if (sectorConcentration > 0.2) riskScore += 10;
  else riskScore += 5;

  // Factor 3: Geographic Concentration (0-30 points)
  if (regionConcentration > 0.6) riskScore += 30;
  else if (regionConcentration > 0.4) riskScore += 20;
  else if (regionConcentration > 0.25) riskScore += 10;
  else riskScore += 5;

  // Determine risk level based on total score (0-100)
  let riskLevel: RiskLevel;
  if (riskScore >= 70) riskLevel = 'High';
  else if (riskScore >= 40) riskLevel = 'Medium';
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
