import apiClient from "./client";

// Fetches all system users.
export async function getUsers() {
  return apiClient("/users/");
}

// Fetches a single user by identifier.
export async function getUser(id: number) {
  return apiClient(`/users/${id}/`);
}

// Updates a user by identifier.
export async function updateUser(id: number, data: any) {
  return apiClient(`/users/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a user by identifier.
export async function deleteUser(id: number) {
  return apiClient(`/users/${id}/`, {
    method: "DELETE",
  });
}

// Fetches the authenticated user's profile.
export async function getProfile() {
  return apiClient("/auth/profile/");
}

// Updates the authenticated user's profile.
export async function updateProfile(data: any) {
  return apiClient("/auth/profile/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Changes the authenticated user's password.
export async function changePassword(data: any) {
  return apiClient("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
