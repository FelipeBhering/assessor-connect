import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { requireAdvisorId } from "@/lib/server/auth";
import type { AlertRow } from "@/lib/supabase/types";

// Configurações padrão de alerta (podem virar preferências do assessor no futuro)
const FORGOTTEN_CLIENT_DAYS = 30;
const PRODUCT_MATURITY_WARN_DAYS = 15;
const SUITABILITY_WARN_DAYS = 30;
const ANNIVERSARY_WINDOW_DAYS = 3;

export const getOpenAlerts = createServerFn({ method: "GET" }).handler(async () => {
  const advisorId = await requireAdvisorId();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("alerts")
    .select("*, clients(name, risk_profile, aum)")
    .eq("advisor_id", advisorId)
    .eq("status", "open")
    .order("trigger_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as (AlertRow & { clients: { name: string; risk_profile: string; aum: number } | null })[];
});

export const dismissAlert = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("alerts")
      .update({ status: "dismissed" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Roda os checks e insere alertas novos (idempotente por tipo+cliente — não duplica)
export const runAlertChecks = createServerFn({ method: "POST" }).handler(async () => {
  const advisorId = await requireAdvisorId();
  const supabase = getSupabaseAdmin();
  const now = new Date();

  const [{ data: clients }, { data: positions }] = await Promise.all([
    supabase
      .from("clients")
      .select("id,last_contact_at,suitability_expires_at,first_contribution_date")
      .eq("advisor_id", advisorId)
      .eq("status", "active"),
    supabase
      .from("portfolio_positions")
      .select("client_id,maturity")
      .not("maturity", "is", null),
  ]);

  // Buscar alertas já abertos para evitar duplicar
  const { data: existingAlerts } = await supabase
    .from("alerts")
    .select("client_id,type")
    .eq("advisor_id", advisorId)
    .eq("status", "open");

  const existing = new Set(
    (existingAlerts ?? []).map((a) => `${a.client_id}:${a.type}`),
  );

  const toInsert: {
    client_id: string;
    advisor_id: string;
    type: string;
    trigger_date: string;
    config: Record<string, unknown>;
  }[] = [];

  for (const c of clients ?? []) {
    // Clientes esquecidos
    if (!existing.has(`${c.id}:forgotten_client`)) {
      const lastContact = c.last_contact_at ? new Date(c.last_contact_at) : null;
      const daysSince = lastContact
        ? Math.floor((+now - +lastContact) / 86400000)
        : FORGOTTEN_CLIENT_DAYS + 1;
      if (daysSince >= FORGOTTEN_CLIENT_DAYS) {
        toInsert.push({
          client_id: c.id,
          advisor_id: advisorId,
          type: "forgotten_client",
          trigger_date: now.toISOString(),
          config: { days_since_contact: daysSince },
        });
      }
    }

    // Suitability expirando
    if (!existing.has(`${c.id}:suitability_expiring`) && c.suitability_expires_at) {
      const daysLeft = Math.ceil(
        (+new Date(c.suitability_expires_at) - +now) / 86400000,
      );
      if (daysLeft > 0 && daysLeft <= SUITABILITY_WARN_DAYS) {
        toInsert.push({
          client_id: c.id,
          advisor_id: advisorId,
          type: "suitability_expiring",
          trigger_date: c.suitability_expires_at,
          config: { days_left: daysLeft },
        });
      }
    }

    // Aniversário financeiro (±ANNIVERSARY_WINDOW_DAYS)
    if (!existing.has(`${c.id}:financial_anniversary`) && c.first_contribution_date) {
      const contrib = new Date(c.first_contribution_date);
      const thisYear = new Date(now.getFullYear(), contrib.getMonth(), contrib.getDate());
      const diffDays = Math.abs((+thisYear - +now) / 86400000);
      if (diffDays <= ANNIVERSARY_WINDOW_DAYS) {
        toInsert.push({
          client_id: c.id,
          advisor_id: advisorId,
          type: "financial_anniversary",
          trigger_date: thisYear.toISOString(),
          config: { years: now.getFullYear() - contrib.getFullYear() },
        });
      }
    }
  }

  // Vencimentos de produto
  for (const p of positions ?? []) {
    if (!p.maturity) continue;
    const key = `${p.client_id}:product_maturity`;
    if (existing.has(key)) continue;
    const daysLeft = Math.ceil((+new Date(p.maturity) - +now) / 86400000);
    if (daysLeft > 0 && daysLeft <= PRODUCT_MATURITY_WARN_DAYS) {
      toInsert.push({
        client_id: p.client_id,
        advisor_id: advisorId,
        type: "product_maturity",
        trigger_date: p.maturity,
        config: { days_left: daysLeft },
      });
      existing.add(key); // evitar duplicar se cliente tem múltiplos produtos vencendo
    }
  }

  if (toInsert.length > 0) {
    await supabase.from("alerts").insert(toInsert);
  }

  return { inserted: toInsert.length };
});
