import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/RiskBadge';
import { Input } from '@/components/ui/input';
import { Search, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminClients() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const clientData = useMemo(() => {
    return clients.map((client) => {
      const clientHoldings = holdings.filter((h) => h.client_id === client.id);
      const totalValue = clientHoldings.reduce((sum, h) => sum + Number(h.market_value), 0);
      const avgVolatility = clientHoldings.length > 0
        ? clientHoldings.reduce((sum, h) => sum + Number(h.volatility), 0) / clientHoldings.length
        : 0;

      let riskScore = 0;
      if (avgVolatility < 15) riskScore = 30;
      else if (avgVolatility < 25) riskScore = 55;
      else riskScore = 80;

      const riskLevel = riskScore < 40 ? 'Low' : riskScore < 70 ? 'Medium' : 'High';

      return {
        ...client,
        holdingsCount: clientHoldings.length,
        totalValue,
        riskScore,
        riskLevel,
      };
    });
  }, [clients, holdings]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clientData;
    const query = searchQuery.toLowerCase();
    return clientData.filter(
      (client) =>
        client.email?.toLowerCase().includes(query) ||
        client.full_name?.toLowerCase().includes(query)
    );
  }, [clientData, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all client portfolios
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{client.full_name || 'Unnamed Client'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </CardDescription>
                </div>
                <RiskBadge level={client.riskLevel as any} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Holdings</p>
                  <p className="text-lg font-semibold">{client.holdingsCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Portfolio Value</p>
                  <p className="text-lg font-semibold">
                    €{(client.totalValue / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-semibold">{client.riskScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No clients found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
