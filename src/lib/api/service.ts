import apiClient from "./client";

// Fetches service records with optional query parameters.
export async function getServiceRecords(params = "") {
  return apiClient(`/service/records/${params}`);
}

// Fetches a single service record by identifier.
export async function getServiceRecord(id: number) {
  return apiClient(`/service/records/${id}/`);
}

// Creates a new service record.
export async function createServiceRecord(data: any) {
  return apiClient("/service/records/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing service record by identifier.
export async function updateServiceRecord(id: number, data: any) {
  return apiClient(`/service/records/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Fetches spare parts with optional query parameters.
export async function getSpareParts(params = "") {
  return apiClient(`/service/spare-parts/${params}`);
}

// Creates a new spare part record.
export async function createSparePart(data: any) {
  return apiClient("/service/spare-parts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing spare part by identifier.
export async function updateSparePart(id: number, data: any) {
  return apiClient(`/service/spare-parts/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a spare part by identifier.
export async function deleteSparePart(id: number) {
  return apiClient(`/service/spare-parts/${id}/`, {
    method: "DELETE",
  });
}
