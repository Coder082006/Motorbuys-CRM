import apiClient from "./client";

// Fetches the inventory list with optional query parameters.
export async function getBikes(params = "") {
  return apiClient(`/inventory/${params}`);
}

// Fetches a single bike record by identifier.
export async function getBike(id: number) {
  return apiClient(`/inventory/${id}/`);
}

// Fetches available bike models.
export async function getBikeModels() {
  return apiClient("/inventory/models/");
}

// Creates a new bike inventory record.
export async function createBike(data: any) {
  return apiClient("/inventory/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates a bike inventory record by identifier.
export async function updateBike(id: number, data: any) {
  return apiClient(`/inventory/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a bike inventory record by identifier.
export async function deleteBike(id: number) {
  return apiClient(`/inventory/${id}/`, {
    method: "DELETE",
  });
}
