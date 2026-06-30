import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { upsertClientMemorySchema } from "../domain/client.schema";
import type { ClientMemoryRow } from "@/lib/supabase/types";

export const upsertClientMemory = createServerFn({ method: "POST" })
  .validator(upsertClientMemorySchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("client_memories")
      .select("facts, preferences")
      .eq("client_id", data.clientId)
      .single();

    const existingMemory = existing as Pick<ClientMemoryRow, "facts" | "preferences"> | null;

    const { data: memory, error } = await supabase
      .from("client_memories")
      .upsert(
        {
          client_id: data.clientId,
          facts: data.facts ?? existingMemory?.facts ?? [],
          preferences: data.preferences ?? existingMemory?.preferences ?? {},
          last_updated_by: "advisor",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" },
      )
      .select()
      .single();

    if (error || !memory) throw new Error(error?.message ?? "Falha ao salvar memória");
    return memory as unknown as ClientMemoryRow;
  });
