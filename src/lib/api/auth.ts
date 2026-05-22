import apiClient, { ApiError, BASE_URL, clearAuthStorage } from "./client";

type LoginResponse = {
  access: string;
  refresh: string;
  user: UserShape;
};

type UserShape = {
  role?: string | null;
  [key: string]: unknown;
};

async function parsePublicAuthResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function login(username: string, password: string) {
  const response = (await parsePublicAuthResponse(
    await fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }),
  )) as LoginResponse;

  if (!response.access || !response.refresh) {
    throw new Error("Login response is missing authentication tokens");
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem("access_token", response.access);
    window.localStorage.setItem("refresh_token", response.refresh);
    window.localStorage.setItem("user", JSON.stringify(response.user));
  }

  return response;
}

export async function logout() {
  const refresh = typeof window !== "undefined" ? window.localStorage.getItem("refresh_token") : null;

  try {
    if (refresh) {
      await apiClient("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
        skipAuthRefresh: true,
      });
    }
  } finally {
    clearAuthStorage();
    redirectToLogin();
  }
}

export async function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as UserShape;
  } catch {
    return null;
  }
}

export async function isLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem("access_token"));
}

export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

export async function register(data: {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  password: string;
  password2: string;
}) {
  return parsePublicAuthResponse(
    await fetch(`${BASE_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),
  );
}
