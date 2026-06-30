import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — AssessorCRM" },
      { name: "description", content: "Perfil, plano, integrações e preferências de notificação." },
    ],
  }),
  component: SettingsPage,
});

const integrations = [
  { name: "WhatsApp Business", desc: "Envio de mensagens diretas", connected: true },
  { name: "BTG Pactual", desc: "Sincronização de carteiras", connected: false },
  { name: "XP Investimentos", desc: "Sincronização de carteiras", connected: false },
  { name: "Google Calendar", desc: "Sincronização de agenda", connected: true },
];

const notifPrefs = [
  { label: "Alertas de vencimento de produtos", on: true },
  { label: "Lembretes de follow-up", on: true },
  { label: "Novas indicações recebidas", on: true },
  { label: "Resumo semanal por email", on: false },
];

function SettingsPage() {
  return (
    <AppShell title="Configurações">
      <div className="space-y-6 max-w-3xl">
        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Nome</Label><Input defaultValue="Marina Reis" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="marina@assessor.com" type="email" /></div>
            <div className="space-y-1.5"><Label>CPF/CNPJ</Label><Input defaultValue="123.456.789-00" /></div>
            <div className="space-y-1.5"><Label>Corretora vinculada</Label><Input defaultValue="XP Investimentos" /></div>
            <div className="sm:col-span-2">
              <Button className="bg-primary text-primary-foreground" onClick={() => toast.success("Perfil atualizado")}>Salvar alterações</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Plano</CardTitle>
            <Badge className="bg-accent text-accent-foreground">Plano Pro</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Clientes" value="128 / 250" />
              <Stat label="Envios este mês" value="412 / 2000" />
              <Stat label="Renovação" value="12 dias" />
            </div>
            <Button variant="outline" size="sm">Gerenciar plano</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader><CardTitle className="text-base">Integrações</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {integrations.map((i) => (
              <div key={i.name} className="p-4 rounded-md border border-border flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2">
                    {i.name}
                    {i.connected && <Check className="size-3.5 text-success" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{i.desc}</div>
                </div>
                <Button size="sm" variant={i.connected ? "outline" : "default"} className={i.connected ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
                  {i.connected ? "Conectado" : "Conectar"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader><CardTitle className="text-base">Notificações</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {notifPrefs.map((p) => (
              <div key={p.label} className="py-3 flex items-center justify-between">
                <span className="text-sm">{p.label}</span>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}
