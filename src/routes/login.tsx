import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike, Loader2 } from "lucide-react";
import { isLoggedIn, login } from "../lib/api/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login - Motorbike CRM" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkLoggedIn = async () => {
      const loggedIn = await isLoggedIn();
      if (mounted && loggedIn) {
        navigate({ to: "/" });
      }
    };

    void checkLoggedIn();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate({ to: "/" });
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorMessage("Cannot connect to server. Make sure the backend is running.");
      } else {
        setErrorMessage("Invalid username or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.7_0.19_50/0.15),_transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-orange text-brand-navy mb-3">
            <Bike className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy-foreground">
            MOTORBIKE <span className="text-brand-orange">CRM</span>
          </h1>
          <p className="text-sm text-brand-navy-foreground/60 mt-1">Sign in to your dealer dashboard</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-2xl border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input
                id="u"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input
                id="p"
                type="password"
                placeholder="........"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-brand-navy font-semibold rounded-full h-11"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submit</span>
                </span>
              ) : (
                "Submit"
              )}
            </Button>
            {errorMessage ? (
              <p className="text-center text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-orange font-medium hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
