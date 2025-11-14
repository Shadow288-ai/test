import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatNumber';
import { cn } from '@/lib/utils';

interface HoldingsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdings: any[];
  onHoldingClick: (holding: any) => void;
}

export const HoldingsListModal = ({ 
  open, 
  onOpenChange, 
  holdings,
  onHoldingClick 
}: HoldingsListModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">All Holdings</DialogTitle>
          <DialogDescription>
            Complete list of your {holdings.length} portfolio positions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {holdings.map((holding) => {
              const gainLoss = (Number(holding.market_value) - (Number(holding.cost_basis) * Number(holding.shares)));
              const gainLossPercent = (gainLoss / (Number(holding.cost_basis) * Number(holding.shares))) * 100;
              
              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer border border-border/50"
                  onClick={() => {
                    onHoldingClick(holding);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">{holding.stock_ticker}</p>
                      {holding.is_bullish ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {holding.stock_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {holding.asset_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {holding.sector}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Number(holding.portfolio_weight).toFixed(1)}% of portfolio
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold">
                      {formatCurrency(Number(holding.market_value))}
                    </p>
                    <p className={cn(
                      "text-sm font-medium",
                      gainLoss >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(holding.shares).toFixed(2)} shares
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
