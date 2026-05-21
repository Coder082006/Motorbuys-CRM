import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "../../lib/api/customers";
import { QUERY_KEYS } from "./queryKeys";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export function useCustomers(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => getCustomers(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomer(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.CUSTOMER(id) : [...QUERY_KEYS.CUSTOMERS, "missing-id"],
    queryFn: () => getCustomer(id as number),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      console.log("Customer created successfully"); // replace with toast
    },
    onError: (error) => {
      console.log(getErrorMessage(error)); // replace with toast
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCustomer(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER(variables.id) });
      console.log("Customer updated successfully"); // replace with toast
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      console.log("Customer deleted"); // replace with toast
    },
    onError: (error) => {
      console.log(getErrorMessage(error)); // replace with toast
    },
  });
}
