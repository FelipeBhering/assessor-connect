import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getGroq } from "@/lib/server/groq";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { requireAdvisorId } from "@/lib/server/auth";
import type { InteractionRow, TaskRow } from "@/lib/supabase/types";

export interface SummaryResult {
  summary: string;
  tasks: { title: string; dueDate: string | null; priority: "low" | "medium" | "high" }[];
  followUpMessage: string;
}

const SYSTEM_PROMPT = `Você é um assistente especializado em assessoria de investimentos brasileira.
Dada uma transcrição de reunião ou ligação, extraia:
1. Um resumo conciso em 2-4 frases (campo "summary")
2. Uma lista de tarefas/follow-ups identificados (campo "tasks"), cada um com título, data estimada (ISO ou null) e prioridade (low/medium/high)
3. Uma mensagem de WhatsApp curta e profissional para enviar ao cliente após a reunião (campo "followUpMessage")

Responda APENAS com JSON válido no formato:
{
  "summary": "string",
  "tasks": [{"title": "string", "dueDate": "ISO ou null", "priority": "low|medium|high"}],
  "followUpMessage": "string"
}`;

export const summarizeInteraction = createServerFn({ method: "POST" })
  .validator(
    z.object({
      clientId: z.string().uuid(),
      interactionId: z.string().uuid(),
      transcript: z.string().min(10),
      clientName: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const advisorId = await requireAdvisorId();
    const groq = getGroq();
    const supabase = getSupabaseAdmin();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Cliente: ${data.clientName}\n\nTranscrição:\n${data.transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let result: SummaryResult;
    try {
      // Extrair JSON mesmo que o modelo adicione markdown
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      result = {
        summary: raw,
        tasks: [],
        followUpMessage: "",
      };
    }

    // Salvar aiSummary na interação
    await supabase
      .from("interactions")
      .update({ ai_summary: result.summary })
      .eq("id", data.interactionId);

    // Criar tarefas geradas pela IA
    const createdTasks: TaskRow[] = [];
    for (const t of result.tasks) {
      const { data: task, error } = await supabase
        .from("tasks")
        .insert({
          client_id: data.clientId,
          advisor_id: advisorId,
          interaction_id: data.interactionId,
          title: t.title,
          due_date: t.dueDate,
          priority: t.priority,
          origin: "ai_generated",
        })
        .select()
        .single();
      if (task && !error) createdTasks.push(task as unknown as TaskRow);
    }

    return { ...result, createdTasks };
  });

export const generateFollowUp = createServerFn({ method: "POST" })
  .validator(
    z.object({
      clientId: z.string().uuid(),
      clientName: z.string(),
      context: z.string().min(5),
      channel: z.enum(["whatsapp", "email"]).default("whatsapp"),
    }),
  )
  .handler(async ({ data }) => {
    const groq = getGroq();

    const channelNote =
      data.channel === "email"
        ? "Escreva um e-mail profissional com saudação e assinatura."
        : "Escreva uma mensagem de WhatsApp curta, profissional e cordial (máx 3 parágrafos curtos).";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Você é um assessor de investimentos brasileiro. ${channelNote} Responda APENAS com o texto da mensagem, sem explicações adicionais.`,
        },
        {
          role: "user",
          content: `Cliente: ${data.clientName}\nContexto: ${data.context}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const message = completion.choices[0]?.message?.content ?? "";
    return { message };
  });

// Briefing pré-reunião: resume histórico do cliente para o assessor
export const generatePreMeetingBriefing = createServerFn({ method: "GET" })
  .validator(z.object({ clientId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const groq = getGroq();

    const [{ data: client }, { data: interactions }, { data: tasks }] = await Promise.all([
      supabase
        .from("clients")
        .select("name,risk_profile,aum,notes,last_contact_at,suitability_expires_at,next_action")
        .eq("id", data.clientId)
        .single(),
      supabase
        .from("interactions")
        .select("type,occurred_at,summary,ai_summary")
        .eq("client_id", data.clientId)
        .order("occurred_at", { ascending: false })
        .limit(5),
      supabase
        .from("tasks")
        .select("title,due_date,status,priority")
        .eq("client_id", data.clientId)
        .eq("status", "open")
        .order("due_date", { ascending: true })
        .limit(5),
    ]);

    if (!client) throw new Error("Cliente não encontrado");

    const historyText = (interactions ?? [])
      .map((i) => `[${i.type} — ${i.occurred_at.slice(0, 10)}] ${i.ai_summary ?? i.summary ?? "sem resumo"}`)
      .join("\n");

    const tasksText = (tasks ?? [])
      .map((t) => `• ${t.title}${t.due_date ? ` (vence ${t.due_date.slice(0, 10)})` : ""}`)
      .join("\n");

    const prompt = `Cliente: ${client.name}
Perfil: ${client.risk_profile} | AUM: R$ ${Number(client.aum).toLocaleString("pt-BR")}
Último contato: ${client.last_contact_at ? client.last_contact_at.slice(0, 10) : "nunca"}
Notas: ${client.notes ?? "—"}
Próxima ação pendente: ${client.next_action ?? "—"}

Histórico recente:
${historyText || "Sem interações anteriores"}

Tarefas em aberto:
${tasksText || "Nenhuma"}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de assessor de investimentos. Gere um briefing pré-reunião em tópicos curtos: (1) Situação atual do cliente, (2) Pontos de atenção, (3) Sugestões de pauta. Seja objetivo e use linguagem profissional do mercado financeiro brasileiro.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    return { briefing: completion.choices[0]?.message?.content ?? "" };
  });
