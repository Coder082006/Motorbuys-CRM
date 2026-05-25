import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicOnlyRoute, useAuth } from "../context/AuthContext";
import { register } from "../lib/api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Register - Motorbuy" }] }),
});

function getNextPath() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message || "Registration failed";
  }
  return "Registration failed";
}

function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== password2) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({ name, email, phone, password, password2 });
      const user = {
        id: response.user.id,
        name: response.user.name || response.user.username || response.user.email,
        email: response.user.email,
        phone: response.user.phone || phone,
        is_staff: false,
        role: response.user.role,
      };
      auth.login(response.access, user, response.refresh);
      const next = getNextPath();
      if (next) {
        window.location.href = next;
      } else {
        navigate({ to: "/" });
      }
    } catch (error) {
      setErrorMessage(formatError(error));
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
            <p className="mt-1 text-sm text-brand-navy-foreground/60">
              Create your customer account
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="password2">Confirm Password</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    value={password2}
                    onChange={(event) => setPassword2(event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-brand-orange font-semibold text-brand-navy hover:bg-brand-orange/90"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account
                  </span>
                ) : (
                  "Register"
                )}
              </Button>
              {errorMessage ? (
                <p className="text-center text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-brand-orange hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
