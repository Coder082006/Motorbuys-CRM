import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
  updateCampaign,
} from "../../lib/api/advertising";
import { QUERY_KEYS } from "./queryKeys";

export function useCampaigns(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGNS, params],
    queryFn: () => getCampaigns(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaign(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.CAMPAIGN(id) : [...QUERY_KEYS.CAMPAIGNS, "missing-id"],
    queryFn: () => getCampaign(id as number),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS });
      console.log("Campaign created successfully"); // replace with toast
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCampaign(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS });
      console.log("Campaign updated successfully"); // replace with toast
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS });
      console.log("Campaign deleted"); // replace with toast
    },
  });
}
