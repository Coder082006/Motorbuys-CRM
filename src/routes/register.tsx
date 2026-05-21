import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike, Loader2 } from "lucide-react";
import { register } from "../lib/api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Register - Motorbike CRM" }] }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== password2) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        first_name: "",
        last_name: "",
        role: "sales",
        phone: null,
        password,
        password2,
      });
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1200);
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorMessage("Cannot connect to server. Make sure the backend is running.");
      } else if (
        error instanceof Error &&
        (error.message.includes("409") || error.message.includes("400"))
      ) {
        setErrorMessage("Username already exists");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed");
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
          <p className="text-sm text-brand-navy-foreground/60 mt-1">Create your dealer account</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-2xl border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" required value={password2} onChange={(e) => setPassword2(e.target.value)} />
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
            {errorMessage ? <p className="text-center text-sm text-destructive">{errorMessage}</p> : null}
            {successMessage ? <p className="text-center text-sm text-emerald-600">{successMessage}</p> : null}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-orange font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
