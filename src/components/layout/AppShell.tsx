import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar title={title} />
        <main className="px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
