import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteUser,
  getProfile,
  getUser,
  getUsers,
  updateProfile,
  updateUser,
} from "../../lib/api/users";
import { QUERY_KEYS } from "./queryKeys";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: getUsers,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id?: number) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.USER(id) : [...QUERY_KEYS.USERS, "missing-id"],
    queryFn: () => getUser(id as number),
    enabled: typeof window !== "undefined" && !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      console.log("User updated successfully"); // replace with toast
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      console.log("User deleted"); // replace with toast
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: getProfile,
    enabled: typeof window !== "undefined",
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
      console.log("Profile updated successfully"); // replace with toast
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      console.log("Password changed successfully"); // replace with toast
    },
    onError: (error) => {
      console.log(getErrorMessage(error)); // replace with toast
    },
  });
}
