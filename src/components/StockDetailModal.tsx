import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchCurrentPrice, fetchHistoricalData } from '@/utils/stockData';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StockDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: any;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  '1D': 1,
  '5D': 5,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  'ALL': 730, // 2 years
};

export function StockDetailModal({ open, onOpenChange, holding }: StockDetailModalProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [historicalData, setHisticalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');

  useEffect(() => {
    if (open && holding) {
      loadStockData();
    }
  }, [open, holding, selectedTimeframe]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const days = TIMEFRAME_DAYS[selectedTimeframe];
      const [price, history] = await Promise.all([
        fetchCurrentPrice(holding.stock_ticker),
        fetchHistoricalData(holding.stock_ticker, days),
      ]);
      setCurrentPrice(price);
      setHisticalData(history);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!holding) return null;

  const purchaseValue = Number(holding.cost_basis) * Number(holding.shares);
  const currentValue = currentPrice ? currentPrice * Number(holding.shares) : Number(holding.market_value);
  const gainLoss = currentValue - purchaseValue;
  const gainLossPercent = (gainLoss / purchaseValue) * 100;
  const isPositive = gainLoss >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {holding.stock_ticker} - {holding.stock_name}
            {holding.is_bullish ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Price Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-2xl font-bold">
                      ${currentPrice?.toFixed(2) || 'Loading...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Live Update</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                    <p className="text-2xl font-bold">
                      ${Number(holding.cost_basis).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold">{Number(holding.shares)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                    <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                    </p>
                    <p className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card className="bg-gradient-to-br from-black/10 to-black/5 dark:from-black/40 dark:to-black/30 border border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Timeframe Selector */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Price History</h3>
                    <div className="flex gap-1 bg-background/50 dark:bg-background/30 p-1 rounded-lg border border-border/50">
                      {(['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
                        <Button
                          key={tf}
                          variant={selectedTimeframe === tf ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedTimeframe(tf)}
                          className={cn(
                            'h-8 px-3 text-xs font-medium transition-all',
                            selectedTimeframe === tf
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          )}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart 
                        data={historicalData} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <pattern
                            id="grid-pattern"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                          >
                            <circle cx="1" cy="1" r="0.5" fill="hsl(var(--muted-foreground))" opacity="0.15" />
                          </pattern>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="0" 
                          stroke="hsl(var(--border))" 
                          vertical={true}
                          horizontal={true}
                          strokeOpacity={0.2}
                          strokeWidth={0.5}
                        />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                          orientation="right"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '11px',
                            padding: '8px 12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }}
                          labelStyle={{ 
                            color: 'hsl(var(--muted-foreground))', 
                            fontWeight: 500,
                            fontSize: '10px',
                            marginBottom: '4px'
                          }}
                          formatter={(value: any) => [
                            `$${value.toFixed(2)}`, 
                            <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>Price</span>
                          ]}
                          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        {/* Reference line at purchase price */}
                        <ReferenceLine
                          y={Number(holding.cost_basis)}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="3 3"
                          strokeWidth={1}
                          strokeOpacity={0.5}
                          label={{
                            value: 'Purchase',
                            position: 'right',
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 10,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ 
                            r: 5, 
                            strokeWidth: 2, 
                            stroke: 'hsl(var(--background))',
                            fill: isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                          }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Sector</p>
                  <p className="text-lg font-semibold">{holding.sector}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="text-lg font-semibold">{holding.region}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Asset Type</p>
                  <p className="text-lg font-semibold">{holding.asset_type}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-lg font-semibold">{Number(holding.volatility).toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Portfolio Weight</p>
                  <p className="text-lg font-semibold">{Number(holding.portfolio_weight).toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Expected Sell Date</p>
                  <p className="text-lg font-semibold">
                    {holding.expected_sell_date ? new Date(holding.expected_sell_date).toLocaleDateString() : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
