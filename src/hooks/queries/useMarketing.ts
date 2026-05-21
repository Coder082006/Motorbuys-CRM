import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPromotion,
  createSMSCampaign,
  deletePromotion,
  getPromotions,
  getSMSCampaigns,
  sendSMSCampaign,
} from "../../lib/api/marketing";
import { QUERY_KEYS } from "./queryKeys";

export function useSMSCampaigns(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.SMS_CAMPAIGNS, params],
    queryFn: () => getSMSCampaigns(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSMSCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSMSCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SMS_CAMPAIGNS });
      console.log("SMS Campaign created"); // replace with toast
    },
  });
}

export function useSendSMSCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendSMSCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SMS_CAMPAIGNS });
      console.log("SMS Campaign sent successfully to all recipients"); // replace with toast
    },
    onError: () => {
      console.log("Failed to send SMS campaign"); // replace with toast
    },
  });
}

export function usePromotions(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROMOTIONS, params],
    queryFn: () => getPromotions(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromotion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
      console.log("Promotion created successfully"); // replace with toast
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
      console.log("Promotion deleted"); // replace with toast
    },
  });
}
