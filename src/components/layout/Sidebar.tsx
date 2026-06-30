import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, KanbanSquare, Calendar, MessageSquare, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/comunicacao", label: "Comunicação", icon: MessageSquare },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex-col z-30">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="size-9 rounded-lg bg-accent grid place-items-center">
          <TrendingUp className="size-5 text-accent-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">AssessorCRM</div>
          <div className="text-xs text-sidebar-foreground/60">Investimentos</div>
        </div>
      </div>
      <nav className="px-3 flex-1 space-y-1 mt-2">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-accent grid place-items-center text-accent-foreground text-sm font-semibold">
            MR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Marina Reis</div>
            <div className="text-xs text-sidebar-foreground/60">Plano Pro</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
