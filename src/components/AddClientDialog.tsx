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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  onClientAdded: () => void;
}

export const AddClientDialog = ({ onClientAdded }: AddClientDialogProps) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const clientId = formData.get("client_id") as string;
    const clientName = formData.get("client_name") as string;
    const portfolioValue = parseFloat(formData.get("portfolio_value") as string);
    const volatility = parseInt(formData.get("volatility") as string) || 0;
    const sectorConcentration = parseInt(formData.get("sector_concentration") as string) || 0;
    const geography = parseInt(formData.get("geography") as string) || 0;
    const notes = formData.get("notes") as string;

    const { score, tier } = calculateRiskScore(volatility, sectorConcentration, geography);

    try {
      const { error } = await supabase.from("clients").insert({
        client_id: clientId,
        client_name: clientName,
        portfolio_value: portfolioValue,
        risk_score: score,
        risk_tier: tier,
        volatility_score: volatility,
        sector_concentration_score: sectorConcentration,
        geography_score: geography,
        notes,
      });

      if (error) throw error;

      toast({
        title: "Client added successfully",
        description: `${clientName} has been added with ${tier} risk classification.`,
      });

      setOpen(false);
      onClientAdded();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error adding client",
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter client portfolio details. Risk score will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input id="client_id" name="client_id" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input id="client_name" name="client_name" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio_value">Portfolio Value ($)</Label>
            <Input
              id="portfolio_value"
              name="portfolio_value"
              type="number"
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="volatility">Volatility Score (0-100)</Label>
            <Input
              id="volatility"
              name="volatility"
              type="number"
              min="0"
              max="100"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector_concentration">Sector Concentration Score (0-100)</Label>
            <Input
              id="sector_concentration"
              name="sector_concentration"
              type="number"
              min="0"
              max="100"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geography">Geography Risk Score (0-100)</Label>
            <Input
              id="geography"
              name="geography"
              type="number"
              min="0"
              max="100"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
