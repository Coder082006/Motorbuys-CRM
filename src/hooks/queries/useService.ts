import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceRecord,
  createSparePart,
  deleteSparePart,
  getServiceRecord,
  getServiceRecords,
  getSpareParts,
  updateServiceRecord,
} from "../../lib/api/service";
import { QUERY_KEYS } from "./queryKeys";

export function useServiceRecords(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.SERVICE_RECORDS, params],
    queryFn: () => getServiceRecords(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useServiceRecord(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.SERVICE_RECORD(id) : [...QUERY_KEYS.SERVICE_RECORDS, "missing-id"],
    queryFn: () => getServiceRecord(id as number),
    enabled: !!id,
  });
}

export function useCreateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICE_RECORDS });
      console.log("Service request created"); // replace with toast
    },
  });
}

export function useUpdateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateServiceRecord(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICE_RECORDS });
      console.log("Service record updated"); // replace with toast
    },
  });
}

export function useSpareParts(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.SPARE_PARTS, params],
    queryFn: () => getSpareParts(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSparePart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SPARE_PARTS });
      console.log("Spare part added"); // replace with toast
    },
  });
}

export function useDeleteSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSparePart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SPARE_PARTS });
    },
  });
}
