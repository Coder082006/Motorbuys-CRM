import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_staff: boolean;
  role?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser, refresh?: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readToken(): string | null {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem("access_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [token, setToken] = useState<string | null>(() => readToken());

  const value = useMemo<AuthContextType>(() => {
    const login = (nextToken: string, nextUser: AuthUser, refresh?: string) => {
      window.sessionStorage.setItem("access_token", nextToken);
      window.sessionStorage.setItem("user", JSON.stringify(nextUser));
      if (refresh) {
        window.sessionStorage.setItem("refresh_token", refresh);
      }
      setToken(nextToken);
      setUser(nextUser);
    };

    const logout = () => {
      window.sessionStorage.removeItem("access_token");
      window.sessionStorage.removeItem("refresh_token");
      window.sessionStorage.removeItem("user");
      window.sessionStorage.removeItem("customer");
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    };

    return {
      user,
      token,
      login,
      logout,
      isAdmin: user?.is_staff === true,
      isCustomer: Boolean(user) && user?.is_staff === false,
      isAuthenticated: Boolean(token && user),
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: isAdmin ? "/admin-dashboard" : "/" });
    }
  }, [isAdmin, isAuthenticated, navigate]);

  return isAuthenticated ? null : <>{children}</>;
}

export function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      const next = `${location.pathname}${location.searchStr}`;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }

    if (isAdmin) {
      void navigate({ to: "/admin-dashboard" });
    }
  }, [isAdmin, isAuthenticated, location.pathname, location.searchStr, navigate]);

  return !isAuthenticated || isAdmin ? null : <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }

    if (!isAdmin) {
      void navigate({ to: "/" });
    }
  }, [isAdmin, isAuthenticated, navigate]);

  return !isAuthenticated || !isAdmin ? null : <>{children}</>;
}
