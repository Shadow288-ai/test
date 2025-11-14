import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricDetail {
  label: string;
  value: string | number;
  description?: string;
}

interface MetricDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon: LucideIcon;
  mainValue: string | number;
  details: MetricDetail[];
  explanation?: string;
}

export const MetricDetailModal = ({ 
  open, 
  onOpenChange, 
  title, 
  icon: Icon, 
  mainValue,
  details,
  explanation 
}: MetricDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
              <DialogDescription className="text-xl font-bold mt-1">
                {mainValue}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {explanation && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{explanation}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {details.map((detail, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{detail.label}</p>
                      {detail.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {detail.description}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold">{detail.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
