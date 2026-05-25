import { useEffect, useState } from "react";

export type UserRole =
  | "admin"
  | "sales"
  | "financing"
  | "advertising"
  | "marketing"
  | "service"
  | "customer";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  name?: string;
  is_staff?: boolean;
  phone: string | null;
  profile_picture: string | null;
  is_active: boolean;
  created_at: string;
}

type CurrentUserState = {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  isSales: boolean;
  isFinancing: boolean;
  isAdvertising: boolean;
  isMarketing: boolean;
  isService: boolean;
  isCustomer: boolean;
  isLoggedIn: boolean;
};

function readStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.sessionStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function useCurrentUser(): CurrentUserState {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  useEffect(() => {
    const syncUser = () => {
      setUser(readStoredUser());
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const role = user?.role ?? null;

  return {
    user,
    role,
    isAdmin: role === "admin",
    isSales: role === "sales",
    isFinancing: role === "financing",
    isAdvertising: role === "advertising",
    isMarketing: role === "marketing",
    isService: role === "service",
    isCustomer: role === "customer" || user?.is_staff === false,
    isLoggedIn: Boolean(user),
  };
}
