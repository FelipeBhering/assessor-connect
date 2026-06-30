import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskProfile } from "@/lib/mock-data";

export function ProfileBadge({ profile }: { profile: RiskProfile }) {
  const styles: Record<RiskProfile, string> = {
    Conservador: "bg-info/15 text-info border-info/30",
    Moderado: "bg-warning/15 text-warning-foreground border-warning/40",
    Arrojado: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[profile])}>
      {profile}
    </Badge>
  );
}

export function ContactPill({ days }: { days: number }) {
  const tone =
    days < 7 ? "bg-success/15 text-success border-success/30"
    : days <= 15 ? "bg-warning/15 text-warning-foreground border-warning/40"
    : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <span className={cn("inline-flex items-center text-xs px-2 py-0.5 rounded-full border", tone)}>
      {days}d
    </span>
  );
}
