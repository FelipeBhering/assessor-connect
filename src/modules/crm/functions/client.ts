import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { requireAdvisorId } from "@/lib/server/auth";
import { createClientSchema, updateClientSchema } from "../domain/client.schema";
import type {
  ClientRow,
  ClientWithMemoryRow,
  InteractionRow,
  PortfolioPositionWithProductRow,
  TaskRow,
} from "@/lib/supabase/types";

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const advisorId = await requireAdvisorId();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("last_contact_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ClientRow[];
});

export const getClientById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();

    const { data: client, error } = await supabase
      .from("clients")
      .select("*, memory:client_memories(*)")
      .eq("id", data.id)
      .eq("advisor_id", advisorId)
      .single();

    if (error || !client) throw new Error("Cliente não encontrado");

    const [{ data: interactions, error: interactionsError }, { data: tasks, error: tasksError }, { data: portfolio, error: portfolioError }] =
      await Promise.all([
        supabase
          .from("interactions")
          .select("*")
          .eq("client_id", data.id)
          .order("occurred_at", { ascending: false }),
        supabase
          .from("tasks")
          .select("*")
          .eq("client_id", data.id)
          .order("due_date", { ascending: false, nullsFirst: false }),
        supabase
          .from("portfolio_positions")
          .select("*, product:products(name, category)")
          .eq("client_id", data.id),
      ]);

    if (interactionsError) throw new Error(interactionsError.message);
    if (tasksError) throw new Error(tasksError.message);
    if (portfolioError) throw new Error(portfolioError.message);

    const typedClient = client as unknown as ClientWithMemoryRow;

    return {
      ...typedClient,
      interactions: (interactions ?? []) as InteractionRow[],
      tasks: (tasks ?? []) as TaskRow[],
      portfolio: (portfolio ?? []) as unknown as PortfolioPositionWithProductRow[],
    };
  });

export const createClient = createServerFn({ method: "POST" })
  .validator(createClientSchema)
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        advisor_id: advisorId,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        city: data.city,
        risk_profile: data.riskProfile,
        origin: data.origin,
        aum: data.aum,
        tags: data.tags,
        notes: data.notes,
        next_action: data.nextAction,
        first_contribution_date: data.firstContributionDate,
        suitability_expires_at: data.suitabilityExpiresAt,
      })
      .select()
      .single();

    if (error || !client) throw new Error(error?.message ?? "Falha ao criar cliente");

    const typedClient = client as unknown as ClientRow;

    const { error: memoryError } = await supabase
      .from("client_memories")
      .insert({ client_id: typedClient.id });

    if (memoryError) throw new Error(memoryError.message);

    return typedClient;
  });

export const deleteClient = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", data.id)
      .eq("advisor_id", advisorId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateClient = createServerFn({ method: "POST" })
  .validator(updateClientSchema)
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();
    const { id, ...fields } = data;

    const { data: updated, error } = await supabase
      .from("clients")
      .update({
        name: fields.name,
        email: fields.email || undefined,
        phone: fields.phone,
        city: fields.city,
        risk_profile: fields.riskProfile,
        origin: fields.origin,
        aum: fields.aum,
        tags: fields.tags,
        notes: fields.notes,
        next_action: fields.nextAction,
        first_contribution_date: fields.firstContributionDate,
        suitability_expires_at: fields.suitabilityExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("advisor_id", advisorId)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message ?? "Cliente não encontrado");
    return updated as unknown as ClientRow;
  });
