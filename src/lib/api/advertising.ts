import apiClient from "./client";

// Fetches the advertising campaign list with optional query parameters.
export async function getCampaigns(params = "") {
  return apiClient(`/advertising/campaigns/${params}`);
}

// Fetches a single advertising campaign by identifier.
export async function getCampaign(id: number) {
  return apiClient(`/advertising/campaigns/${id}/`);
}

// Creates a new advertising campaign.
export async function createCampaign(data: any) {
  return apiClient("/advertising/campaigns/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing advertising campaign by identifier.
export async function updateCampaign(id: number, data: any) {
  return apiClient(`/advertising/campaigns/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Deletes an advertising campaign by identifier.
export async function deleteCampaign(id: number) {
  return apiClient(`/advertising/campaigns/${id}/`, {
    method: "DELETE",
  });
}
