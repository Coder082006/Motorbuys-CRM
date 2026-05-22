export const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api").replace(
  /\/+$/,
  "",
);

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type DrfErrorPayload =
  | {
      detail?: string;
      non_field_errors?: string[] | string;
      [field: string]: unknown;
    }
  | string
  | null;

export class ApiError extends Error {
  status: number;
  payload: DrfErrorPayload;
  fieldErrors: Record<string, string>;

  constructor(status: number, payload: DrfErrorPayload) {
    super(formatDrfError(payload, status));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.fieldErrors = extractFieldErrors(payload);
  }
}

type ApiClientOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

type TokenResponse = {
  access?: string;
  refresh?: string;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

function getStoredToken(key: string): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(key);
}

function setStoredToken(key: string, value: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
}

export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function endpointUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractFieldErrors(payload: DrfErrorPayload): Record<string, string> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return Object.entries(payload).reduce<Record<string, string>>((acc, [field, value]) => {
    if (field === "detail") {
      return acc;
    }

    if (Array.isArray(value)) {
      acc[field] = value.map(String).join(" ");
    } else if (typeof value === "string") {
      acc[field] = value;
    } else if (value && typeof value === "object") {
      acc[field] = Object.values(value as Record<string, unknown>).flat().map(String).join(" ");
    }

    return acc;
  }, {});
}

function formatDrfError(payload: DrfErrorPayload, status: number): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    const fieldErrors = extractFieldErrors(payload);
    const firstFieldError = Object.values(fieldErrors)[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return `Request failed with status ${status}`;
}

function isAuthFailure(status: number, payload?: unknown): boolean {
  if (status === 401) {
    return true;
  }

  if (status !== 403 || !payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const detail = (payload as { detail?: unknown }).detail;
  return (
    typeof detail === "string" &&
    /authentication credentials|credentials were not provided|token/i.test(detail)
  );
}

function buildHeaders(options: ApiClientOptions, accessToken: string | null): Headers {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getStoredToken(REFRESH_TOKEN_KEY);
  if (!refresh) {
    return null;
  }

  const response = await fetch(endpointUrl("/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = (await parseResponse(response)) as TokenResponse;
  if (!response.ok || !data?.access) {
    clearAuthStorage();
    return null;
  }

  setStoredToken(ACCESS_TOKEN_KEY, data.access);
  if (data.refresh) {
    setStoredToken(REFRESH_TOKEN_KEY, data.refresh);
  }

  return data.access;
}

export function getResults<T>(payload: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.results ?? [];
}

async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const accessToken = getStoredToken(ACCESS_TOKEN_KEY);
  const { skipAuthRefresh, ...fetchOptions } = options;

  const response = await fetch(endpointUrl(endpoint), {
    ...fetchOptions,
    headers: buildHeaders(options, accessToken),
  });

  const data = await parseResponse(response);

  if (isAuthFailure(response.status, data) && !skipAuthRefresh && typeof window !== "undefined") {
    const nextAccessToken = await refreshAccessToken();

    if (nextAccessToken) {
      const retryResponse = await fetch(endpointUrl(endpoint), {
        ...fetchOptions,
        headers: buildHeaders(options, nextAccessToken),
      });

      if (retryResponse.ok) {
        return (await parseResponse(retryResponse)) as T;
      }

      throw new ApiError(
        retryResponse.status,
        (await parseResponse(retryResponse)) as DrfErrorPayload,
      );
    }

    clearAuthStorage();
    redirectToLogin();
  }

  if (!response.ok) {
    if (isAuthFailure(response.status, data)) {
      clearAuthStorage();
      redirectToLogin();
    }

    throw new ApiError(response.status, data as DrfErrorPayload);
  }

  return data as T;
}

export default apiClient;
