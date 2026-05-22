import apiClient from "./client";

type CustomerPayload = Record<string, unknown> | FormData;

function body(data: CustomerPayload) {
  return data instanceof FormData ? data : JSON.stringify(data);
}

// Fetches the customer collection with optional query parameters.
export async function getCustomers(params = "") {
  return apiClient(`/customers/${params}`);
}

// Fetches a single customer by numeric identifier.
export async function getCustomer(id: number) {
  return apiClient(`/customers/${id}/`);
}

// Creates a new customer record.
export async function createCustomer(data: CustomerPayload) {
  return apiClient("/customers/", {
    method: "POST",
    body: body(data),
  });
}

// Updates an existing customer by identifier.
export async function updateCustomer(id: number, data: CustomerPayload) {
  return apiClient(`/customers/${id}/`, {
    method: "PUT",
    body: body(data),
  });
}

// Deletes a customer by identifier.
export async function deleteCustomer(id: number) {
  return apiClient(`/customers/${id}/`, {
    method: "DELETE",
  });
}
