import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../lib/api/reports";
import { QUERY_KEYS } from "./queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: getDashboard,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
