import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, LogOut } from "lucide-react";
import { logout } from "../lib/api/auth";
import { useCurrentUser } from "../lib/auth";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user, role } = useCurrentUser();
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Guest";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers, bikes, orders..." className="pl-9 h-9" />
            </div>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-sm font-medium">Welcome back, {displayName}</span>
              <span className="mt-1 inline-flex w-fit truncate rounded-full border px-2 py-0.5 text-xs uppercase text-muted-foreground">
                {role ?? "staff"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 animate-fade-in">{children ?? <Outlet />}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
