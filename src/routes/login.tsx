import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../lib/api/auth";
import { PublicOnlyRoute, useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login - Motorbuy" }] }),
});

function getNextPath() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      const user = {
        id: response.user.id,
        name: response.user.name || response.user.username || response.user.email,
        email: response.user.email,
        phone: response.user.phone || "",
        is_staff: response.user.is_staff ?? response.user.role !== "customer",
        role: response.user.role,
      };
      auth.login(response.access, user, response.refresh);
      const next = getNextPath();
      if (user.is_staff) {
        navigate({ to: "/admin-dashboard" });
      } else if (next) {
        window.location.href = next;
      } else {
        navigate({ to: "/" });
      }
    } catch {
      setErrorMessage("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="flex min-h-screen items-center justify-center bg-brand-navy p-4">
        <div className="relative w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-orange text-brand-navy">
              <Bike className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy-foreground">
              MOTORBUY
            </h1>
            <p className="mt-1 text-sm text-brand-navy-foreground/60">Sign in to continue</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or username</Label>
                <Input
                  id="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-brand-orange font-semibold text-brand-navy hover:bg-brand-orange/90"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
              {errorMessage && (
                <p className="text-center text-sm text-destructive">{errorMessage}</p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  search={{ next: getNextPath() ?? undefined }}
                  className="font-medium text-brand-orange hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
