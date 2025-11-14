import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface RiskDistributionChartProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export const RiskDistributionChart = ({
  lowRisk,
  mediumRisk,
  highRisk,
}: RiskDistributionChartProps) => {
  const data = [
    { name: "Low Risk", value: lowRisk, color: "hsl(var(--risk-low))" },
    { name: "Medium Risk", value: mediumRisk, color: "hsl(var(--risk-medium))" },
    { name: "High Risk", value: highRisk, color: "hsl(var(--risk-high))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
