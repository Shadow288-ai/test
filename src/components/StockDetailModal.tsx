import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCurrentPrice, fetchHistoricalData } from '@/utils/stockData';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StockDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: any;
}

export function StockDetailModal({ open, onOpenChange, holding }: StockDetailModalProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [historicalData, setHisticalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && holding) {
      loadStockData();
      // Set up polling for live updates every 30 seconds
      const interval = setInterval(loadStockData, 30000);
      return () => clearInterval(interval);
    }
  }, [open, holding]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const [price, history] = await Promise.all([
        fetchCurrentPrice(holding.stock_ticker),
        fetchHistoricalData(holding.stock_ticker, 30),
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
            <Card className="bg-black/5 dark:bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">30-Day Price History</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      vertical={true}
                      horizontal={true}
                      strokeOpacity={0.3}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
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
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line
                      type="linear"
                      dataKey="price"
                      stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
