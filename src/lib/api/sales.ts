import apiClient from "./client";

// Fetches the lead list with optional query parameters.
export async function getLeads(params = "") {
  return apiClient(`/sales/leads/${params}`);
}

// Fetches a single sales lead by identifier.
export async function getLead(id: number) {
  return apiClient(`/sales/leads/${id}/`);
}

// Creates a new sales lead.
export async function createLead(data: any) {
  return apiClient("/sales/leads/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing sales lead by identifier.
export async function updateLead(id: number, data: any) {
  return apiClient(`/sales/leads/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a sales lead by identifier.
export async function deleteLead(id: number) {
  return apiClient(`/sales/leads/${id}/`, {
    method: "DELETE",
  });
}

// Fetches the sales list with optional query parameters.
export async function getSales(params = "") {
  return apiClient(`/sales/${params}`);
}

// Creates a new completed sale record.
export async function createSale(data: any) {
  return apiClient("/sales/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
