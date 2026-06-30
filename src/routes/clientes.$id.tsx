import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileBadge } from "@/components/ProfileBadge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, Mail, Phone, MapPin, Sparkles, ChevronDown, AlertTriangle, Check, MessageCircle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { clients, interactions } from "@/lib/mock-data";
import { formatBRL, formatDatePT, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clientes/$id")({
  head: ({ params }) => {
    const c = clients.find((x) => x.id === params.id);
    return {
      meta: [
        { title: `${c?.name ?? "Cliente"} — AssessorCRM` },
        { name: "description", content: `Ficha do cliente ${c?.name ?? ""}: carteira, histórico e suitability.` },
      ],
    };
  },
  loader: ({ params }) => {
    const c = clients.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return { client: c };
  },
  component: ClientDetail,
  notFoundComponent: () => (
    <AppShell title="Cliente">
      <div className="text-center py-20 text-muted-foreground">Cliente não encontrado.</div>
    </AppShell>
  ),
});

const categoryColors = {
  "Renda Fixa": "var(--chart-1)",
  "Renda Variável": "var(--chart-2)",
  "FIIs": "var(--chart-3)",
  "Internacional": "var(--chart-4)",
} as const;

const interactionIcons = {
  WhatsApp: MessageCircle,
  Email: Mail,
  Ligação: Phone,
  Reunião: Calendar,
} as const;

function ClientDetail() {
  const { id } = Route.useParams();
  const client = clients.find((c) => c.id === id)!;
  const history = interactions.filter((i) => i.clientId === client.id);

  const portfolioByCat = Object.entries(
    client.portfolio.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + p.value;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const totalPortfolio = portfolioByCat.reduce((s, p) => s + p.value, 0);

  const expiringSoon = client.portfolio.find((p) => {
    if (!p.maturity) return false;
    const days = Math.floor((+new Date(p.maturity) - Date.now()) / 86400000);
    return days > 0 && days <= 15;
  });

  return (
    <AppShell title={client.name}>
      <div className="space-y-5">
        <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar para clientes
        </Link>

        {/* Header card */}
        <Card className="shadow-card border-border/60">
          <CardContent className="p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="size-14 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-lg font-semibold">
                  {initials(client.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold truncate">{client.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <ProfileBadge profile={client.profile} />
                    {client.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">AUM</div>
                <div className="text-2xl font-semibold tracking-tight">{formatBRL(client.aum, { compact: true })}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="portfolio">Carteira</TabsTrigger>
            <TabsTrigger value="suitability">Suitability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="shadow-card border-border/60">
                <CardHeader className="pb-3"><CardTitle className="text-base">Contato</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{client.email}</div>
                  <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{client.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{client.city}</div>
                  <div className="pt-3 flex gap-2">
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><MessageCircle className="size-4" /> WhatsApp</Button>
                    <Button size="sm" variant="outline">Ligar</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/60 lg:col-span-2">
                <CardHeader className="pb-3"><CardTitle className="text-base">Notas</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 leading-relaxed">{client.notes}</p>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <Stat label="Origem" value={client.origin} />
                    <Stat label="Último contato" value={formatDatePT(client.lastContact)} />
                    <Stat label="Próxima ação" value={client.nextAction} />
                    <Stat label="Suitability até" value={formatDatePT(client.suitabilityExpires)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="shadow-card border-border/60">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {history.map((h) => {
                    const Icon = interactionIcons[h.type];
                    return (
                      <div key={h.id} className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="size-9 rounded-md bg-muted grid place-items-center text-muted-foreground shrink-0">
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{h.type}</span>
                              <span className="text-xs text-muted-foreground">{formatDatePT(h.date)}</span>
                            </div>
                            <p className="text-sm text-foreground/80 mt-1">{h.summary}</p>
                            {h.aiSummary && (
                              <Collapsible>
                                <CollapsibleTrigger className="mt-3 flex items-center gap-1.5 text-xs text-accent font-medium hover:underline">
                                  <Sparkles className="size-3.5" /> Ver resumo da IA
                                  <ChevronDown className="size-3.5" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 p-3 rounded-md bg-accent/5 border border-accent/20 text-sm text-foreground/80">
                                    {h.aiSummary}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {history.length === 0 && (
                    <div className="p-10 text-center text-sm text-muted-foreground">Sem interações ainda.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4 space-y-4">
            {expiringSoon && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-warning/40 bg-warning/10">
                <AlertTriangle className="size-5 text-warning-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Produto vencendo em breve</div>
                  <div className="text-foreground/80">{expiringSoon.name} — vence em {Math.floor((+new Date(expiringSoon.maturity!) - Date.now()) / 86400000)} dias.</div>
                </div>
              </div>
            )}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="shadow-card border-border/60">
                <CardHeader className="pb-3"><CardTitle className="text-base">Alocação</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioByCat}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {portfolioByCat.map((p) => (
                            <Cell key={p.name} fill={categoryColors[p.name as keyof typeof categoryColors]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => `${formatBRL(v, { compact: true })} (${((v / totalPortfolio) * 100).toFixed(0)}%)`}
                          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/60 lg:col-span-2 overflow-hidden">
                <CardHeader className="pb-3"><CardTitle className="text-base">Produtos</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="text-left font-medium px-4 py-2.5">Produto</th>
                          <th className="text-right font-medium px-4 py-2.5">Valor</th>
                          <th className="text-left font-medium px-4 py-2.5">Vencimento</th>
                          <th className="text-left font-medium px-4 py-2.5">Yield</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {client.portfolio.map((p) => (
                          <tr key={p.name}>
                            <td className="px-4 py-2.5">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.category}</div>
                            </td>
                            <td className="px-4 py-2.5 text-right font-medium">{formatBRL(p.value, { compact: true })}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{p.maturity ? formatDatePT(p.maturity) : "—"}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{p.yield}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suitability" className="mt-4">
            <Card className="shadow-card border-border/60">
              <CardHeader><CardTitle className="text-base">Questionário de Suitability</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Stepper steps={["Dados pessoais", "Objetivos", "Tolerância", "Resultado"]} />
                <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <Stat label="Perfil apurado" value={client.profile} />
                  <Stat label="Válido até" value={formatDatePT(client.suitabilityExpires)} />
                  <div className="flex items-end">
                    <Button className="bg-primary text-primary-foreground">Atualizar suitability</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}

function Stepper({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < steps.length - 1;
        const current = i === steps.length - 1;
        return (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "size-8 rounded-full grid place-items-center text-xs font-semibold shrink-0",
              done ? "bg-success text-success-foreground" : current ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}>
              {done ? <Check className="size-4" /> : i + 1}
            </div>
            <div className="text-xs flex-1">
              <div className="font-medium">{s}</div>
            </div>
            {i < steps.length - 1 && <div className="hidden sm:block flex-1 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
