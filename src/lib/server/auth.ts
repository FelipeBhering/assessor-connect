import "@/lib/server/env";

/**
 * Stub temporário: login com Supabase Auth ainda não foi implementado.
 * Até lá, todas as server functions do CRM rodam como esse advisor fixo
 * (precisa existir a linha correspondente em `advisors` no Supabase).
 * Trocar por leitura de sessão real (@supabase/ssr) quando a tela de login existir.
 */
export async function requireAdvisorId(): Promise<string> {
  const id = process.env.DEV_ADVISOR_ID;
  if (!id) {
    throw new Error(
      "DEV_ADVISOR_ID não definido em .env.local — defina um UUID temporário até a auth real estar pronta.",
    );
  }
  return id;
}
