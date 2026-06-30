import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, deleteClient, getClientById, listClients, updateClient } from "./functions/client";
import { createInteraction, createTask, completeTask } from "./functions/interaction";
import { upsertClientMemory } from "./functions/memory";
import { getDailyFeed } from "./functions/daily-feed";
import { getOpenAlerts, dismissAlert, runAlertChecks } from "./functions/alerts";
import type { CreateClientInput, UpdateClientInput } from "./domain/client.schema";
import type { CreateInteractionInput, CreateTaskInput } from "./domain/interaction.schema";

export const crmKeys = {
  clients: ["crm", "clients"] as const,
  client: (id: string) => ["crm", "clients", id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: crmKeys.clients,
    queryFn: () => listClients(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: crmKeys.client(id),
    queryFn: () => getClientById({ data: { id } }),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.clients });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.clients });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient({ data: input }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.clients });
      queryClient.invalidateQueries({ queryKey: crmKeys.client(updated.id) });
    },
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInteractionInput) => createInteraction({ data: input }),
    onSuccess: (interaction) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.clients });
      queryClient.invalidateQueries({ queryKey: crmKeys.client(interaction.client_id) });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask({ data: input }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.client(task.client_id) });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeTask({ data: { id } }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.client(task.client_id) });
    },
  });
}

export function useUpsertClientMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertClientMemory,
    onSuccess: (memory) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.client(memory.client_id) });
    },
  });
}

export function useDailyFeed() {
  return useQuery({
    queryKey: ["crm", "daily-feed"],
    queryFn: () => getDailyFeed(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["crm", "alerts"],
    queryFn: () => getOpenAlerts(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "alerts"] });
    },
  });
}

export function useRunAlertChecks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runAlertChecks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "alerts"] });
    },
  });
}
