import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, MessageCircle, Phone, Calendar as CalIcon } from "lucide-react";
import { agendaEvents, clients } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — AssessorCRM" },
      { name: "description", content: "Calendário semanal de reuniões, ligações e contatos prioritários." },
    ],
  }),
  component: AgendaPage,
});

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8..18

const typeColor = {
  Reunião: "bg-accent/15 border-accent/40 text-accent",
  Ligação: "bg-info/15 border-info/40 text-info",
  WhatsApp: "bg-success/15 border-success/40 text-success",
} as const;

const aiSuggestions = [
  { name: "Ricardo Almeida Souza", reason: "Sem contato há 18 dias" },
  { name: "Marcelo Augusto Ribeiro", reason: "Mercado relevante para perfil" },
  { name: "Beatriz Camargo Neves", reason: "Vencimento múltiplo em 30d" },
  { name: "João Pedro Nogueira", reason: "Sem contato há 22 dias" },
];

function AgendaPage() {
  return (
    <AppShell title="Agenda">
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <Card className="shadow-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Esta semana</CardTitle>
            <NewMeetingSheet />
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[720px]">
              {/* header */}
              <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border bg-muted/30">
                <div />
                {days.map((d) => (
                  <div key={d} className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
                ))}
              </div>
              {/* rows */}
              {hours.map((h) => (
                <div key={h} className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border last:border-0 min-h-[56px]">
                  <div className="px-2 py-2 text-[11px] text-muted-foreground text-right">{h}:00</div>
                  {days.map((_, di) => {
                    const evs = agendaEvents.filter((e) => e.day === di && e.startHour === h);
                    return (
                      <div key={di} className="border-l border-border p-1.5 space-y-1">
                        {evs.map((e) => {
                          const Icon = e.type === "Reunião" ? CalIcon : e.type === "Ligação" ? Phone : MessageCircle;
                          return (
                            <div
                              key={e.id}
                              className={`rounded-md border px-2 py-1.5 text-[11px] ${typeColor[e.type]}`}
                              style={{ minHeight: e.duration * 52 }}
                            >
                              <div className="flex items-center gap-1 font-medium">
                                <Icon className="size-3" /> {e.type}
                              </div>
                              <div className="truncate text-foreground/80 mt-0.5">{e.clientName}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-accent" /> Próximos Contatos Prioritários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiSuggestions.map((s) => (
              <div key={s.name} className="p-3 rounded-md border border-border bg-card hover:border-accent/40 transition-colors">
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.reason}</div>
                <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-accent hover:text-accent">Agendar</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function NewMeetingSheet() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="size-4" /> Nova reunião
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova reunião</SheetTitle>
          <SheetDescription>Agende um contato com seu cliente.</SheetDescription>
        </SheetHeader>
        <form
          className="px-4 pb-4 space-y-4"
          onSubmit={(e) => { e.preventDefault(); setOpen(false); toast.success("Reunião agendada"); }}
        >
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {clients.slice(0, 10).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select defaultValue="Reunião">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Reunião">Reunião</SelectItem>
                <SelectItem value="Ligação">Ligação</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Data</Label><Input type="date" /></div>
            <div className="space-y-1.5"><Label>Hora</Label><Input type="time" /></div>
          </div>
          <div className="space-y-1.5"><Label>Notas</Label><Textarea placeholder="Pauta da reunião…" /></div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Agendar</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
