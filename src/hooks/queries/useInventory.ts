import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBike,
  deleteBike,
  getBike,
  getBikeModels,
  getBikes,
  updateBike,
} from "../../lib/api/inventory";
import { QUERY_KEYS } from "./queryKeys";

export function useBikes(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.BIKES, params],
    queryFn: () => getBikes(params),
    staleTime: 3 * 60 * 1000,
  });
}

export function useBike(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.BIKE(id) : [...QUERY_KEYS.BIKES, "missing-id"],
    queryFn: () => getBike(id as number),
    enabled: !!id,
  });
}

export function useBikeModels() {
  return useQuery({
    queryKey: QUERY_KEYS.BIKE_MODELS,
    queryFn: getBikeModels,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBike,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIKES });
      console.log("Bike added to inventory"); // replace with toast
    },
  });
}

export function useUpdateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateBike(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIKES });
      console.log("Bike updated successfully"); // replace with toast
    },
  });
}

export function useDeleteBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBike,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIKES });
      console.log("Bike removed from inventory"); // replace with toast
    },
  });
}
