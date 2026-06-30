import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, ListTodo, Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/feed", label: "Feed", icon: ListTodo },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/configuracoes", label: "Mais", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]",
                active ? "text-accent" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
