import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileBadge } from "@/components/ProfileBadge";
import {
  AlertTriangle, CheckSquare, Cake, Clock, MessageCircle, Phone,
  Loader2, ChevronRight, Star,
} from "lucide-react";
import { useDailyFeed, useRunAlertChecks } from "@/modules/crm/hooks";
import { AlertsPanel } from "@/modules/crm/components/AlertsPanel";
import { formatBRL, daysAgo, initials } from "@/lib/format";
import type { FeedItem, FeedReason } from "@/modules/crm/functions/daily-feed";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed do Dia — AssessorCRM" },
      { name: "description", content: "Clientes prioritários para contatar hoje." },
    ],
  }),
  component: FeedPage,
});

const reasonConfig: Record<FeedReason, { label: string; icon: React.ElementType; color: string }> = {
  overdue_task:          { label: "Tarefa atrasada",       icon: CheckSquare,   color: "text-destructive" },
  product_maturity:      { label: "Produto vencendo",      icon: AlertTriangle, color: "text-warning-foreground" },
  suitability_expiring:  { label: "Suitability expirando", icon: Clock,         color: "text-warning-foreground" },
  financial_anniversary: { label: "Aniversário financeiro",icon: Cake,          color: "text-accent" },
  no_contact:            { label: "Sem contato recente",   icon: Phone,         color: "text-muted-foreground" },
};

function ScoreBadge({ score }: { score: number }) {
  const level = score >= 80 ? "destructive" : score >= 40 ? "secondary" : "outline";
  return (
    <Badge variant={level} className="text-xs tabular-nums shrink-0">
      {Math.round(score)}pts
    </Badge>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className="shadow-card border-border/60 hover:shadow-card-hover transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
            {initials(item.name)}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <Link
                  to="/clientes/$id"
                  params={{ id: item.clientId }}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                {item.city && (
                  <span className="text-xs text-muted-foreground ml-1.5">{item.city}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ScoreBadge score={item.score} />
                <ProfileBadge profile={item.riskProfile as "Conservador" | "Moderado" | "Arrojado"} />
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground">{formatBRL(item.aum, { compact: true })}</span>
              {item.daysSinceContact !== null ? (
                <span>{item.daysSinceContact}d sem contato</span>
              ) : (
                <span className="text-destructive">Nunca contatado</span>
              )}
              {item.daysToProductMaturity !== null && (
                <span className="text-warning-foreground">Produto vence em {item.daysToProductMaturity}d</span>
              )}
              {item.daysToSuitabilityExpiry !== null && item.daysToSuitabilityExpiry <= 30 && (
                <span className="text-warning-foreground">Suitability expira em {item.daysToSuitabilityExpiry}d</span>
              )}
            </div>

            {/* Motivos */}
            <div className="flex flex-wrap gap-1.5">
              {item.reasons.map((r) => {
                const cfg = reasonConfig[r];
                const Icon = cfg.icon;
                return (
                  <span key={r} className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                  </span>
                );
              })}
            </div>

            {/* Tarefas atrasadas */}
            {item.overdueTaskTitles.length > 0 && (
              <div className="space-y-0.5">
                {item.overdueTaskTitles.map((t, i) => (
                  <div key={i} className="text-xs text-destructive flex items-center gap-1">
                    <CheckSquare className="size-3 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1">
              <MessageCircle className="size-3" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1">
              <Phone className="size-3" /> Ligar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedPage() {
  const { data: items, isLoading, isError, refetch } = useDailyFeed();
  const runChecks = useRunAlertChecks();

  // Verificar alertas toda vez que o feed carrega
  if (!isLoading && !runChecks.isPending && !runChecks.isSuccess) {
    runChecks.mutate();
  }

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <AppShell title="Feed do Dia">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">
              {today.charAt(0).toUpperCase() + today.slice(1)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Calculando prioridades…" : `${items?.length ?? 0} cliente(s) para contatar hoje`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Atualizar
          </Button>
        </div>

        {/* Painel de alertas */}
        <AlertsPanel />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Calculando prioridades…
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 text-destructive">
            Não foi possível carregar o feed. Tente atualizar.
          </div>
        )}

        {/* Lista */}
        {!isLoading && !isError && (
          <>
            {(items?.length ?? 0) === 0 ? (
              <Card className="shadow-card border-border/60">
                <CardContent className="py-16 text-center space-y-2">
                  <Star className="mx-auto size-10 text-accent opacity-60" />
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm text-muted-foreground">
                    Nenhum cliente urgente para hoje. Ótimo trabalho.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {items!.map((item) => (
                  <FeedCard key={item.clientId} item={item} />
                ))}
                {(items?.length ?? 0) >= 15 && (
                  <Link to="/clientes" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground py-2">
                    Ver todos os clientes <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>
            )}

            {/* Legenda de score */}
            <Card className="shadow-card border-border/60 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Como a prioridade é calculada</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-2">
                {Object.entries(reasonConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className={`flex items-center gap-2 text-xs ${cfg.color}`}>
                      <Icon className="size-3.5 shrink-0" />
                      <span>{cfg.label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
