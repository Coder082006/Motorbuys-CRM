import apiClient from "./client";

// Fetches the customer collection with optional query parameters.
export async function getCustomers(params = "") {
  return apiClient(`/customers/${params}`);
}

// Fetches a single customer by numeric identifier.
export async function getCustomer(id: number) {
  return apiClient(`/customers/${id}/`);
}

// Creates a new customer record.
export async function createCustomer(data: any) {
  return apiClient("/customers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing customer by identifier.
export async function updateCustomer(id: number, data: any) {
  return apiClient(`/customers/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a customer by identifier.
export async function deleteCustomer(id: number) {
  return apiClient(`/customers/${id}/`, {
    method: "DELETE",
  });
}
