import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "./useCurrentUser";

export function useAuthRedirect() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useCurrentUser();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, navigate]);

  return user;
}
