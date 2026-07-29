import apiClient, { BASE_URL } from "./client";

export type SiteAdPlacement = "bottom_right";

/** Trimmed shape served publicly to the storefront. */
export type PublicSiteAd = {
  id: number;
  title: string;
  image: string | null;
  headline: string;
  headline_sw: string;
  body: string;
  body_sw: string;
  cta_text: string;
  cta_text_sw: string;
  placement: SiteAdPlacement;
  target_url: string;
  dismissible: boolean;
};

export type SiteAdAudience = "everyone" | "logged_in" | "specific";

/** Full record used by the CRM advertising screen. */
export type SiteAd = PublicSiteAd & {
  campaign: number | null;
  campaign_title?: string | null;
  audience: SiteAdAudience;
  recipients: number[];
  recipient_count: number;
  status: "draft" | "active" | "paused";
  priority: number;
  start_date: string;
  end_date: string;
  link_bike: number | null;
  link_url: string;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  is_live: boolean;
  schedule_state: "draft" | "paused" | "scheduled" | "live" | "expired";
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
};

/** Turns a media path from Django into an absolute URL the browser can load. */
export function resolveAdImage(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const origin = BASE_URL.replace(/\/api$/, "");
  return `${origin}${image.startsWith("/") ? image : `/${image}`}`;
}

// ---------------------------------------------------------------------------
// Public storefront
// ---------------------------------------------------------------------------

/**
 * Live ads for one slot.
 *
 * Works signed out, but sends the token when there is one so the server can
 * include adverts aimed at all signed-in customers or at this customer
 * specifically. A stale token is ignored server-side rather than rejected.
 */
export async function getPublicSiteAds(placement: SiteAdPlacement = "bottom_right") {
  const token =
    typeof window === "undefined" ? null : window.sessionStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}/shop/ads/?placement=${placement}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as PublicSiteAd[];
}

/** Fire-and-forget: a failed metric must never break the page. */
export function recordAdImpression(id: number): void {
  void fetch(`${BASE_URL}/shop/ads/${id}/impression/`, { method: "POST" }).catch(() => {});
}

export function recordAdClick(id: number): void {
  void fetch(`${BASE_URL}/shop/ads/${id}/click/`, { method: "POST" }).catch(() => {});
}

// ---------------------------------------------------------------------------
// CRM management
// ---------------------------------------------------------------------------

export type SiteAdSummary = {
  total_ads: number;
  live_now: number;
  total_impressions: number;
  total_clicks: number;
  click_through_rate: number;
};

export async function getSiteAds(params = "") {
  return apiClient(`/advertising/site-ads/${params}`);
}

// Totals across every advert, computed by the database rather than summed
// from a single 20-record page in the browser.
export async function getSiteAdSummary() {
  return apiClient<SiteAdSummary>("/advertising/site-ads/summary/");
}

/** Image upload means these go up as multipart, not JSON. */
export async function createSiteAd(data: FormData) {
  return apiClient<SiteAd>("/advertising/site-ads/", {
    method: "POST",
    body: data,
  });
}

export async function updateSiteAd(id: number, data: FormData) {
  return apiClient<SiteAd>(`/advertising/site-ads/${id}/`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteSiteAd(id: number) {
  return apiClient<void>(`/advertising/site-ads/${id}/`, {
    method: "DELETE",
  });
}
