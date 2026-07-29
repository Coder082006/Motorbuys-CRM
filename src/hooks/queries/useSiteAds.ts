import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSiteAd,
  deleteSiteAd,
  getPublicSiteAds,
  getSiteAds,
  getSiteAdSummary,
  updateSiteAd,
  type PublicSiteAd,
  type SiteAdSummary,
  type SiteAdPlacement,
} from "../../lib/api/siteAds";
import { QUERY_KEYS } from "./queryKeys";

/**
 * Storefront: live banners for one slot.
 *
 * `viewerId` is part of the cache key because the served adverts depend on who
 * is signed in - signing in or out must refetch rather than reuse the previous
 * viewer's targeted adverts.
 */
export function usePublicSiteAds(
  placement: SiteAdPlacement = "bottom_right",
  viewerId?: number | null,
) {
  return useQuery<PublicSiteAd[]>({
    queryKey: QUERY_KEYS.PUBLIC_SITE_ADS(placement, viewerId ?? "anonymous"),
    queryFn: () => getPublicSiteAds(placement),
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** CRM: full banner list. */
export function useSiteAds(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.SITE_ADS, params],
    queryFn: () => getSiteAds(params),
    enabled: typeof window !== "undefined",
    staleTime: 60 * 1000,
  });
}

/** Whole-table totals for the stat tiles - not just the current page. */
export function useSiteAdSummary() {
  return useQuery<SiteAdSummary>({
    queryKey: QUERY_KEYS.SITE_AD_SUMMARY,
    queryFn: getSiteAdSummary,
    enabled: typeof window !== "undefined",
    staleTime: 60 * 1000,
  });
}

export function useCreateSiteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSiteAd,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_ADS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_AD_SUMMARY });
    },
  });
}

export function useUpdateSiteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateSiteAd(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_ADS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_AD_SUMMARY });
    },
  });
}

export function useDeleteSiteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSiteAd,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_ADS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SITE_AD_SUMMARY });
    },
  });
}
