import { useQuery } from "@tanstack/react-query";
import {
  getAdvertisingReport,
  getFinancingReport,
  getInventoryReport,
  getMarketingReport,
  getSalesReport,
} from "../../lib/api/reports";
import { QUERY_KEYS } from "./queryKeys";

export function useSalesReport() {
  return useQuery({
    queryKey: QUERY_KEYS.SALES_REPORT,
    queryFn: getSalesReport,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY_REPORT,
    queryFn: getInventoryReport,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancingReport() {
  return useQuery({
    queryKey: QUERY_KEYS.FINANCING_REPORT,
    queryFn: getFinancingReport,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdvertisingReport() {
  return useQuery({
    queryKey: QUERY_KEYS.ADVERTISING_REPORT,
    queryFn: getAdvertisingReport,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketingReport() {
  return useQuery({
    queryKey: QUERY_KEYS.MARKETING_REPORT,
    queryFn: getMarketingReport,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}
