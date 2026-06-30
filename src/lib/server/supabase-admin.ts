import "@/lib/server/env";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente server-side usando a service_role key: ignora RLS.
 * As policies em sql/001_init.sql já estão prontas para o dia em que
 * trocarmos para um client autenticado por usuário (cookie de sessão).
 * Até lá, o escopo por advisor é garantido manualmente nas server functions
 * via `requireAdvisorId()`.
 *
 * Sem generic `Database` aqui (ver nota em ./types.ts) — cada query tipa o
 * resultado com `.returns<T>()`.
 */
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos (verifique .env.local)",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
