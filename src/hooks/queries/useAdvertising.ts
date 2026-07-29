import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
  getCampaignSummary,
  updateCampaign,
  type CampaignPayload,
  type CampaignSummary,
} from "../../lib/api/advertising";
import { QUERY_KEYS } from "./queryKeys";

export function useCampaigns(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAMPAIGNS, params],
    queryFn: () => getCampaigns(params),
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

/** Whole-table totals for the stat tiles - not just the current page. */
export function useCampaignSummary() {
  return useQuery<CampaignSummary>({
    queryKey: QUERY_KEYS.CAMPAIGN_SUMMARY,
    queryFn: getCampaignSummary,
    enabled: typeof window !== "undefined",
    staleTime: 60 * 1000,
  });
}

export function useCampaign(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.CAMPAIGN(id) : [...QUERY_KEYS.CAMPAIGNS, "missing-id"],
    queryFn: () => getCampaign(id as number),
    enabled: typeof window !== "undefined" && !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGN_SUMMARY });
      console.log("Campaign created successfully"); // replace with toast
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CampaignPayload }) => updateCampaign(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGN_SUMMARY });
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
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGN_SUMMARY });
      console.log("Campaign deleted"); // replace with toast
    },
  });
}
