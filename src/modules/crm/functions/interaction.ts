import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { requireAdvisorId } from "@/lib/server/auth";
import { createInteractionSchema, createTaskSchema } from "../domain/interaction.schema";
import type { InteractionRow, TaskRow } from "@/lib/supabase/types";

export const createInteraction = createServerFn({ method: "POST" })
  .validator(createInteractionSchema)
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();
    const occurredAt = data.occurredAt ?? new Date().toISOString();

    const { data: interaction, error } = await supabase
      .from("interactions")
      .insert({
        client_id: data.clientId,
        advisor_id: advisorId,
        type: data.type,
        occurred_at: occurredAt,
        summary: data.summary,
        ai_summary: data.aiSummary,
        source: "manual",
      })
      .select()
      .single();

    if (error || !interaction) throw new Error(error?.message ?? "Falha ao registrar interação");

    // Toda interação atualiza o "último contato" do cliente — usado pelo feed e pelos alertas de inatividade
    const { error: clientError } = await supabase
      .from("clients")
      .update({ last_contact_at: occurredAt, updated_at: new Date().toISOString() })
      .eq("id", data.clientId);

    if (clientError) throw new Error(clientError.message);

    return interaction as unknown as InteractionRow;
  });

export const createTask = createServerFn({ method: "POST" })
  .validator(createTaskSchema)
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const supabase = getSupabaseAdmin();

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        client_id: data.clientId,
        advisor_id: advisorId,
        interaction_id: data.interactionId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        priority: data.priority,
        origin: data.origin,
      })
      .select()
      .single();

    if (error || !task) throw new Error(error?.message ?? "Falha ao criar tarefa");
    return task as unknown as TaskRow;
  });

export const completeTask = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { data: task, error } = await supabase
      .from("tasks")
      .update({ status: "done" })
      .eq("id", data.id)
      .select()
      .single();

    if (error || !task) throw new Error(error?.message ?? "Tarefa não encontrada");
    return task as unknown as TaskRow;
  });
