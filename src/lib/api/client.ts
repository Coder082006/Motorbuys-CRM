export const BASE_URL = "http://127.0.0.1:8000/api";

type ApiClientOptions = RequestInit;

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("refresh_token");
      window.localStorage.removeItem("user");
    }

    redirectToLogin();
    throw new Error("Request failed with status 401");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return parseResponse(response);
}

export default apiClient;
