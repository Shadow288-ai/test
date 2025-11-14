import { useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const COLORS = {
  Low: 'hsl(var(--success))',
  Medium: 'hsl(var(--warning))',
  High: 'hsl(var(--destructive))',
};

export default function Dashboard() {
  const { riskScores } = usePortfolioStore();

  const metrics = useMemo(() => {
    const totalClients = riskScores.length;
    const lowRisk = riskScores.filter(s => s.riskLevel === 'Low').length;
    const mediumRisk = riskScores.filter(s => s.riskLevel === 'Medium').length;
    const highRisk = riskScores.filter(s => s.riskLevel === 'High').length;
    const totalAUM = riskScores.reduce((sum, s) => sum + s.totalValue, 0);
    const avgRiskScore = totalClients > 0
      ? riskScores.reduce((sum, s) => sum + s.riskScore, 0) / totalClients
      : 0;

    return {
      totalClients,
      lowRisk,
      mediumRisk,
      highRisk,
      totalAUM,
      avgRiskScore: avgRiskScore.toFixed(1),
    };
  }, [riskScores]);

  const riskDistributionData = [
    { name: 'Low Risk', value: metrics.lowRisk, fill: COLORS.Low },
    { name: 'Medium Risk', value: metrics.mediumRisk, fill: COLORS.Medium },
    { name: 'High Risk', value: metrics.highRisk, fill: COLORS.High },
  ];

  const topRiskClients = useMemo(() => {
    return [...riskScores]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [riskScores]);

  if (riskScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Portfolio Data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload a portfolio CSV file to begin analyzing client risk scores and viewing comprehensive reports.
        </p>
        <Link to="/upload">
          <Button size="lg" className="gap-2">
            <Users className="h-5 w-5" />
            Upload Portfolio Data
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of client portfolio risk assessment and metrics
        </p>
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
          title="Avg Risk Score"
          value={metrics.avgRiskScore}
          icon={TrendingUp}
          description="Out of 100"
        />
        <MetricCard
          title="High Risk Clients"
          value={metrics.highRisk}
          icon={AlertTriangle}
          description="Require attention"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Client count by risk tier</CardDescription>
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

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Top Risk Clients</CardTitle>
            <CardDescription>Highest risk scores requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRiskClients.map((client) => (
                <div
                  key={client.clientId}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">Client {client.clientId}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {client.riskScore} | {client.holdingsCount} holdings
                    </p>
                  </div>
                  <RiskBadge level={client.riskLevel} />
                </div>
              ))}
              {topRiskClients.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No client data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Risk Score Overview</CardTitle>
          <CardDescription>Individual client risk scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskScores.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="clientId" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="riskScore" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
