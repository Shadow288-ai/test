import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  tier: "Low" | "Medium" | "High";
  className?: string;
}

export const RiskBadge = ({ tier, className }: RiskBadgeProps) => {
  const variants = {
    Low: "bg-risk-low text-risk-low-foreground hover:bg-risk-low/90",
    Medium: "bg-risk-medium text-risk-medium-foreground hover:bg-risk-medium/90",
    High: "bg-risk-high text-risk-high-foreground hover:bg-risk-high/90",
  };

  return (
    <Badge className={cn(variants[tier], "font-semibold", className)}>
      {tier} Risk
    </Badge>
  );
};
