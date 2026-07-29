import apiClient from "./client";

/** Fields the campaign form sends; the server owns id/created_by/timestamps. */
export type CampaignPayload = Record<string, unknown>;

export type CampaignSummary = {
  total_campaigns: number;
  total_budget: string | number;
  total_spent: string | number;
  total_leads: number;
  cost_per_lead: string | number;
};

// Fetches the advertising campaign list with optional query parameters.
export async function getCampaigns(params = "") {
  return apiClient(`/advertising/campaigns/${params}`);
}

// Totals across every campaign, computed by the database rather than summed
// from a single 20-record page in the browser.
export async function getCampaignSummary() {
  return apiClient<CampaignSummary>("/advertising/campaigns/summary/");
}

// Fetches a single advertising campaign by identifier.
export async function getCampaign(id: number) {
  return apiClient(`/advertising/campaigns/${id}/`);
}

// Creates a new advertising campaign.
export async function createCampaign(data: CampaignPayload) {
  return apiClient("/advertising/campaigns/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Updates an existing advertising campaign by identifier.
export async function updateCampaign(id: number, data: CampaignPayload) {
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
