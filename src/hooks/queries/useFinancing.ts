import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLoan,
  createPayment,
  getLoan,
  getLoans,
  getPayments,
  initiateMpesa,
  updateLoan,
} from "../../lib/api/financing";
import { QUERY_KEYS } from "./queryKeys";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export function useLoans(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.LOANS, params],
    queryFn: () => getLoans(params),
    staleTime: 3 * 60 * 1000,
  });
}

export function useLoan(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.LOAN(id) : [...QUERY_KEYS.LOANS, "missing-id"],
    queryFn: () => getLoan(id as number),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLoan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      console.log("Loan application created"); // replace with toast
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLoan(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      console.log("Loan updated successfully"); // replace with toast
    },
  });
}

export function usePayments(params = "") {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, params],
    queryFn: () => getPayments(params),
    staleTime: 60 * 1000,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      console.log("Payment recorded successfully"); // replace with toast
    },
  });
}

export function useInitiateMpesa() {
  return useMutation({
    mutationFn: initiateMpesa,
    onSuccess: () => {
      console.log("M-Pesa payment initiated. Customer will receive prompt on their phone"); // replace with toast
    },
    onError: () => {
      console.log("M-Pesa payment failed. Try again."); // replace with toast
    },
  });
}
