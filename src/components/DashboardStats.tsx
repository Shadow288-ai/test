import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface StatsProps {
  totalClients: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export const DashboardStats = ({ totalClients, lowRisk, mediumRisk, highRisk }: StatsProps) => {
  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      description: "Active portfolios",
      color: "text-primary",
    },
    {
      title: "Low Risk",
      value: lowRisk,
      icon: Shield,
      description: "Within acceptable range",
      color: "text-risk-low",
    },
    {
      title: "Medium Risk",
      value: mediumRisk,
      icon: TrendingUp,
      description: "Requires monitoring",
      color: "text-risk-medium",
    },
    {
      title: "High Risk",
      value: highRisk,
      icon: AlertTriangle,
      description: "Immediate attention needed",
      color: "text-risk-high",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
