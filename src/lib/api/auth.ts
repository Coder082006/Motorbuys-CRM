import apiClient, { ApiError, BASE_URL, clearAuthStorage } from "./client";

export type AuthUser = {
  id: number;
  username?: string;
  name?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  role?: string | null;
  is_staff?: boolean;
};

type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
  customer?: unknown;
};

export type MfaChallenge = {
  mfa_required: true;
  mfa_token: string;
  delivery: "email";
  email: string;
  expires_in_minutes: number;
  detail?: string;
  auth_kind: "staff" | "customer";
};

export type LoginResult = AuthResponse | MfaChallenge;

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password2?: string;
};

async function parsePublicAuthResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

function normalizeUser(user: AuthUser): AuthUser {
  const fullName =
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    user.email;

  return {
    ...user,
    name: fullName,
    is_staff: user.is_staff ?? (user.role != null && user.role !== "customer"),
  };
}

function storeAuth(response: AuthResponse): AuthResponse {
  if (!response.access || !response.refresh) {
    throw new Error("Login response is missing authentication tokens");
  }

  const normalized = { ...response, user: normalizeUser(response.user) };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("access_token", normalized.access);
    window.sessionStorage.setItem("refresh_token", normalized.refresh);
    window.sessionStorage.setItem("user", JSON.stringify(normalized.user));
    if (normalized.customer) {
      window.sessionStorage.setItem("customer", JSON.stringify(normalized.customer));
    }
  }

  return normalized;
}

function isMfaChallenge(data: unknown): data is Omit<MfaChallenge, "auth_kind"> {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { mfa_required?: unknown }).mfa_required === true &&
    typeof (data as { mfa_token?: unknown }).mfa_token === "string"
  );
}

function withAuthKind(data: Omit<MfaChallenge, "auth_kind">, authKind: MfaChallenge["auth_kind"]) {
  return { ...data, auth_kind: authKind };
}

export function isLoginMfaChallenge(data: LoginResult): data is MfaChallenge {
  return "mfa_required" in data && data.mfa_required === true;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const staffResponse = await fetch(`${BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (staffResponse.ok) {
    const data = await parsePublicAuthResponse(staffResponse);
    if (isMfaChallenge(data)) {
      return withAuthKind(data, "staff");
    }
    return storeAuth(data as AuthResponse);
  }

  const shopResponse = await fetch(`${BASE_URL}/shop/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await parsePublicAuthResponse(shopResponse);
  if (isMfaChallenge(data)) {
    return withAuthKind(data, "customer");
  }
  return storeAuth(data as AuthResponse);
}

export async function verifyLoginOtp(challenge: MfaChallenge, code: string) {
  const endpoint = challenge.auth_kind === "staff" ? "/auth/verify-otp/" : "/shop/auth/verify-otp/";
  return storeAuth(
    (await parsePublicAuthResponse(
      await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfa_token: challenge.mfa_token, code }),
      }),
    )) as AuthResponse,
  );
}

export async function register(data: RegisterPayload) {
  const [firstName, ...lastNameParts] = data.name.trim().split(/\s+/).filter(Boolean);

  return storeAuth(
    (await parsePublicAuthResponse(
      await fetch(`${BASE_URL}/shop/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.email,
          email: data.email,
          first_name: firstName || "",
          last_name: lastNameParts.join(" "),
          phone: data.phone,
          password: data.password,
          password2: data.password2 || data.password,
        }),
      }),
    )) as AuthResponse,
  );
}

export async function logout() {
  const refresh =
    typeof window !== "undefined" ? window.sessionStorage.getItem("refresh_token") : null;
  const user = await getCurrentUser();
  const endpoint = user?.role === "customer" ? "/shop/auth/logout/" : "/auth/logout/";

  try {
    if (refresh) {
      await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify({ refresh }),
        skipAuthRefresh: true,
      });
    }
  } finally {
    clearAuthStorage();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("customer");
      window.location.href = "/login";
    }
  }
}

export async function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.sessionStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export async function isLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.sessionStorage.getItem("access_token"));
}

export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role ?? null;
}
