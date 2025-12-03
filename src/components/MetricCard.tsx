import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({ title, value, icon: Icon, description, onClick }: MetricCardProps) => {
  return (
    <Card 
      className={cn(
        "glass-card border-border/50 shadow-md hover:shadow-lg transition-all relative overflow-hidden",
        onClick && "cursor-pointer hover:scale-105"
      )}
      onClick={onClick}
    >
      <div className="glass-filter"></div>
      <div className="glass-overlay"></div>
      <div className="glass-distortion-overlay"></div>
      <div className="glass-specular"></div>
      <div className="glass-content relative z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
