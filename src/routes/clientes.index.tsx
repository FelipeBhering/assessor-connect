import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileBadge, ContactPill } from "@/components/ProfileBadge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Search, Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { clients, type RiskProfile, type Origin } from "@/lib/mock-data";
import { formatBRL, daysAgo, initials } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes — AssessorCRM" },
      { name: "description", content: "Sua base de clientes filtrada por perfil, origem e faixa de AUM." },
    ],
  }),
  component: ClientesPage,
});

const profiles: RiskProfile[] = ["Conservador", "Moderado", "Arrojado"];
const origins: Origin[] = ["Indicação", "Evento", "Redes Sociais", "Site", "Parceria"];
const aumBands = [
  { label: "Até R$ 500k", min: 0, max: 500_000 },
  { label: "R$ 500k–2M", min: 500_000, max: 2_000_000 },
  { label: "R$ 2M–5M", min: 2_000_000, max: 5_000_000 },
  { label: "Acima R$ 5M", min: 5_000_000, max: Infinity },
];

function ClientesPage() {
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState<RiskProfile[]>([]);
  const [originFilter, setOriginFilter] = useState<Origin[]>([]);
  const [bandIdx, setBandIdx] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "table">("table");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (profileFilter.length && !profileFilter.includes(c.profile)) return false;
      if (originFilter.length && !originFilter.includes(c.origin)) return false;
      if (bandIdx !== null) {
        const b = aumBands[bandIdx];
        if (c.aum < b.min || c.aum > b.max) return false;
      }
      return true;
    });
  }, [search, profileFilter, originFilter, bandIdx]);

  const toggle = <T,>(arr: T[], set: (a: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <AppShell title="Clientes">
      <div className="space-y-5">
        {/* Search + toggle + cta */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setView("table")}
                className={cn("px-3 h-10 flex items-center gap-1.5 text-sm", view === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}
              >
                <ListIcon className="size-4" /> <span className="hidden sm:inline">Tabela</span>
              </button>
              <button
                onClick={() => setView("grid")}
                className={cn("px-3 h-10 flex items-center gap-1.5 text-sm", view === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}
              >
                <LayoutGrid className="size-4" /> <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
            <NewClientSheet />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Perfil:</span>
          {profiles.map((p) => (
            <Chip key={p} active={profileFilter.includes(p)} onClick={() => toggle(profileFilter, setProfileFilter, p)}>{p}</Chip>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-3 mr-1">Origem:</span>
          {origins.map((o) => (
            <Chip key={o} active={originFilter.includes(o)} onClick={() => toggle(originFilter, setOriginFilter, o)}>{o}</Chip>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-3 mr-1">AUM:</span>
          {aumBands.map((b, i) => (
            <Chip key={b.label} active={bandIdx === i} onClick={() => setBandIdx(bandIdx === i ? null : i)}>{b.label}</Chip>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">{filtered.length} cliente(s)</div>

        {view === "table" ? (
          <Card className="shadow-card border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Cliente</th>
                    <th className="text-right font-medium px-4 py-3">AUM</th>
                    <th className="text-left font-medium px-4 py-3">Perfil</th>
                    <th className="text-left font-medium px-4 py-3">Último contato</th>
                    <th className="text-left font-medium px-4 py-3">Próxima ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => {
                    const d = daysAgo(c.lastContact);
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link to="/clientes/$id" params={{ id: c.id }} className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                              {initials(c.name)}
                            </div>
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.city}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatBRL(c.aum, { compact: true })}</td>
                        <td className="px-4 py-3"><ProfileBadge profile={c.profile} /></td>
                        <td className="px-4 py-3"><ContactPill days={d} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{c.nextAction}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const d = daysAgo(c.lastContact);
              return (
                <Link key={c.id} to="/clientes/$id" params={{ id: c.id }}>
                  <Card className="shadow-card border-border/60 hover:shadow-card-hover transition-shadow h-full">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.city}</div>
                        </div>
                        <ContactPill days={d} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">AUM</div>
                          <div className="font-semibold">{formatBRL(c.aum, { compact: true })}</div>
                        </div>
                        <ProfileBadge profile={c.profile} />
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
                        Próxima ação: {c.nextAction}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="mx-auto size-8 mb-2 opacity-40" />
            Nenhum cliente encontrado com esses filtros.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-2.5 py-1 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function NewClientSheet() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="size-4" /> Novo Cliente
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Novo cliente</SheetTitle>
          <SheetDescription>Cadastre um novo cliente para iniciar o relacionamento.</SheetDescription>
        </SheetHeader>
        <form
          className="px-4 pb-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success("Cliente criado com sucesso");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Ex: João da Silva" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="joao@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="+55 11 98000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aum">AUM estimado (R$)</Label>
            <Input id="aum" type="number" placeholder="500000" />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground w-full">Perfil de risco</span>
            {profiles.map((p) => <Badge key={p} variant="outline" className="cursor-pointer">{p}</Badge>)}
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Criar cliente</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
