import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { usePortfolioStore } from '../store/portfolioStore';

const mockHolding = {
  Client_ID: '1',
  Stock_Ticker: 'AAPL',
  Stock_Name: 'Apple Inc',
  Sector: 'Technology',
  Region: 'US',
  Shares: 10,
  Market_Value: 1500,
  Volatility: 20,
  Acquisition_Date: '2024-01-01',
  Cost_Basis: 1400,
  Portfolio_Weight: 10,
};

const mockRiskScore = {
  clientId: '1',
  riskLevel: 'Low' as const,
  riskScore: 30,
  totalValue: 10000,
  holdingsCount: 5,
  avgVolatility: 15,
  sectorConcentration: 20,
  topSector: 'Tech',
  regionConcentration: 10,
  topRegion: 'US',
};

describe('usePortfolioStore', () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearData();
    });
  });

  it('should start with empty initial state', () => {
    const state = usePortfolioStore.getState();
    expect(state.holdings).toEqual([]);
    expect(state.riskScores).toEqual([]);
  });

  it('should update holdings', () => {
    act(() => {
      usePortfolioStore.getState().setHoldings([mockHolding]);
    });
    
    const state = usePortfolioStore.getState();
    expect(state.holdings).toHaveLength(1);
    expect(state.holdings[0].Stock_Ticker).toBe('AAPL');
  });

  it('should update risk scores', () => {
    act(() => {
      usePortfolioStore.getState().setRiskScores([mockRiskScore]);
    });

    const state = usePortfolioStore.getState();
    expect(state.riskScores).toHaveLength(1);
    expect(state.riskScores[0].riskLevel).toBe('Low');
  });

  it('should clear all data', () => {
    act(() => {
      usePortfolioStore.getState().setHoldings([mockHolding]);
      usePortfolioStore.getState().setRiskScores([mockRiskScore]);
    });

    act(() => {
      usePortfolioStore.getState().clearData();
    });

    const state = usePortfolioStore.getState();
    expect(state.holdings).toEqual([]);
    expect(state.riskScores).toEqual([]);
  });
});
