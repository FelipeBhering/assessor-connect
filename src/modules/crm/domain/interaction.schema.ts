import { z } from "zod";

export const interactionTypeSchema = z.enum(["call", "meeting", "whatsapp", "email"]);

// Labels exibidos na UI (mock-data.ts usava esses literais diretamente) — o banco
// guarda a forma normalizada em inglês, a UI traduz na borda.
export const interactionTypeLabels: Record<z.infer<typeof interactionTypeSchema>, string> = {
  call: "Ligação",
  meeting: "Reunião",
  whatsapp: "WhatsApp",
  email: "Email",
};

export const createInteractionSchema = z.object({
  clientId: z.string().uuid(),
  type: interactionTypeSchema,
  occurredAt: z.string().datetime().optional(),
  summary: z.string().min(1, "Resumo obrigatório"),
  aiSummary: z.string().optional(),
});

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  clientId: z.string().uuid(),
  interactionId: z.string().uuid().optional(),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: taskPrioritySchema.default("medium"),
  origin: z.enum(["manual", "ai_generated"]).default("manual"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
