import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Cake, Phone, X, RefreshCw } from "lucide-react";
import { useAlerts, useDismissAlert, useRunAlertChecks } from "@/modules/crm/hooks";
import { formatBRL } from "@/lib/format";
import type { AlertType } from "@/lib/supabase/types";

const alertConfig: Record<AlertType, { label: string; icon: React.ElementType; color: string }> = {
  forgotten_client:      { label: "Cliente esquecido",      icon: Phone,         color: "text-muted-foreground" },
  product_maturity:      { label: "Produto vencendo",        icon: AlertTriangle, color: "text-warning-foreground" },
  suitability_expiring:  { label: "Suitability expirando",   icon: Clock,         color: "text-warning-foreground" },
  financial_anniversary: { label: "Aniversário financeiro",  icon: Cake,          color: "text-accent" },
};

export function AlertsPanel() {
  const { data: alerts, isLoading } = useAlerts();
  const dismiss = useDismissAlert();
  const runChecks = useRunAlertChecks();

  if (isLoading) return null;
  if (!alerts || alerts.length === 0) return null;

  return (
    <Card className="shadow-card border-warning/30 bg-warning/5">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning-foreground" />
          Alertas
          <Badge variant="secondary" className="text-xs">{alerts.length}</Badge>
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => runChecks.mutate()}
          disabled={runChecks.isPending}
        >
          <RefreshCw className={`size-3 mr-1 ${runChecks.isPending ? "animate-spin" : ""}`} />
          Verificar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {alerts.map((alert) => {
            const cfg = alertConfig[alert.type as AlertType];
            const Icon = cfg?.icon ?? AlertTriangle;
            const client = alert.clients;
            const config = alert.config as Record<string, unknown>;

            return (
              <div key={alert.id} className="flex items-start gap-3 px-4 py-3">
                <Icon className={`size-4 mt-0.5 shrink-0 ${cfg?.color ?? "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to="/clientes/$id"
                      params={{ id: alert.client_id }}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {client?.name ?? "Cliente"}
                    </Link>
                    {client && (
                      <span className="text-xs text-muted-foreground">
                        {formatBRL(Number(client.aum), { compact: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cfg?.label}
                    {config.days_since_contact !== undefined && ` — ${config.days_since_contact}d sem contato`}
                    {config.days_left !== undefined && ` — ${config.days_left}d restantes`}
                    {config.years !== undefined && ` — ${config.years} ano(s)`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => dismiss.mutate(alert.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
