import apiClient from "./client";

type InventoryPayload = any;

function body(data: InventoryPayload) {
  return data instanceof FormData ? data : JSON.stringify(data);
}

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

export async function createBikeModel(data: Record<string, unknown>) {
  return apiClient("/inventory/models/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Creates a new bike inventory record.
export async function createBike(data: InventoryPayload) {
  return apiClient("/inventory/", {
    method: "POST",
    body: body(data),
  });
}

// Updates a bike inventory record by identifier.
export async function updateBike(id: number, data: InventoryPayload) {
  return apiClient(`/inventory/${id}/`, {
    method: "PUT",
    body: body(data),
  });
}

// Deletes a bike inventory record by identifier.
export async function deleteBike(id: number) {
  return apiClient(`/inventory/${id}/`, {
    method: "DELETE",
  });
}
