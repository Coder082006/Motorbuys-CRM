import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Users,
  Bike,
  Kanban,
  CreditCard,
  Megaphone,
  Mail,
  Wrench,
  BarChart3,
  UserCog,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "../lib/auth";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["admin", "sales", "financing", "advertising", "marketing", "service"],
  },
  { title: "Customers", url: "/customers", icon: Users, roles: ["admin", "sales"] },
  { title: "Inventory", url: "/inventory", icon: Bike, roles: ["admin", "sales", "marketing"] },
  { title: "Sales Pipeline", url: "/sales", icon: Kanban, roles: ["admin", "sales"] },
  { title: "Financing", url: "/financing", icon: CreditCard, roles: ["admin", "financing"] },
  { title: "Advertising", url: "/advertising", icon: Megaphone, roles: ["admin", "advertising"] },
  { title: "Marketing", url: "/marketing", icon: Mail, roles: ["admin", "marketing"] },
  { title: "Service", url: "/service", icon: Wrench, roles: ["admin", "service"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["admin"] },
  { title: "User Management", url: "/users", icon: UserCog, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { role } = useCurrentUser();
  const visibleItems = items.filter((item) => role != null && item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-orange text-brand-navy">
            <Bike className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-sidebar-foreground">MOTORBIKE</div>
              <div className="text-xs font-semibold tracking-widest text-brand-orange">CRM</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate({ to: "/login" })}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
