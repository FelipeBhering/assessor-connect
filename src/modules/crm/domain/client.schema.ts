import { z } from "zod";

export const riskProfileSchema = z.enum(["Conservador", "Moderado", "Arrojado"]);

export const clientOriginSchema = z.enum([
  "Indicação",
  "Evento",
  "Redes Sociais",
  "Site",
  "Parceria",
]);

export const createClientSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  riskProfile: riskProfileSchema.default("Moderado"),
  origin: clientOriginSchema.optional(),
  aum: z.number().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  firstContributionDate: z.string().datetime().optional(),
  suitabilityExpiresAt: z.string().datetime().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const clientMemoryFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  source: z.enum(["ai", "advisor"]).default("advisor"),
  updatedAt: z.string().datetime(),
});

export type ClientMemoryFact = z.infer<typeof clientMemoryFactSchema>;

export const upsertClientMemorySchema = z.object({
  clientId: z.string().uuid(),
  facts: z.array(clientMemoryFactSchema).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export type UpsertClientMemoryInput = z.infer<typeof upsertClientMemorySchema>;
