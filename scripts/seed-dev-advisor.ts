// Cria um usuário de auth + advisor de desenvolvimento, e imprime o DEV_ADVISOR_ID
// para colar no .env.local. Uso temporário até existir tela de login real.
//
// Rodar: npx tsx scripts/seed-dev-advisor.ts
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const DEV_EMAIL = "dev-advisor@assessor-connect.local";
const DEV_PASSWORD = crypto.randomUUID();

async function main() {
  const supabase = createClient(url!, serviceRoleKey!, { auth: { persistSession: false } });

  const { data: existing } = await supabase
    .from("advisors")
    .select("id")
    .eq("email", DEV_EMAIL)
    .maybeSingle();

  if (existing) {
    console.log(`Advisor de dev já existe. DEV_ADVISOR_ID=${existing.id}`);
    return;
  }

  const { data: userResult, error: userError } = await supabase.auth.admin.createUser({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
    email_confirm: true,
  });

  if (userError || !userResult.user) {
    console.error("Falha ao criar usuário de auth:", userError?.message);
    process.exit(1);
  }

  const { error: advisorError } = await supabase.from("advisors").insert({
    id: userResult.user.id,
    name: "Assessor Dev",
    email: DEV_EMAIL,
  });

  if (advisorError) {
    console.error("Falha ao criar advisor:", advisorError.message);
    process.exit(1);
  }

  console.log("Advisor de dev criado com sucesso.");
  console.log(`Adicione ao .env.local:\nDEV_ADVISOR_ID=${userResult.user.id}`);
}

main();
