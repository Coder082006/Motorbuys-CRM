import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLead,
  createSale,
  deleteLead,
  getLead,
  getLeads,
  getSales,
  updateLead,
} from "../../lib/api/sales";
import { QUERY_KEYS } from "./queryKeys";

export function useLeads(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.LEADS, params],
    queryFn: () => getLeads(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLead(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.LEAD(id) : [...QUERY_KEYS.LEADS, "missing-id"],
    queryFn: () => getLead(id as number),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      console.log("Lead created successfully"); // replace with toast
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLead(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      console.log("Lead updated successfully"); // replace with toast
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
    },
  });
}

export function useSales(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.SALES, params],
    queryFn: () => getSales(params),
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSale,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIKES });
      console.log("Sale recorded successfully"); // replace with toast
    },
  });
}
