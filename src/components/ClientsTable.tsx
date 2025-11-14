import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Client {
  id: string;
  client_id: string;
  client_name: string;
  portfolio_value: number;
  risk_score: number;
  risk_tier: "Low" | "Medium" | "High";
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  onView: (clientId: string) => void;
  onDelete: (clientId: string) => void;
}

export const ClientsTable = ({ clients, onView, onDelete }: ClientsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client ID</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead className="text-right">Portfolio Value</TableHead>
            <TableHead className="text-center">Risk Score</TableHead>
            <TableHead className="text-center">Risk Tier</TableHead>
            <TableHead className="text-right">Date Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                No clients found. Add your first client to get started.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.client_id}</TableCell>
                <TableCell>{client.client_name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(client.portfolio_value)}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {client.risk_score}
                </TableCell>
                <TableCell className="text-center">
                  <RiskBadge tier={client.risk_tier} />
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {format(new Date(client.created_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(client.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
