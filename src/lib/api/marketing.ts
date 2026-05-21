import apiClient from "./client";

// Fetches SMS campaigns with optional query parameters.
export async function getSMSCampaigns(params = "") {
  return apiClient(`/marketing/sms/${params}`);
}

// Creates a new SMS campaign.
export async function createSMSCampaign(data: any) {
  return apiClient("/marketing/sms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing SMS campaign by identifier.
export async function updateSMSCampaign(id: number, data: any) {
  return apiClient(`/marketing/sms/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Sends an SMS campaign by identifier.
export async function sendSMSCampaign(id: number) {
  return apiClient(`/marketing/sms/${id}/send/`, {
    method: "POST",
  });
}

// Fetches promotions with optional query parameters.
export async function getPromotions(params = "") {
  return apiClient(`/marketing/promotions/${params}`);
}

// Creates a new promotion.
export async function createPromotion(data: any) {
  return apiClient("/marketing/promotions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing promotion by identifier.
export async function updatePromotion(id: number, data: any) {
  return apiClient(`/marketing/promotions/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes a promotion by identifier.
export async function deletePromotion(id: number) {
  return apiClient(`/marketing/promotions/${id}/`, {
    method: "DELETE",
  });
}
