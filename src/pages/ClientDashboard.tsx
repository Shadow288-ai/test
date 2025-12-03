import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { MetricDetailModal } from "@/components/MetricDetailModal";
import { HoldingsListModal } from "@/components/HoldingsListModal";
import { RiskBadge } from "@/components/RiskBadge";
import { StockDetailModal } from "@/components/StockDetailModal";
import { RiskAdvisorChat } from "@/components/RiskAdvisorChat";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChartIcon,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/utils/formatNumber";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  refreshTopHoldingsPricesForCurrentUser,
  TopRefreshResult,
} from "@/lib/priceUpdater";

export default function ClientDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState<any | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isRefreshingTop, setIsRefreshingTop] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const fetchPortfolioData = async () => {
  if (!user) return;

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("client_id", user.id)
      .order("market_value", { ascending: false });

    console.log(">>> user.id from frontend:", user.id);
    console.log(">>> portfolio_holdings rows for this user:", data);

    if (error) throw error;
    setHoldings(data || []);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
  } finally {
    setLoading(false);
  }
};

  // Top holdings: always the 5 largest by current market_value in memory
  const topHoldings = useMemo(() => {
    const sorted = [...holdings]
      .sort(
        (a, b) => Number(b.market_value ?? 0) - Number(a.market_value ?? 0)
      )
      .slice(0, 5);

    console.log("[ClientDashboard] Derived topHoldings:", sorted);
    return sorted;
  }, [holdings]);

  // Initial load of holdings when user is available or when refresh flag is set
  useEffect(() => {
    if (!user) return;
    fetchPortfolioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state]);

  // Manual refresh ALL prices via edge function
  const handleRefreshAllPrices = async () => {
    if (!user) return;
    
    setIsRefreshingAll(true);
    toast.info("Updating all stock prices...", { 
      description: "This may take a few moments" 
    });

    try {
      const { data, error } = await supabase.functions.invoke('update-stock-prices', {
        body: {}
      });

      if (error) throw error;

      console.log('[ClientDashboard] Price update result:', data);

      // Refresh portfolio data from database
      await fetchPortfolioData();

      toast.success("Prices updated successfully!", {
        description: `Updated ${data.totalUpdated || 0} holdings`
      });
    } catch (error: any) {
      console.error('[ClientDashboard] Error updating prices:', error);
      toast.error("Failed to update prices", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  // Manual refresh for top holdings prices (no automatic overwrite on mount)
  const handleRefreshTopPrices = async () => {
    if (!user) return;
    if (topHoldings.length === 0) return;

    const tickers = topHoldings
      .map((h) => h.stock_ticker as string | null)
      .filter((t): t is string => Boolean(t));

    if (tickers.length === 0) return;

    console.log(
      "[ClientDashboard] Manually refreshing top holdings prices for:",
      tickers
    );

    setIsRefreshingTop(true);
    try {
      const result: TopRefreshResult =
        await refreshTopHoldingsPricesForCurrentUser(tickers);

      console.log(
        "[ClientDashboard] Top holdings price refresh result:",
        result
      );

      const prices = result.prices;

      // Patch local state so UI updates immediately
      setHoldings((prev) =>
        prev.map((h) => {
          const symbol = h.stock_ticker as string | undefined;
          const price = symbol ? prices[symbol] : undefined;
          if (price == null) return h;

          const shares = Number(h.shares ?? 0);
          const newValue = price * shares;

          return {
            ...h,
            market_value: newValue,
          };
        })
      );
    } catch (err) {
      console.error(
        "[ClientDashboard] Error refreshing top holdings prices:",
        err
      );
    } finally {
      setIsRefreshingTop(false);
    }
  };

  const metrics = useMemo(() => {
    const totalValue = holdings.reduce(
      (sum, h) => sum + Number(h.market_value),
      0
    );
    const totalCostBasis = holdings.reduce(
      (sum, h) => sum + Number(h.cost_basis) * Number(h.shares),
      0
    );
    const totalGainLoss = totalValue - totalCostBasis;
    const gainLossPercent =
      totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    // Calculate weighted average volatility
    const avgVolatility =
      holdings.length > 0
        ? holdings.reduce((sum, h) => {
            const weight = Number(h.portfolio_weight) / 100;
            return sum + Number(h.volatility) * weight;
          }, 0)
        : 0;

    // Calculate sector concentration (Herfindahl index)
    const sectorMap = new Map<string, number>();
    holdings.forEach((h) => {
      const current = sectorMap.get(h.sector) || 0;
      sectorMap.set(h.sector, current + Number(h.portfolio_weight));
    });

    const sectorConcentration = Array.from(sectorMap.values()).reduce(
      (sum, weight) => sum + Math.pow(weight / 100, 2),
      0
    );

    const topSector =
      sectorMap.size > 0
        ? Array.from(sectorMap.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    // Calculate region concentration
    const regionMap = new Map<string, number>();
    holdings.forEach((h) => {
      const current = regionMap.get(h.region) || 0;
      regionMap.set(h.region, current + Number(h.portfolio_weight));
    });

    const regionConcentration = Array.from(regionMap.values()).reduce(
      (sum, weight) => sum + Math.pow(weight / 100, 2),
      0
    );

    const topRegion =
      regionMap.size > 0
        ? Array.from(regionMap.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    // Risk Scoring Algorithm - Balanced approach (0-100)
    let riskScore = 0;
    let riskFactors: {
      factor: string;
      points: number;
      maxPoints: number;
      reason: string;
    }[] = [];

    // Factor 1: Volatility (0-35 points) - More balanced thresholds
    let volatilityPoints = 0;
    if (avgVolatility > 40) {
      volatilityPoints = 35;
      riskFactors.push({
        factor: "Volatility",
        points: 35,
        maxPoints: 35,
        reason: "Extremely high volatility (>40%)",
      });
    } else if (avgVolatility > 30) {
      volatilityPoints = 28;
      riskFactors.push({
        factor: "Volatility",
        points: 28,
        maxPoints: 35,
        reason: "Very high volatility (30-40%)",
      });
    } else if (avgVolatility > 22) {
      volatilityPoints = 20;
      riskFactors.push({
        factor: "Volatility",
        points: 20,
        maxPoints: 35,
        reason: "High volatility (22-30%)",
      });
    } else if (avgVolatility > 15) {
      volatilityPoints = 12;
      riskFactors.push({
        factor: "Volatility",
        points: 12,
        maxPoints: 35,
        reason: "Moderate volatility (15-22%)",
      });
    } else {
      volatilityPoints = 5;
      riskFactors.push({
        factor: "Volatility",
        points: 5,
        maxPoints: 35,
        reason: "Low volatility (<15%) - Stable portfolio",
      });
    }
    riskScore += volatilityPoints;

    // Factor 2: Sector Concentration (0-30 points) - Using Herfindahl Index
    let sectorPoints = 0;
    if (sectorConcentration > 0.4) {
      sectorPoints = 30;
      riskFactors.push({
        factor: "Sector Concentration",
        points: 30,
        maxPoints: 30,
        reason: "Heavily concentrated in few sectors (HHI > 0.4)",
      });
    } else if (sectorConcentration > 0.25) {
      sectorPoints = 20;
      riskFactors.push({
        factor: "Sector Concentration",
        points: 20,
        maxPoints: 30,
        reason: "Moderate concentration (HHI 0.25-0.4)",
      });
    } else if (sectorConcentration > 0.15) {
      sectorPoints = 10;
      riskFactors.push({
        factor: "Sector Concentration",
        points: 10,
        maxPoints: 30,
        reason: "Good diversification (HHI 0.15-0.25)",
      });
    } else {
      sectorPoints = 3;
      riskFactors.push({
        factor: "Sector Concentration",
        points: 3,
        maxPoints: 30,
        reason: "Excellent sector diversification (HHI < 0.15)",
      });
    }
    riskScore += sectorPoints;

    // Factor 3: Geographic Concentration (0-20 points)
    let regionPoints = 0;
    if (regionConcentration > 0.7) {
      regionPoints = 20;
      riskFactors.push({
        factor: "Geographic Concentration",
        points: 20,
        maxPoints: 20,
        reason: "Heavy concentration in single region (>70%)",
      });
    } else if (regionConcentration > 0.5) {
      regionPoints = 14;
      riskFactors.push({
        factor: "Geographic Concentration",
        points: 14,
        maxPoints: 20,
        reason: "Moderate regional concentration (50-70%)",
      });
    } else if (regionConcentration > 0.35) {
      regionPoints = 8;
      riskFactors.push({
        factor: "Geographic Concentration",
        points: 8,
        maxPoints: 20,
        reason: "Balanced regional exposure (35-50%)",
      });
    } else {
      regionPoints = 3;
      riskFactors.push({
        factor: "Geographic Concentration",
        points: 3,
        maxPoints: 20,
        reason: "Excellent geographic diversification (<35%)",
      });
    }
    riskScore += regionPoints;

    // Factor 4: Portfolio Size & Diversification (0-15 points)
    let sizePoints = 0;
    if (holdings.length < 5) {
      sizePoints = 15;
      riskFactors.push({
        factor: "Portfolio Diversification",
        points: 15,
        maxPoints: 15,
        reason: "Under-diversified portfolio (<5 holdings)",
      });
    } else if (holdings.length < 10) {
      sizePoints = 10;
      riskFactors.push({
        factor: "Portfolio Diversification",
        points: 10,
        maxPoints: 15,
        reason: "Limited diversification (5-10 holdings)",
      });
    } else if (holdings.length < 20) {
      sizePoints = 5;
      riskFactors.push({
        factor: "Portfolio Diversification",
        points: 5,
        maxPoints: 15,
        reason: "Good diversification (10-20 holdings)",
      });
    } else {
      sizePoints = 2;
      riskFactors.push({
        factor: "Portfolio Diversification",
        points: 2,
        maxPoints: 15,
        reason: "Well-diversified portfolio (>20 holdings)",
      });
    }
    riskScore += sizePoints;

    // Cap at 100 and determine risk level with better thresholds
    riskScore = Math.min(Math.round(riskScore), 100);
    const riskLevel =
      riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

    return {
      totalValue,
      totalCostBasis,
      totalGainLoss,
      gainLossPercent,
      riskScore,
      riskLevel,
      riskFactors,
      avgVolatility,
      sectorConcentration,
      topSector,
      regionConcentration,
      topRegion,
      holdingsCount: holdings.length,
    };
  }, [holdings]);

  const assetAllocation = useMemo(() => {
    const allocation: Record<string, number> = {};
    const totalValue = holdings.reduce(
      (sum, h) => sum + Number(h.market_value),
      0
    );

    holdings.forEach((h) => {
      const assetType = h.asset_type || "Unknown";
      allocation[assetType] =
        (allocation[assetType] || 0) + Number(h.market_value);
    });

    return Object.entries(allocation)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        fill:
          name === "Stock"
            ? "hsl(var(--primary))"
            : name === "ETF"
            ? "hsl(var(--success))"
            : name === "Crypto"
            ? "hsl(var(--warning))"
            : name === "Bond"
            ? "hsl(var(--chart-2))"
            : "hsl(var(--muted))",
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  const sectorBreakdown = useMemo(() => {
    const sectorMap = new Map<string, number>();
    holdings.forEach((h) => {
      const current = sectorMap.get(h.sector) || 0;
      sectorMap.set(h.sector, current + Number(h.market_value));
    });

    return Array.from(sectorMap.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        formatted: formatCurrency(value),
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Portfolio Data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload your portfolio holdings to view your personalized risk
          assessment and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            My Portfolio
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your personalized risk assessment and portfolio insights
          </p>
        </div>
        <Button
          onClick={handleRefreshAllPrices}
          disabled={isRefreshingAll}
          variant="outline"
          size="sm"
          className="gap-2 glass-button relative overflow-hidden"
        >
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-distortion-overlay"></div>
          <div className="glass-specular"></div>
          <span className="relative z-10 flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", isRefreshingAll && "animate-spin")} />
            {isRefreshingAll ? "Updating..." : "Refresh Prices"}
          </span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          icon={DollarSign}
          description="Portfolio value"
          onClick={() => setSelectedMetric("totalValue")}
        />
        <MetricCard
          title="Gain/Loss"
          value={`${
            metrics.totalGainLoss >= 0 ? "+" : ""
          }${metrics.gainLossPercent.toFixed(2)}%`}
          icon={metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          description={formatCurrency(metrics.totalGainLoss)}
          onClick={() => setSelectedMetric("gainLoss")}
        />
        <Card
          className="glass-card border-border/50 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden"
          onClick={() => setSelectedMetric("riskScore")}
        >
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-distortion-overlay"></div>
          <div className="glass-specular"></div>
          <div className="glass-content relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Risk Score
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.riskScore}</div>
              <div className="mt-2">
                <RiskBadge level={metrics.riskLevel as any} />
              </div>
            </CardContent>
          </div>
        </Card>
        <MetricCard
          title="Holdings"
          value={metrics.holdingsCount}
          icon={PieChartIcon}
          description="Total positions"
          onClick={() => setSelectedMetric("holdings")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-border/30 relative overflow-hidden">
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-distortion-overlay"></div>
          <div className="glass-specular"></div>
          <div className="glass-content relative z-10">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Distribution by asset type</CardDescription>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
                  }
                  outerRadius={110}
                  innerRadius={0}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                  animationDuration={500}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${formatCurrency(
                      value as number
                    )} (${props.payload.percentage.toFixed(1)}%)`,
                    "Value",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            </CardContent>
          </div>
        </Card>

        <Card className="glass-card border-border/30 relative overflow-hidden">
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-distortion-overlay"></div>
          <div className="glass-specular"></div>
          <div className="glass-content relative z-10">
            {/* These are the stock prices */}
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Top Holdings</CardTitle>
                <CardDescription>
                  Largest positions by market value
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTopPrices}
                disabled={isRefreshingTop || topHoldings.length === 0}
                className="glass-button relative overflow-hidden"
              >
                <div className="glass-filter"></div>
                <div className="glass-overlay"></div>
                <div className="glass-distortion-overlay"></div>
                <div className="glass-specular"></div>
                <span className="relative z-10">{isRefreshingTop ? "Refreshing..." : "Refresh prices"}</span>
              </Button>
            </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHoldings.map((holding) => {
                const gainLoss =
                  Number(holding.market_value) -
                  Number(holding.cost_basis) * Number(holding.shares);
                const gainLossPercent =
                  (gainLoss /
                    (Number(holding.cost_basis) * Number(holding.shares))) *
                  100;

                return (
                  <div
                    key={holding.id}
                    className="glass-card flex items-center justify-between p-3 border border-border/20 hover:border-primary/30 transition-all cursor-pointer hover:scale-[1.02] relative overflow-hidden"
                    onClick={() => setSelectedHolding(holding)}
                  >
                    <div className="glass-filter"></div>
                    <div className="glass-overlay"></div>
                    <div className="glass-distortion-overlay"></div>
                    <div className="glass-specular"></div>
                    <div className="glass-content flex items-center justify-between w-full relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{holding.stock_ticker}</p>
                        {holding.is_bullish ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {holding.asset_type} •{" "}
                        {Number(holding.portfolio_weight).toFixed(1)}% of
                        portfolio
                      </p>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          gainLoss >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {gainLoss >= 0 ? "+" : ""}
                        {gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(Number(holding.market_value))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-border/30 relative overflow-hidden">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-distortion-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content relative z-10">
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
            <CardDescription>
              Portfolio value distribution by sector
            </CardDescription>
          </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={sectorBreakdown}
              margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                horizontal={true}
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="sector"
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                  fontWeight: 600,
                }}
                formatter={(value: any) => [
                  formatCurrency(value as number),
                  "Value",
                ]}
                cursor={{
                  fill: "hsl(var(--muted))",
                  opacity: 0.1,
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        </div>
      </Card>

      <Card className="glass-card border-border/30 relative overflow-hidden">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-distortion-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content relative z-10">
          <CardHeader>
            <CardTitle>Risk Score Explanation</CardTitle>
            <CardDescription>
              Understanding how your risk score is calculated
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Risk Factors Breakdown:</h4>
              <div className="space-y-3">
                {metrics.riskFactors.map((factor, idx) => (
                  <div key={idx} className="border-l-2 border-primary pl-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{factor.factor}</span>
                      <span className="text-sm text-muted-foreground">
                        {factor.points}/{factor.maxPoints} points
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-2">Risk Levels:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="text-success font-medium">Low (0-39)</span>: Well-diversified with stable holdings</li>
                <li>• <span className="text-warning font-medium">Medium (40-69)</span>: Some concentration but manageable</li>
                <li>• <span className="text-destructive font-medium">High (70-100)</span>: Significant concentration requiring attention</li>
              </ul>
            </div>
          </div>
        </CardContent>
        </div>
      </Card>

      {/* AI Risk Advisor */}
      <RiskAdvisorChat
        portfolioData={{
          totalValue: metrics.totalValue,
          holdingsCount: metrics.holdingsCount,
          riskScore: metrics.riskScore,
          avgVolatility: metrics.avgVolatility,
          sectorConcentration: metrics.sectorConcentration,
          topSector: metrics.topSector?.[0] || 'N/A',
          regionConcentration: metrics.regionConcentration,
          topRegion: metrics.topRegion?.[0] || 'N/A',
        }}
      />

      <StockDetailModal
        open={!!selectedHolding}
        onOpenChange={(open) => !open && setSelectedHolding(null)}
        holding={selectedHolding}
      />

      {/* Total Value Modal */}
      <MetricDetailModal
        open={selectedMetric === "totalValue"}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Total Portfolio Value"
        icon={DollarSign}
        mainValue={formatCurrency(metrics.totalValue)}
        explanation="The total market value of all your holdings combined."
        details={[
          {
            label: "Total Cost Basis",
            value: formatCurrency(metrics.totalCostBasis),
            description: "Total amount invested across all holdings",
          },
          {
            label: "Unrealized Gain/Loss",
            value: formatCurrency(metrics.totalGainLoss),
            description: "Difference between current value and cost basis",
          },
          {
            label: "Number of Holdings",
            value: metrics.holdingsCount,
            description: "Total number of positions in your portfolio",
          },
        ]}
      />

      {/* Gain/Loss Modal */}
      <MetricDetailModal
        open={selectedMetric === "gainLoss"}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Portfolio Gain/Loss"
        icon={metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
        mainValue={`${
          metrics.totalGainLoss >= 0 ? "+" : ""
        }${metrics.gainLossPercent.toFixed(2)}%`}
        explanation="Your portfolio's performance compared to your initial investment."
        details={[
          {
            label: "Absolute Gain/Loss",
            value: formatCurrency(metrics.totalGainLoss),
            description: "Total profit or loss in currency",
          },
          {
            label: "Total Invested",
            value: formatCurrency(metrics.totalCostBasis),
            description: "Your original investment amount",
          },
          {
            label: "Current Value",
            value: formatCurrency(metrics.totalValue),
            description: "Current market value of your portfolio",
          },
          {
            label: "Return on Investment",
            value: `${metrics.gainLossPercent.toFixed(2)}%`,
            description: "Percentage return on your investment",
          },
        ]}
      />

      {/* Risk Score Modal */}
      <MetricDetailModal
        open={selectedMetric === "riskScore"}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Risk Score Breakdown"
        icon={AlertTriangle}
        mainValue={`${metrics.riskScore}/100 - ${metrics.riskLevel} Risk`}
        explanation="Your risk score is calculated based on three main factors: volatility, sector concentration, and geographic concentration. Each factor contributes points to your total risk score (0-100)."
        details={[
          ...metrics.riskFactors.map((factor) => ({
            label: factor.factor,
            value: `${factor.points}/${factor.maxPoints} pts`,
            description: factor.reason,
          })),
          {
            label: "Average Volatility",
            value: `${metrics.avgVolatility.toFixed(2)}%`,
            description: "Weighted average volatility of your holdings",
          },
          {
            label: "Top Sector",
            value: metrics.topSector
              ? `${metrics.topSector[0]} (${metrics.topSector[1].toFixed(1)}%)`
              : "N/A",
            description: "Your largest sector allocation",
          },
          {
            label: "Top Region",
            value: metrics.topRegion
              ? `${metrics.topRegion[0]} (${metrics.topRegion[1].toFixed(1)}%)`
              : "N/A",
            description: "Your largest geographic allocation",
          },
        ]}
      />

      {/* Holdings Modal */}
      <HoldingsListModal
        open={selectedMetric === "holdings"}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        holdings={holdings}
        onHoldingClick={setSelectedHolding}
      />
    </div>
  );
}
