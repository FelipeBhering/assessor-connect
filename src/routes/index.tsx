import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Users, TrendingUp, Wallet, CalendarDays, MessageCircle, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { clients, dashboardSummary, captacaoMensal, interactions, todoContacts } from "@/lib/mock-data";
import { formatBRL, initials } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AssessorCRM" },
      { name: "description", content: "Comando diário do assessor de investimentos: contatos prioritários, captação e KPIs." },
    ],
  }),
  component: Dashboard,
});

const iconForType = {
  WhatsApp: MessageCircle,
  Email: Mail,
  Ligação: Phone,
  Reunião: Calendar,
} as const;

function KPI({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: typeof Users; accent?: boolean }) {
  return (
    <Card className="shadow-card border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
            {sub && <div className="mt-1 text-xs text-success flex items-center gap-1"><ArrowUpRight className="size-3" />{sub}</div>}
          </div>
          <div className={`size-10 rounded-lg grid place-items-center ${accent ? "bg-accent/15 text-accent" : "bg-primary/5 text-primary"}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const todo = todoContacts
    .map((t) => ({ ...t, client: clients.find((c) => c.id === t.clientId)! }))
    .filter((t) => t.client);

  const recent = interactions.slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Bom dia, Marina. Aqui está o seu dia.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Total Clientes" value={dashboardSummary.totalClientes.toString()} sub="+4 este mês" icon={Users} />
          <KPI label="AUM Total" value={formatBRL(dashboardSummary.aumTotal, { compact: true })} sub="+2.1% MoM" icon={Wallet} accent />
          <KPI label="Captação do Mês" value={formatBRL(dashboardSummary.captacaoMes, { compact: true })} sub="Meta 110%" icon={TrendingUp} />
          <KPI label="Reuniões esta Semana" value={dashboardSummary.reunioesSemana.toString()} icon={CalendarDays} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Hoje você deve contatar */}
          <Card className="lg:col-span-1 shadow-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Hoje você deve contatar
                <Badge variant="secondary" className="font-normal">{todo.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todo.map(({ client, reason }) => (
                <Link
                  key={client.id}
                  to="/clientes/$id"
                  params={{ id: client.id }}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                    {initials(client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{client.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{reason}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-accent hover:text-accent">Abrir</Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Captação Mensal */}
          <Card className="lg:col-span-2 shadow-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Captação Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={captacaoMensal} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      formatter={(v: number) => formatBRL(v)}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recent.map((i) => {
              const client = clients.find((c) => c.id === i.clientId);
              const Icon = iconForType[i.type];
              return (
                <div key={i.id} className="py-3 flex items-start gap-3">
                  <div className="size-8 rounded-md bg-muted grid place-items-center text-muted-foreground shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{client?.name ?? "Cliente"}</span>
                      <span className="text-muted-foreground"> · {i.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{i.summary}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(i.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
