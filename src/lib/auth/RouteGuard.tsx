import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, type UserRole } from "./useCurrentUser";

type RouteGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAdmin } = useCurrentUser();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  if (!isAdmin && (role == null || !allowedRoles.includes(role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to view this page. Contact your administrator.
          </p>
          <Button className="mt-6" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
