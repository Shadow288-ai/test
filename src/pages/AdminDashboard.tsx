import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  Low: 'hsl(var(--success))',
  Medium: 'hsl(var(--warning))',
  High: 'hsl(var(--destructive))',
};

export default function AdminDashboard() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [holdingsData, clientsData] = await Promise.all([
        supabase.from('portfolio_holdings').select('*'),
        supabase.from('profiles').select('id, email, full_name'),
      ]);

      if (holdingsData.error) throw holdingsData.error;
      if (clientsData.error) throw clientsData.error;

      setHoldings(holdingsData.data || []);
      setClients(clientsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const clientRiskScores: Record<string, { risk: number; value: number; count: number }> = {};

    holdings.forEach((h) => {
      if (!clientRiskScores[h.client_id]) {
        clientRiskScores[h.client_id] = { risk: 0, value: 0, count: 0 };
      }
      clientRiskScores[h.client_id].value += Number(h.market_value);
      clientRiskScores[h.client_id].count += 1;
    });

    const totalClients = Object.keys(clientRiskScores).length;
    const totalAUM = Object.values(clientRiskScores).reduce((sum, c) => sum + c.value, 0);

    // Calculate risk distribution
    let lowRisk = 0, mediumRisk = 0, highRisk = 0;
    Object.entries(clientRiskScores).forEach(([clientId, data]) => {
      const clientHoldings = holdings.filter(h => h.client_id === clientId);
      const avgVolatility = clientHoldings.reduce((sum, h) => sum + Number(h.volatility), 0) / clientHoldings.length;
      
      if (avgVolatility < 15) lowRisk++;
      else if (avgVolatility < 25) mediumRisk++;
      else highRisk++;
    });

    return {
      totalClients,
      lowRisk,
      mediumRisk,
      highRisk,
      totalAUM,
    };
  }, [holdings]);

  const riskDistributionData = [
    { name: 'Low Risk', value: metrics.lowRisk, fill: COLORS.Low },
    { name: 'Medium Risk', value: metrics.mediumRisk, fill: COLORS.Medium },
    { name: 'High Risk', value: metrics.highRisk, fill: COLORS.High },
  ];

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all client portfolios and risk metrics
          </p>
        </div>
        <Link to="/admin/clients">
          <Button className="gap-2">
            <Users className="h-4 w-4" />
            View All Clients
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={metrics.totalClients}
          icon={Users}
          description="Active portfolios"
        />
        <MetricCard
          title="Total AUM"
          value={`€${(metrics.totalAUM / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          description="Assets under management"
        />
        <MetricCard
          title="Low Risk"
          value={metrics.lowRisk}
          icon={TrendingUp}
          description="Well diversified"
        />
        <MetricCard
          title="High Risk"
          value={metrics.highRisk}
          icon={AlertTriangle}
          description="Require attention"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Risk Distribution</CardTitle>
          <CardDescription>Breakdown of clients by risk tier</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
