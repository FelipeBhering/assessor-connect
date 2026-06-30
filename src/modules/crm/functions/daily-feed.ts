import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { requireAdvisorId } from "@/lib/server/auth";
import type { ClientRow } from "@/lib/supabase/types";

export type FeedReason =
  | "overdue_task"
  | "product_maturity"
  | "suitability_expiring"
  | "financial_anniversary"
  | "no_contact";

export interface FeedItem {
  clientId: string;
  name: string;
  city: string | null;
  riskProfile: string;
  aum: number;
  lastContactAt: string | null;
  daysSinceContact: number | null;
  score: number;
  reasons: FeedReason[];
  overdueTaskTitles: string[];
  daysToProductMaturity: number | null;
  daysToSuitabilityExpiry: number | null;
}

const SCORE = {
  overdue_task: 50,
  product_maturity: 40,
  suitability_expiring: 30,
  no_contact_over_30: 35,
  no_contact_over_14: 20,
  no_contact_over_7: 10,
  financial_anniversary: 25,
};

export const getDailyFeed = createServerFn({ method: "GET" }).handler(async () => {
  const advisorId = await requireAdvisorId();
  const supabase = getSupabaseAdmin();
  const today = new Date();
  const todayISO = today.toISOString();

  const [{ data: clients }, { data: overdueTasks }, { data: maturingPositions }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id,name,city,risk_profile,aum,last_contact_at,suitability_expires_at,first_contribution_date")
        .eq("advisor_id", advisorId)
        .eq("status", "active"),
      supabase
        .from("tasks")
        .select("id,client_id,title,due_date,status")
        .eq("advisor_id", advisorId)
        .eq("status", "open")
        .lte("due_date", todayISO),
      supabase
        .from("portfolio_positions")
        .select("client_id,maturity")
        .not("maturity", "is", null)
        .lte("maturity", new Date(Date.now() + 30 * 86400000).toISOString())
        .gte("maturity", todayISO),
    ]);

  const overdueByClient = new Map<string, string[]>();
  for (const t of overdueTasks ?? []) {
    if (!overdueByClient.has(t.client_id)) overdueByClient.set(t.client_id, []);
    overdueByClient.get(t.client_id)!.push(t.title);
  }

  const maturingByClient = new Map<string, number>();
  for (const p of maturingPositions ?? []) {
    const days = Math.ceil((+new Date(p.maturity) - Date.now()) / 86400000);
    const existing = maturingByClient.get(p.client_id);
    if (existing === undefined || days < existing) {
      maturingByClient.set(p.client_id, days);
    }
  }

  const items: FeedItem[] = [];

  for (const c of (clients ?? []) as ClientRow[]) {
    const reasons: FeedReason[] = [];
    let score = 0;

    const overdueTitles = overdueByClient.get(c.id) ?? [];
    if (overdueTitles.length > 0) {
      reasons.push("overdue_task");
      score += SCORE.overdue_task * overdueTitles.length;
    }

    const daysToMaturity = maturingByClient.get(c.id) ?? null;
    if (daysToMaturity !== null) {
      reasons.push("product_maturity");
      score += SCORE.product_maturity * (1 + (30 - daysToMaturity) / 30);
    }

    let daysToSuitability: number | null = null;
    if (c.suitability_expires_at) {
      daysToSuitability = Math.ceil((+new Date(c.suitability_expires_at) - Date.now()) / 86400000);
      if (daysToSuitability <= 30 && daysToSuitability > 0) {
        reasons.push("suitability_expiring");
        score += SCORE.suitability_expiring;
      }
    }

    // Aniversário financeiro: mesmo mês/dia em ±3 dias
    if (c.first_contribution_date) {
      const contrib = new Date(c.first_contribution_date);
      const thisYear = new Date(today.getFullYear(), contrib.getMonth(), contrib.getDate());
      const diffDays = Math.abs((+thisYear - +today) / 86400000);
      if (diffDays <= 3) {
        reasons.push("financial_anniversary");
        score += SCORE.financial_anniversary;
      }
    }

    let daysSince: number | null = null;
    if (c.last_contact_at) {
      daysSince = Math.floor((Date.now() - +new Date(c.last_contact_at)) / 86400000);
      if (daysSince >= 30) score += SCORE.no_contact_over_30;
      else if (daysSince >= 14) score += SCORE.no_contact_over_14;
      else if (daysSince >= 7) score += SCORE.no_contact_over_7;
    } else {
      // nunca contatado
      daysSince = null;
      score += SCORE.no_contact_over_30;
    }

    if (!c.last_contact_at || (daysSince !== null && daysSince >= 7)) {
      reasons.push("no_contact");
    }

    if (score > 0) {
      items.push({
        clientId: c.id,
        name: c.name,
        city: c.city,
        riskProfile: c.risk_profile,
        aum: Number(c.aum),
        lastContactAt: c.last_contact_at,
        daysSinceContact: daysSince,
        score,
        reasons,
        overdueTaskTitles: overdueTitles,
        daysToProductMaturity: daysToMaturity,
        daysToSuitabilityExpiry: daysToSuitability,
      });
    }
  }

  // Ordenar por score decrescente, limitar a 15 por dia
  items.sort((a, b) => b.score - a.score);
  return items.slice(0, 15);
});
