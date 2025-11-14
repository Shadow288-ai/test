import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientsTable } from "@/components/ClientsTable";
import { AddClientDialog } from "@/components/AddClientDialog";
import { UploadCSVDialog } from "@/components/UploadCSVDialog";
import { RiskDistributionChart } from "@/components/RiskDistributionChart";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  client_id: string;
  client_name: string;
  portfolio_value: number;
  risk_score: number;
  risk_tier: "Low" | "Medium" | "High";
  created_at: string;
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients((data as Client[]) || []);
    } catch (error) {
      toast({
        title: "Error fetching clients",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: "Client has been removed successfully.",
      });

      fetchClients();
    } catch (error) {
      toast({
        title: "Error deleting client",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleView = (clientId: string) => {
    toast({
      title: "View client details",
      description: "Client detail view coming soon.",
    });
  };

  const stats = {
    total: clients.length,
    low: clients.filter((c) => c.risk_tier === "Low").length,
    medium: clients.filter((c) => c.risk_tier === "Medium").length,
    high: clients.filter((c) => c.risk_tier === "High").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">RiskTwo</h1>
                <p className="text-sm text-muted-foreground">Client Risk Scoring Dashboard</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DashboardStats
          totalClients={stats.total}
          lowRisk={stats.low}
          mediumRisk={stats.medium}
          highRisk={stats.high}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Client Portfolios</h2>
              <div className="flex gap-2">
                <UploadCSVDialog onUploadComplete={fetchClients} />
                <AddClientDialog onClientAdded={fetchClients} />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading clients...</p>
              </div>
            ) : (
              <ClientsTable clients={clients} onView={handleView} onDelete={handleDelete} />
            )}
          </div>

          <div>
            <RiskDistributionChart lowRisk={stats.low} mediumRisk={stats.medium} highRisk={stats.high} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
