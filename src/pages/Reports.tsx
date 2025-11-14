import { useMemo } from 'react';
import { Download, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RiskBadge } from '@/components/RiskBadge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/hooks/use-toast';
import { RiskLevel } from '@/types/portfolio';

export default function Reports() {
  const { riskScores, holdings } = usePortfolioStore();
  const { toast } = useToast();

  const exportToCSV = (riskLevel?: RiskLevel) => {
    const filteredScores = riskLevel
      ? riskScores.filter(s => s.riskLevel === riskLevel)
      : riskScores;

    if (filteredScores.length === 0) {
      toast({
        title: 'No Data',
        description: 'No clients match the selected criteria',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Client_ID',
      'Risk_Level',
      'Risk_Score',
      'Total_Value',
      'Holdings_Count',
      'Avg_Volatility',
      'Sector_Concentration',
      'Top_Sector',
      'Region_Concentration',
      'Top_Region',
    ];

    const rows = filteredScores.map(score => [
      score.clientId,
      score.riskLevel,
      score.riskScore,
      score.totalValue,
      score.holdingsCount,
      score.avgVolatility,
      score.sectorConcentration,
      score.topSector,
      score.regionConcentration,
      score.topRegion,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = riskLevel
      ? `risktwo_${riskLevel.toLowerCase()}_risk_report.csv`
      : 'risktwo_full_risk_report.csv';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Downloaded ${filteredScores.length} client records`,
    });
  };

  const sortedScores = useMemo(() => {
    return [...riskScores].sort((a, b) => b.riskScore - a.riskScore);
  }, [riskScores]);

  if (riskScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Reports Available</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload portfolio data to generate comprehensive risk assessment reports
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive client risk assessment reports and exports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV('High')}>
            <Filter className="h-4 w-4 mr-2" />
            High Risk Only
          </Button>
          <Button onClick={() => exportToCSV()}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-success">Low Risk</CardTitle>
            <CardDescription>Well-diversified portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {riskScores.filter(s => s.riskLevel === 'Low').length}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => exportToCSV('Low')}
            >
              Export Low Risk
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-warning">Medium Risk</CardTitle>
            <CardDescription>Moderate monitoring required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {riskScores.filter(s => s.riskLevel === 'Medium').length}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => exportToCSV('Medium')}
            >
              Export Medium Risk
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive">High Risk</CardTitle>
            <CardDescription>Immediate attention needed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {riskScores.filter(s => s.riskLevel === 'High').length}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => exportToCSV('High')}
            >
              Export High Risk
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Client Risk Assessment Summary</CardTitle>
          <CardDescription>
            Detailed risk scores for all {riskScores.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Risk Score</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Holdings</TableHead>
                <TableHead className="text-right">Avg Volatility</TableHead>
                <TableHead>Top Sector</TableHead>
                <TableHead>Top Region</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScores.map((score) => (
                <TableRow key={score.clientId}>
                  <TableCell className="font-medium">{score.clientId}</TableCell>
                  <TableCell>
                    <RiskBadge level={score.riskLevel} />
                  </TableCell>
                  <TableCell className="text-right">{score.riskScore}</TableCell>
                  <TableCell className="text-right">
                    €{score.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{score.holdingsCount}</TableCell>
                  <TableCell className="text-right">{score.avgVolatility}%</TableCell>
                  <TableCell>{score.topSector}</TableCell>
                  <TableCell>{score.topRegion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
