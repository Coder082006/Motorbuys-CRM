import apiClient from "./client";

// Fetches the loan list with optional query parameters.
export async function getLoans(params = "") {
  return apiClient(`/financing/loans/${params}`);
}

// Fetches a single loan by identifier.
export async function getLoan(id: number) {
  return apiClient(`/financing/loans/${id}/`);
}

// Creates a new loan record.
export async function createLoan(data: any) {
  return apiClient("/financing/loans/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing loan by identifier.
export async function updateLoan(id: number, data: any) {
  return apiClient(`/financing/loans/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Fetches the payment list with optional query parameters.
export async function getPayments(params = "") {
  return apiClient(`/financing/payments/${params}`);
}

// Creates a new payment record.
export async function createPayment(data: any) {
  return apiClient("/financing/payments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Initiates an M-Pesa STK push request.
export async function initiateMpesa(data: any) {
  return apiClient("/financing/mpesa/stk-push/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
