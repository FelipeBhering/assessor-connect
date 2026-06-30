import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageCircle, Mail } from "lucide-react";
import { templates, recentSends } from "@/lib/mock-data";
import { formatDatePT } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/comunicacao")({
  head: () => ({
    meta: [
      { title: "Comunicação — AssessorCRM" },
      { name: "description", content: "Templates de mensagem e histórico de envios para seus clientes." },
    ],
  }),
  component: ComPage,
});

const statusStyle = {
  Enviado: "bg-success/15 text-success border-success/30",
  Agendado: "bg-info/15 text-info border-info/30",
  Falhou: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

function ComPage() {
  return (
    <AppShell title="Comunicação">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Templates</h2>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast.message("Novo editor aberto")}>
            <Plus className="size-4" /> Nova mensagem
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t) => {
            const Icon = t.channel === "WhatsApp" ? MessageCircle : Mail;
            return (
              <Card key={t.id} className="shadow-card border-border/60 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-4" /> {t.channel}
                  </div>
                  <CardTitle className="text-sm mt-1">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{t.preview}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.success(`Template "${t.title}" carregado`)}
                  >
                    Usar template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-card border-border/60 overflow-hidden">
          <CardHeader className="pb-3"><CardTitle className="text-base">Envios recentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                    <th className="text-left font-medium px-4 py-2.5">Template</th>
                    <th className="text-left font-medium px-4 py-2.5">Canal</th>
                    <th className="text-left font-medium px-4 py-2.5">Data</th>
                    <th className="text-left font-medium px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSends.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2.5 font-medium">{s.clientName}</td>
                      <td className="px-4 py-2.5">{s.template}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{s.channel}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDatePT(s.date)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={statusStyle[s.status]}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
