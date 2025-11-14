import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortfolioHolding, ClientRiskScore } from '@/types/portfolio';

interface PortfolioStore {
  holdings: PortfolioHolding[];
  riskScores: ClientRiskScore[];
  setHoldings: (holdings: PortfolioHolding[]) => void;
  setRiskScores: (scores: ClientRiskScore[]) => void;
  clearData: () => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      holdings: [],
      riskScores: [],
      setHoldings: (holdings) => set({ holdings }),
      setRiskScores: (riskScores) => set({ riskScores }),
      clearData: () => set({ holdings: [], riskScores: [] }),
    }),
    {
      name: 'risktwo-portfolio-storage',
    }
  )
);
