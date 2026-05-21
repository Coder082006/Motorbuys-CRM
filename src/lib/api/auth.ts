import apiClient from "./client";

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: unknown;
  [key: string]: unknown;
};

type UserShape = {
  role?: string | null;
  [key: string]: unknown;
};

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Authenticates the user and stores tokens plus user data in localStorage.
export async function login(username: string, password: string) {
  const response = (await apiClient("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })) as LoginResponse;

  if (typeof window !== "undefined") {
    window.localStorage.setItem("access_token", response.access_token);
    window.localStorage.setItem("refresh_token", response.refresh_token);
    window.localStorage.setItem("user", JSON.stringify(response.user));
  }

  return response;
}

// Logs the user out on the backend, clears local storage, and redirects to login.
export async function logout() {
  const refreshToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("refresh_token")
      : null;

  try {
    await apiClient("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } finally {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }

    redirectToLogin();
  }
}

// Returns the current user object from localStorage, or null when unavailable.
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

// Returns true when an access token exists in localStorage.
export async function isLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem("access_token"));
}

// Returns the current user's role, or null if there is no stored user.
export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

// Registers a new user account with the backend.
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
  return apiClient("/auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
