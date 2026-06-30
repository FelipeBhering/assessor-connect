// Tipos manuais espelhando sql/001_init.sql.
// Substituir por `supabase gen types typescript` quando houver um access token do CLI configurado.
//
// Não usamos o generic `Database` do supabase-js aqui: reproduzir fielmente o contrato
// `GenericSchema` (Tables/Views/Functions/Relationships) é frágil entre versões da lib.
// Em vez disso, o client é criado sem generics e cada query tipa o resultado com `as`.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type RiskProfile = "Conservador" | "Moderado" | "Arrojado";
export type ClientOrigin = "Indicação" | "Evento" | "Redes Sociais" | "Site" | "Parceria";
export type ClientStatus = "active" | "inactive";
export type InteractionType = "call" | "meeting" | "whatsapp" | "email";
export type InteractionSource = "manual" | "ai_transcription" | "whatsapp_sync";
export type TaskStatus = "open" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskOrigin = "manual" | "ai_generated";
export type ProductCategory = "Renda Fixa" | "Renda Variável" | "FIIs" | "Internacional";
export type AlertType =
  | "forgotten_client"
  | "financial_anniversary"
  | "product_maturity"
  | "suitability_expiring";
export type AlertStatus = "open" | "dismissed";

export interface ClientMemoryFact {
  label: string;
  value: string;
  source: "ai" | "advisor";
  updatedAt: string;
}

export interface AdvisorRow {
  id: string;
  name: string;
  email: string;
  brokerage: string | null;
  plan: string;
  created_at: string;
}

export interface ClientRow {
  id: string;
  advisor_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  risk_profile: RiskProfile;
  origin: ClientOrigin | null;
  status: ClientStatus;
  aum: number;
  tags: string[];
  notes: string | null;
  next_action: string | null;
  first_contribution_date: string | null;
  last_contact_at: string | null;
  suitability_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientMemoryRow {
  client_id: string;
  facts: ClientMemoryFact[];
  preferences: Record<string, Json>;
  last_updated_by: "ai" | "advisor";
  updated_at: string;
}

export interface InteractionRow {
  id: string;
  client_id: string;
  advisor_id: string;
  type: InteractionType;
  source: InteractionSource;
  occurred_at: string;
  raw_transcript: string | null;
  audio_url: string | null;
  summary: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface TaskRow {
  id: string;
  client_id: string;
  advisor_id: string;
  interaction_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  origin: TaskOrigin;
  created_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  category: ProductCategory;
  issuer: string | null;
  risk_level: RiskProfile | null;
  yield_label: string | null;
  min_investment: number | null;
}

export interface PortfolioPositionRow {
  id: string;
  client_id: string;
  product_id: string;
  value: number;
  maturity: string | null;
  contracted_yield: string | null;
  created_at: string;
}

export interface PortfolioPositionWithProductRow extends PortfolioPositionRow {
  product: Pick<ProductRow, "name" | "category"> | null;
}

export interface AlertRow {
  id: string;
  client_id: string;
  advisor_id: string;
  type: AlertType;
  status: AlertStatus;
  trigger_date: string;
  config: Record<string, Json>;
  created_at: string;
}

export interface ClientWithMemoryRow extends ClientRow {
  memory: ClientMemoryRow | null;
}
