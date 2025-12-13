import { describe, it, expect } from "vitest";
import { calculateClientRiskScore, calculateRiskForAllClients } from "@/utils/riskScoring";
import type { PortfolioHolding } from "@/types/portfolio";

function holding(partial: Partial<PortfolioHolding>): PortfolioHolding {
  return {
    Client_ID: partial.Client_ID ?? "C1",
    Stock_Ticker: partial.Stock_Ticker ?? "AAA",
    Stock_Name: partial.Stock_Name ?? "AAA Corp",
    Sector: partial.Sector ?? "Tech",
    Region: partial.Region ?? "US",
    Shares: partial.Shares ?? 1,
    Market_Value: partial.Market_Value ?? 1000,
    Volatility: partial.Volatility ?? 10,
    Acquisition_Date: partial.Acquisition_Date ?? "2024-01-01",
    Cost_Basis: partial.Cost_Basis ?? 900,
    Portfolio_Weight: partial.Portfolio_Weight ?? 10,
  };
}

describe("riskScoring", () => {
  it("returns Low risk for diversified, low volatility portfolios", () => {
    const holdings: PortfolioHolding[] = Array.from({ length: 10 }).map((_, i) =>
      holding({
        Client_ID: "LOW1",
        Stock_Ticker: `T${i}`,
        Sector: `S${i}`,
        Region: `R${i}`,
        Volatility: 10,
        Portfolio_Weight: 10,
        Market_Value: 1000,
      })
    );

    const result = calculateClientRiskScore(holdings);

    // Thresholds: >=60 High, >=30 Medium, else Low :contentReference[oaicite:11]{index=11}
    expect(result.riskLevel).toBe("Low");
    expect(result.riskScore).toBeLessThan(30);
  });

  it("returns Medium risk around the >=30 boundary", () => {
    const holdings: PortfolioHolding[] = [
      holding({ Client_ID: "MED1", Stock_Ticker: "A", Sector: "Tech", Region: "US", Volatility: 18, Portfolio_Weight: 25 }),
      holding({ Client_ID: "MED1", Stock_Ticker: "B", Sector: "Tech", Region: "US", Volatility: 18, Portfolio_Weight: 25 }),
      holding({ Client_ID: "MED1", Stock_Ticker: "C", Sector: "Health", Region: "EU", Volatility: 18, Portfolio_Weight: 25 }),
      holding({ Client_ID: "MED1", Stock_Ticker: "D", Sector: "Energy", Region: "EU", Volatility: 18, Portfolio_Weight: 25 }),
    ];

    const result = calculateClientRiskScore(holdings);
    expect(result.riskLevel).toBe("Medium");
    expect(result.riskScore).toBeGreaterThanOrEqual(30);
    expect(result.riskScore).toBeLessThan(60);
  });

  it("returns High risk for concentrated, high volatility portfolios", () => {
    const holdings: PortfolioHolding[] = [
      holding({ Client_ID: "HIGH1", Stock_Ticker: "X", Sector: "Tech", Region: "US", Volatility: 45, Portfolio_Weight: 80 }),
      holding({ Client_ID: "HIGH1", Stock_Ticker: "Y", Sector: "Tech", Region: "US", Volatility: 45, Portfolio_Weight: 20 }),
    ];

    const result = calculateClientRiskScore(holdings);
    expect(result.riskLevel).toBe("High");
    expect(result.riskScore).toBeGreaterThanOrEqual(60);
  });

  it("groups holdings by Client_ID in calculateRiskForAllClients", () => {
    const holdings: PortfolioHolding[] = [
      holding({ Client_ID: "C1", Stock_Ticker: "A", Portfolio_Weight: 50, Sector: "Tech", Region: "US" }),
      holding({ Client_ID: "C1", Stock_Ticker: "B", Portfolio_Weight: 50, Sector: "Health", Region: "EU" }),
      holding({ Client_ID: "C2", Stock_Ticker: "C", Portfolio_Weight: 100, Sector: "Tech", Region: "US" }),
    ];

    const results = calculateRiskForAllClients(holdings);
    expect(results).toHaveLength(2); // :contentReference[oaicite:12]{index=12}
    const ids = results.map((r) => r.clientId).sort();
    expect(ids).toEqual(["C1", "C2"]);
  });

  it.skip("OPTIONAL guard: align Help page tiers with riskScoring tiers", () => {
    // Your Help page describes Low(0-39), Medium(40-69), High(70-100) :contentReference[oaicite:13]{index=13}
    // but riskScoring.ts currently uses Low(<30), Medium(30-59), High(>=60). :contentReference[oaicite:14]{index=14}
    // Enable this test AFTER you align the thresholds in code + documentation.
  });
});
