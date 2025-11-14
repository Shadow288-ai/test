import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadCSVDialogProps {
  onUploadComplete: () => void;
}

export const UploadCSVDialog = ({ onUploadComplete }: UploadCSVDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateRiskScore = (
    volatility: number,
    sectorConcentration: number,
    geography: number
  ) => {
    const totalScore = volatility + sectorConcentration + geography;
    let tier: "Low" | "Medium" | "High";

    if (totalScore <= 30) tier = "Low";
    else if (totalScore <= 60) tier = "Medium";
    else tier = "High";

    return { score: totalScore, tier };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const clients = lines.slice(1).filter(line => line.trim()).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const clientData: Record<string, string> = {};
        headers.forEach((header, index) => {
          clientData[header] = values[index];
        });

        const volatility = parseInt(clientData.volatility_score) || 0;
        const sectorConcentration = parseInt(clientData.sector_concentration_score) || 0;
        const geography = parseInt(clientData.geography_score) || 0;
        const { score, tier } = calculateRiskScore(volatility, sectorConcentration, geography);

        return {
          client_id: clientData.client_id,
          client_name: clientData.client_name,
          portfolio_value: parseFloat(clientData.portfolio_value) || 0,
          risk_score: score,
          risk_tier: tier,
          volatility_score: volatility,
          sector_concentration_score: sectorConcentration,
          geography_score: geography,
          notes: clientData.notes || "",
        };
      });

      const { error } = await supabase.from("clients").insert(clients);

      if (error) throw error;

      toast({
        title: "CSV uploaded successfully",
        description: `${clients.length} clients have been imported.`,
      });

      setOpen(false);
      onUploadComplete();
    } catch (error) {
      toast({
        title: "Error uploading CSV",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Client Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with client portfolio data. Required columns: client_id, client_name,
            portfolio_value, volatility_score, sector_concentration_score, geography_score
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <span className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
          </div>
          {loading && (
            <p className="text-sm text-center text-muted-foreground">Processing CSV...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
