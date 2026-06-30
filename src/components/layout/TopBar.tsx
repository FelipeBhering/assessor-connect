import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { clients, notifications } from "@/lib/mock-data";
import { initials } from "@/lib/format";

export function TopBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 lg:px-8 h-14">
        <h1 className="text-lg lg:text-xl font-semibold tracking-tight text-foreground truncate">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors min-w-[240px]"
          >
            <Search className="size-4" />
            <span>Buscar clientes…</span>
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
          </button>
          <button onClick={() => setOpen(true)} className="sm:hidden h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-muted-foreground">
            <Search className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2.5">
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="secondary" className="text-[10px]">{n.type === "warning" ? "Atenção" : n.type === "destructive" ? "Urgente" : "Info"}</Badge>
                    <span className="ml-auto text-[11px] text-muted-foreground">{n.time}</span>
                  </div>
                  <span className="text-sm">{n.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar clientes por nome…" />
        <CommandList>
          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
          <CommandGroup heading="Clientes">
            {clients.map((c) => (
              <CommandItem
                key={c.id}
                value={c.name}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/clientes/$id", params: { id: c.id } });
                }}
              >
                <div className="size-7 rounded-full bg-muted text-foreground grid place-items-center text-xs font-semibold mr-2">
                  {initials(c.name)}
                </div>
                <div className="flex flex-col">
                  <span>{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.profile} · {c.city}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <Link to="/" className="sr-only">Home</Link>
    </header>
  );
}
