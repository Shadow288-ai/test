import { RiskLevel } from '@/types/portfolio';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge = ({ level, className }: RiskBadgeProps) => {
  const variants = {
    Low: 'bg-success text-success-foreground',
    Medium: 'bg-warning text-warning-foreground',
    High: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Badge className={cn(variants[level], 'font-semibold', className)}>
      {level} Risk
    </Badge>
  );
};
