import { calculateClientRiskScore } from '../utils/riskScoring';
import { describe, it, expect } from 'vitest';

const lowRiskHoldings = [{
  ClientID: '1',
  StockTicker: 'AAPL',
  StockName: 'Apple',
  Sector: 'Technology',
  Region: 'US',
  Shares: 10,
  MarketValue: 1000,
  Volatility: 10,
  AcquisitionDate: '2024-01-01',
  CostBasis: 900,
  PortfolioWeight: 100,
}];

describe('calculateClientRiskScore', () => {
  it('should assign low risk for low volatility', () => {
    // dei kommentarer hei drenner mussen bleiwen vier warnings ze ignoren
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = calculateClientRiskScore(lowRiskHoldings as any);
    expect(res.riskLevel).toBe('Low');
    expect(res.riskScore).toBeLessThan(40);
  });

  it('should throw if no holdings', () => {
    expect(() => calculateClientRiskScore([])).toThrow('No holdings provided');
  });
});
