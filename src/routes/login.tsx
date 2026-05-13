import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login — Motorbike CRM" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.7_0.19_50/0.15),_transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-orange text-brand-navy mb-3">
            <Bike className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy-foreground">MOTORBIKE <span className="text-brand-orange">CRM</span></h1>
          <p className="text-sm text-brand-navy-foreground/60 mt-1">Sign in to your dealer dashboard</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-2xl border">
          <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input id="u" placeholder="admin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90 text-brand-navy font-semibold rounded-full h-11">
              Submit
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-brand-orange font-medium hover:underline">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
