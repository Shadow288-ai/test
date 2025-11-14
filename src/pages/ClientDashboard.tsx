import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { MetricDetailModal } from '@/components/MetricDetailModal';
import { HoldingsListModal } from '@/components/HoldingsListModal';
import { RiskBadge } from '@/components/RiskBadge';
import { StockDetailModal } from '@/components/StockDetailModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChartIcon, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatNumber } from '@/utils/formatNumber';
import { cn } from '@/lib/utils';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState<any | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, [user]);

  const fetchPortfolioData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('client_id', user.id)
        .order('market_value', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + Number(h.market_value), 0);
    const totalCostBasis = holdings.reduce((sum, h) => sum + (Number(h.cost_basis) * Number(h.shares)), 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const gainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
    
    // Calculate weighted average volatility
    const avgVolatility = holdings.length > 0
      ? holdings.reduce((sum, h) => {
          const weight = Number(h.portfolio_weight) / 100;
          return sum + (Number(h.volatility) * weight);
        }, 0)
      : 0;

    // Calculate sector concentration (Herfindahl index)
    const sectorMap = new Map<string, number>();
    holdings.forEach(h => {
      const current = sectorMap.get(h.sector) || 0;
      sectorMap.set(h.sector, current + Number(h.portfolio_weight));
    });
    
    const sectorConcentration = Array.from(sectorMap.values()).reduce(
      (sum, weight) => sum + Math.pow(weight / 100, 2),
      0
    );

    const topSector = sectorMap.size > 0 
      ? Array.from(sectorMap.entries()).sort((a, b) => b[1] - a[1])[0]
      : null;

    // Calculate region concentration
    const regionMap = new Map<string, number>();
    holdings.forEach(h => {
      const current = regionMap.get(h.region) || 0;
      regionMap.set(h.region, current + Number(h.portfolio_weight));
    });

    const regionConcentration = Array.from(regionMap.values()).reduce(
      (sum, weight) => sum + Math.pow(weight / 100, 2),
      0
    );

    const topRegion = regionMap.size > 0
      ? Array.from(regionMap.entries()).sort((a, b) => b[1] - a[1])[0]
      : null;

    // Risk Scoring Algorithm (0-100)
    let riskScore = 0;
    let riskFactors: { factor: string; points: number; maxPoints: number; reason: string }[] = [];

    // Factor 1: Volatility (0-40 points)
    let volatilityPoints = 0;
    if (avgVolatility > 30) {
      volatilityPoints = 40;
      riskFactors.push({ factor: 'Volatility', points: 40, maxPoints: 40, reason: 'Very high average volatility (>30%)' });
    } else if (avgVolatility > 20) {
      volatilityPoints = 30;
      riskFactors.push({ factor: 'Volatility', points: 30, maxPoints: 40, reason: 'High average volatility (20-30%)' });
    } else if (avgVolatility > 15) {
      volatilityPoints = 20;
      riskFactors.push({ factor: 'Volatility', points: 20, maxPoints: 40, reason: 'Moderate volatility (15-20%)' });
    } else {
      volatilityPoints = 10;
      riskFactors.push({ factor: 'Volatility', points: 10, maxPoints: 40, reason: 'Low volatility (<15%)' });
    }
    riskScore += volatilityPoints;

    // Factor 2: Sector Concentration (0-30 points)
    let sectorPoints = 0;
    if (sectorConcentration > 0.5) {
      sectorPoints = 30;
      riskFactors.push({ factor: 'Sector Concentration', points: 30, maxPoints: 30, reason: 'Very high concentration in few sectors' });
    } else if (sectorConcentration > 0.33) {
      sectorPoints = 20;
      riskFactors.push({ factor: 'Sector Concentration', points: 20, maxPoints: 30, reason: 'Moderate sector concentration' });
    } else if (sectorConcentration > 0.2) {
      sectorPoints = 10;
      riskFactors.push({ factor: 'Sector Concentration', points: 10, maxPoints: 30, reason: 'Low sector concentration' });
    } else {
      sectorPoints = 5;
      riskFactors.push({ factor: 'Sector Concentration', points: 5, maxPoints: 30, reason: 'Well diversified across sectors' });
    }
    riskScore += sectorPoints;

    // Factor 3: Geographic Concentration (0-30 points)
    let regionPoints = 0;
    if (regionConcentration > 0.6) {
      regionPoints = 30;
      riskFactors.push({ factor: 'Geographic Concentration', points: 30, maxPoints: 30, reason: 'Very high concentration in one region' });
    } else if (regionConcentration > 0.4) {
      regionPoints = 20;
      riskFactors.push({ factor: 'Geographic Concentration', points: 20, maxPoints: 30, reason: 'Moderate regional concentration' });
    } else if (regionConcentration > 0.25) {
      regionPoints = 10;
      riskFactors.push({ factor: 'Geographic Concentration', points: 10, maxPoints: 30, reason: 'Some regional concentration' });
    } else {
      regionPoints = 5;
      riskFactors.push({ factor: 'Geographic Concentration', points: 5, maxPoints: 30, reason: 'Well diversified geographically' });
    }
    riskScore += regionPoints;

    const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

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
    const totalValue = holdings.reduce((sum, h) => sum + Number(h.market_value), 0);
    
    holdings.forEach(h => {
      const assetType = h.asset_type || 'Unknown';
      allocation[assetType] = (allocation[assetType] || 0) + Number(h.market_value);
    });
    
    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      fill: name === 'Stock' ? 'hsl(var(--primary))' : 
            name === 'ETF' ? 'hsl(var(--success))' : 
            name === 'Crypto' ? 'hsl(var(--warning))' :
            name === 'Bond' ? 'hsl(var(--chart-2))' :
            'hsl(var(--muted))',
    })).sort((a, b) => b.value - a.value);
  }, [holdings]);

  const topHoldings = useMemo(() => {
    return holdings.slice(0, 5);
  }, [holdings]);

  const sectorBreakdown = useMemo(() => {
    const sectorMap = new Map<string, number>();
    holdings.forEach(h => {
      const current = sectorMap.get(h.sector) || 0;
      sectorMap.set(h.sector, current + Number(h.market_value));
    });

    return Array.from(sectorMap.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        formatted: formatCurrency(value)
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
          Upload your portfolio holdings to view your personalized risk assessment and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          Your personalized risk assessment and portfolio insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          icon={DollarSign}
          description="Portfolio value"
          onClick={() => setSelectedMetric('totalValue')}
        />
        <MetricCard
          title="Gain/Loss"
          value={`${metrics.totalGainLoss >= 0 ? '+' : ''}${metrics.gainLossPercent.toFixed(2)}%`}
          icon={metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          description={formatCurrency(metrics.totalGainLoss)}
          onClick={() => setSelectedMetric('gainLoss')}
        />
        <Card 
          className="bg-gradient-card border-border/50 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
          onClick={() => setSelectedMetric('riskScore')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.riskScore}</div>
            <div className="mt-2">
              <RiskBadge level={metrics.riskLevel as any} />
            </div>
          </CardContent>
        </Card>
        <MetricCard
          title="Holdings"
          value={metrics.holdingsCount}
          icon={PieChartIcon}
          description="Total positions"
          onClick={() => setSelectedMetric('holdings')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black/5 dark:bg-black/20">
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
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
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
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${formatCurrency(value as number)} (${props.payload.percentage.toFixed(1)}%)`,
                    'Value'
                  ]} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Holdings</CardTitle>
            <CardDescription>Largest positions by market value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHoldings.map((holding) => {
                const gainLoss = (Number(holding.market_value) - (Number(holding.cost_basis) * Number(holding.shares)));
                const gainLossPercent = (gainLoss / (Number(holding.cost_basis) * Number(holding.shares))) * 100;
                
                return (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => setSelectedHolding(holding)}
                  >
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
                        {holding.asset_type} • {Number(holding.portfolio_weight).toFixed(1)}% of portfolio
                      </p>
                      <p className={cn(
                        "text-sm font-medium",
                        gainLoss >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(Number(holding.market_value))}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/5 dark:bg-black/20">
        <CardHeader>
          <CardTitle>Sector Breakdown</CardTitle>
          <CardDescription>Portfolio value distribution by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sectorBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
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
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: any) => [formatCurrency(value as number), 'Value']}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
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
      </Card>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Risk Improvement Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {metrics.riskLevel === 'High' && (
              <>
                <li>• Consider diversifying across more sectors to reduce concentration risk</li>
                <li>• Review high-volatility holdings and consider rebalancing to lower-risk assets</li>
                <li>• Evaluate your asset allocation to ensure it aligns with your risk tolerance</li>
              </>
            )}
            {metrics.riskLevel === 'Medium' && (
              <>
                <li>• Your portfolio has moderate risk - maintain regular monitoring</li>
                <li>• Consider geographic diversification to reduce regional exposure</li>
                <li>• Review holdings quarterly to ensure continued alignment with goals</li>
              </>
            )}
            {metrics.riskLevel === 'Low' && (
              <>
                <li>• Your portfolio has low risk - well diversified</li>
                <li>• Continue maintaining balanced asset allocation</li>
                <li>• Consider periodic rebalancing to maintain target allocations</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      <StockDetailModal
        open={!!selectedHolding}
        onOpenChange={(open) => !open && setSelectedHolding(null)}
        holding={selectedHolding}
      />

      {/* Total Value Modal */}
      <MetricDetailModal
        open={selectedMetric === 'totalValue'}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Total Portfolio Value"
        icon={DollarSign}
        mainValue={formatCurrency(metrics.totalValue)}
        explanation="The total market value of all your holdings combined."
        details={[
          {
            label: 'Total Cost Basis',
            value: formatCurrency(metrics.totalCostBasis),
            description: 'Total amount invested across all holdings'
          },
          {
            label: 'Unrealized Gain/Loss',
            value: formatCurrency(metrics.totalGainLoss),
            description: 'Difference between current value and cost basis'
          },
          {
            label: 'Number of Holdings',
            value: metrics.holdingsCount,
            description: 'Total number of positions in your portfolio'
          }
        ]}
      />

      {/* Gain/Loss Modal */}
      <MetricDetailModal
        open={selectedMetric === 'gainLoss'}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Portfolio Gain/Loss"
        icon={metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
        mainValue={`${metrics.totalGainLoss >= 0 ? '+' : ''}${metrics.gainLossPercent.toFixed(2)}%`}
        explanation="Your portfolio's performance compared to your initial investment."
        details={[
          {
            label: 'Absolute Gain/Loss',
            value: formatCurrency(metrics.totalGainLoss),
            description: 'Total profit or loss in currency'
          },
          {
            label: 'Total Invested',
            value: formatCurrency(metrics.totalCostBasis),
            description: 'Your original investment amount'
          },
          {
            label: 'Current Value',
            value: formatCurrency(metrics.totalValue),
            description: 'Current market value of your portfolio'
          },
          {
            label: 'Return on Investment',
            value: `${metrics.gainLossPercent.toFixed(2)}%`,
            description: 'Percentage return on your investment'
          }
        ]}
      />

      {/* Risk Score Modal */}
      <MetricDetailModal
        open={selectedMetric === 'riskScore'}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title="Risk Score Breakdown"
        icon={AlertTriangle}
        mainValue={`${metrics.riskScore}/100 - ${metrics.riskLevel} Risk`}
        explanation="Your risk score is calculated based on three main factors: volatility, sector concentration, and geographic concentration. Each factor contributes points to your total risk score (0-100)."
        details={[
          ...metrics.riskFactors.map(factor => ({
            label: factor.factor,
            value: `${factor.points}/${factor.maxPoints} pts`,
            description: factor.reason
          })),
          {
            label: 'Average Volatility',
            value: `${metrics.avgVolatility.toFixed(2)}%`,
            description: 'Weighted average volatility of your holdings'
          },
          {
            label: 'Top Sector',
            value: metrics.topSector ? `${metrics.topSector[0]} (${metrics.topSector[1].toFixed(1)}%)` : 'N/A',
            description: 'Your largest sector allocation'
          },
          {
            label: 'Top Region',
            value: metrics.topRegion ? `${metrics.topRegion[0]} (${metrics.topRegion[1].toFixed(1)}%)` : 'N/A',
            description: 'Your largest geographic allocation'
          }
        ]}
      />

      {/* Holdings Modal */}
      <HoldingsListModal
        open={selectedMetric === 'holdings'}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        holdings={holdings}
        onHoldingClick={setSelectedHolding}
      />
    </div>
  );
}
