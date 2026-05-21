import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Bike,
  BriefcaseBusiness,
  CreditCard,
  LogOut,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard, useCurrentUser } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useDashboard,
  useLeads,
  usePayments,
  useSales,
  useSalesReport,
  useServiceRecords,
} from "../hooks/queries";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Motorbike CRM Dashboard" },
      {
        name: "description",
        content:
          "Internal dashboard for motorbike dealership staff covering sales, inventory, financing, service, and campaigns.",
      },
    ],
  }),
});

const roleBadgeClasses: Record<string, string> = {
  admin: "border-purple-400/30 bg-purple-500/15 text-purple-200",
  sales: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  financing: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  advertising: "border-orange-400/30 bg-orange-500/15 text-orange-200",
  marketing: "border-pink-400/30 bg-pink-500/15 text-pink-200",
  service: "border-slate-400/30 bg-slate-500/15 text-slate-200",
};

function formatTsh(value: unknown) {
  const numeric = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numeric)) {
    return `TSh ${String(value ?? 0)}`;
  }

  return `TSh ${numeric.toLocaleString()}`;
}

function formatActivityTime(dateLike?: string | null) {
  if (!dateLike) {
    return "Today";
  }

  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60 * 60 * 1000) {
    return `${Math.max(1, Math.floor(diffMs / (60 * 1000)))} mins ago`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)))} hours ago`;
  }

  return "Today";
}

function parseAmount(value: unknown) {
  const numeric = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function pickLatestTimestamp(row: any) {
  return (
    row?.created_at ||
    row?.updated_at ||
    row?.sale_date ||
    row?.payment_date ||
    row?.received_date ||
    row?.completed_date ||
    row?.follow_up_date ||
    null
  );
}

function HomePage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const dashboardQ = useDashboard();
  const salesReportQ = useSalesReport();
  const followUpsQ = useLeads("?follow_up_date=today");
  const salesQ = useSales();
  const paymentsQ = usePayments();
  const serviceQ = useServiceRecords();

  const isLoading =
    dashboardQ.isLoading ||
    salesReportQ.isLoading ||
    followUpsQ.isLoading ||
    salesQ.isLoading ||
    paymentsQ.isLoading ||
    serviceQ.isLoading;

  const dashboardData = dashboardQ.data;
  const salesReport = salesReportQ.data;

  const chartData = (salesReport?.monthly_sales || []).map((item: any) => ({
    month: item.month,
    sales: parseAmount(item.total_revenue),
  }));

  const stats = dashboardData
    ? [
        { label: "Total Bikes in Stock", value: dashboardData.total_bikes_in_stock, icon: Bike },
        { label: "Total Customers", value: dashboardData.total_customers, icon: Users },
        {
          label: "Sales This Month",
          value: dashboardData.total_sales_this_month,
          icon: TrendingUp,
        },
        {
          label: "Revenue This Month",
          value: formatTsh(dashboardData.revenue_this_month),
          icon: CreditCard,
        },
        { label: "Active Loans", value: dashboardData.active_loans, icon: ShieldCheck },
        { label: "Pending Services", value: dashboardData.pending_services, icon: Wrench },
        { label: "Active Campaigns", value: dashboardData.active_campaigns, icon: Megaphone },
        { label: "Total Leads", value: dashboardData.total_leads, icon: BriefcaseBusiness },
      ]
    : [];

  const salesRows = (salesQ.data || [])
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.sale_date || 0).getTime() - new Date(a.sale_date || 0).getTime(),
    )
    .slice(0, 5);

  const followUpRows = (followUpsQ.data || []).slice(0, 5);

  const activityItems = [
    ...(salesQ.data || []).slice(0, 2).map((sale: any) => ({
      label: `Sale recorded for ${sale.customer_name || "customer"}`,
      detail: `${sale.motorbike_name || sale.motorbike || "motorbike"}`,
      time: formatActivityTime(pickLatestTimestamp(sale)),
      icon: ShieldCheck,
      timestamp: pickLatestTimestamp(sale),
    })),
    ...(followUpsQ.data || []).slice(0, 1).map((lead: any) => ({
      label: `New lead added`,
      detail: lead.customer_name || "Customer",
      time: formatActivityTime(pickLatestTimestamp(lead)),
      icon: UserRound,
      timestamp: pickLatestTimestamp(lead),
    })),
    ...(paymentsQ.data || []).slice(0, 1).map((payment: any) => ({
      label: "Payment received",
      detail: formatTsh(payment.amount),
      time: formatActivityTime(pickLatestTimestamp(payment)),
      icon: CreditCard,
      timestamp: pickLatestTimestamp(payment),
    })),
    ...(serviceQ.data || []).slice(0, 1).map((record: any) => ({
      label: "Service request opened",
      detail: record.customer_name || "Customer",
      time: formatActivityTime(pickLatestTimestamp(record)),
      icon: Wrench,
      timestamp: pickLatestTimestamp(record),
    })),
  ]
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime(),
    )
    .slice(0, 5);

  if (dashboardQ.isError) {
    return (
      <RouteGuard
        allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
      >
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-[#0f172a] font-[Inter,sans-serif] text-slate-100">
            <AppSidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <main className="flex flex-1 items-center justify-center px-4 py-8">
                <Card className="w-full max-w-xl border-white/10 bg-[#1e293b] text-slate-100 shadow-xl shadow-black/20">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                      <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                      Failed to load dashboard data
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                      The live API request did not return dashboard metrics.
                    </p>
                    <Button
                      onClick={() => dashboardQ.refetch()}
                      className="mt-6 h-11 rounded-xl bg-[#f97316] px-5 text-sm font-semibold text-white hover:bg-[#ea6a0a]"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard
      allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#0f172a] font-[Inter,sans-serif] text-slate-100">
          <AppSidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur">
              <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f97316] text-[#0f172a] shadow-lg shadow-orange-500/20">
                      <Bike className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold tracking-[0.12em] text-[#f97316]">
                        MOTORBIKE CRM
                      </div>
                      <div className="text-xs text-slate-400">Staff operations dashboard</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 text-left lg:items-center lg:text-center">
                  <div className="text-xl font-semibold text-white">
                    Welcome back, {user ? `${user.first_name} ${user.last_name}` : "Team member"}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${roleBadgeClasses[user?.role || "service"]}`}
                  >
                    {user?.role || "service"}
                  </span>
                </div>

                <div className="flex items-center gap-3 self-start lg:self-auto">
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#1e293b] text-slate-200 shadow-sm transition hover:bg-[#273449]"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <Button
                    onClick={() => navigate({ to: "/login" })}
                    className="h-11 rounded-xl bg-[#f97316] px-5 text-sm font-semibold text-white hover:bg-[#ea6a0a]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 px-4 py-6 sm:px-6">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                {isLoading ? (
                  <>
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse rounded-2xl border border-white/10 bg-[#1e293b] p-4 shadow-sm shadow-black/20"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="h-4 w-28 rounded bg-white/10" />
                            <div className="h-10 w-10 rounded-xl bg-white/10" />
                          </div>
                          <div className="h-8 w-24 rounded bg-white/10" />
                        </div>
                      ))}
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                      <div className="rounded-3xl border border-white/10 bg-[#1e293b] p-5 shadow-sm shadow-black/20">
                        <div className="h-6 w-40 rounded bg-white/10" />
                        <div className="mt-5 h-80 rounded-2xl bg-white/5" />
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-[#1e293b] p-5 shadow-sm shadow-black/20">
                        <div className="h-6 w-44 rounded bg-white/10" />
                        <div className="mt-5 space-y-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-2xl border border-white/8 bg-[#0f172a]/60 px-4 py-3"
                            >
                              <div className="h-9 w-9 rounded-full bg-white/10" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-40 rounded bg-white/10" />
                                <div className="h-3 w-24 rounded bg-white/10" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                        <div className="border-b border-white/10 px-5 py-4">
                          <div className="h-5 w-52 rounded bg-white/10" />
                          <div className="mt-2 h-4 w-64 rounded bg-white/10" />
                        </div>
                        <div className="space-y-3 p-5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-11 rounded-2xl bg-white/5" />
                          ))}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                        <div className="border-b border-white/10 px-5 py-4">
                          <div className="h-5 w-40 rounded bg-white/10" />
                          <div className="mt-2 h-4 w-72 rounded bg-white/10" />
                        </div>
                        <div className="space-y-3 p-5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-11 rounded-2xl bg-white/5" />
                          ))}
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {stats.map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-[#1e293b] p-4 shadow-sm shadow-black/20"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-400">{label}</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-[#f97316]">
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="text-2xl font-semibold text-white">
                            {typeof value === "number" ? value.toLocaleString() : value}
                          </div>
                        </div>
                      ))}
                    </section>

                    <div className="px-1 text-xs text-slate-400">
                      Last updated:{" "}
                      {formatActivityTime(new Date(dashboardQ.dataUpdatedAt).toISOString())}
                    </div>

                    <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,42,0.98))] p-6 shadow-xl shadow-black/20">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <h1 className="text-2xl font-semibold text-white">Quick Access</h1>
                          <p className="mt-1 text-sm text-slate-400">
                            Jump into the modules your team uses every day.
                          </p>
                        </div>
                        <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 md:inline-flex">
                          Internal staff workspace
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[
                          {
                            title: "Customers",
                            description: "Manage customer profiles and leads",
                            icon: Users,
                            to: "/customers",
                          },
                          {
                            title: "Inventory",
                            description: "View and manage motorbike stock",
                            icon: Bike,
                            to: "/inventory",
                          },
                          {
                            title: "Sales Pipeline",
                            description: "Track deals from inquiry to sale",
                            icon: TrendingUp,
                            to: "/sales",
                          },
                          {
                            title: "Financing",
                            description: "Manage loans and installment payments",
                            icon: CreditCard,
                            to: "/financing",
                          },
                          {
                            title: "Marketing & Advertising",
                            description: "Campaigns, SMS and promotions",
                            icon: Megaphone,
                            to: "/marketing",
                          },
                          {
                            title: "Service Center",
                            description: "Manage bike maintenance requests",
                            icon: Wrench,
                            to: "/service",
                          },
                        ].map(({ title, description, icon: Icon, to }) => (
                          <Link
                            key={title}
                            to={to}
                            className="group rounded-2xl border border-white/10 bg-[#1e293b] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/40 hover:bg-[#243246]"
                          >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-[#f97316]">
                              <Icon className="h-7 w-7" />
                            </div>
                            <div className="text-lg font-semibold text-white">{title}</div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                          </Link>
                        ))}
                      </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                      <div className="rounded-3xl border border-white/10 bg-[#1e293b] p-5 shadow-sm shadow-black/20">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-[#f97316]">
                            <BarChart3 className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-white">Monthly Sales</h2>
                            <p className="text-sm text-slate-400">
                              Real revenue figures from the API
                            </p>
                          </div>
                        </div>

                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                              <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickFormatter={(value) => formatTsh(value)}
                              />
                              <Tooltip
                                cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: "16px",
                                  color: "#f8fafc",
                                }}
                                formatter={(value: number) => [formatTsh(value), "Revenue"]}
                              />
                              <Bar
                                dataKey="sales"
                                fill="#f97316"
                                radius={[10, 10, 0, 0]}
                                maxBarSize={46}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-[#1e293b] p-5 shadow-sm shadow-black/20">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-[#f97316]">
                            <BriefcaseBusiness className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            <p className="text-sm text-slate-400">
                              Latest actions across the dealership
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {activityItems.length ? (
                            activityItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <div
                                  key={`${item.label}-${item.detail}-${item.time}`}
                                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-[#0f172a]/60 px-4 py-3"
                                >
                                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/15 text-[#f97316]">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="text-sm leading-6 text-slate-200">
                                    <div>
                                      {item.label}
                                      {item.detail ? ` — ${item.detail}` : ""}
                                    </div>
                                    <div className="text-xs text-slate-400">{item.time}</div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                              No recent activity found.
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                        <div className="border-b border-white/10 px-5 py-4">
                          <h2 className="text-lg font-semibold text-white">
                            Today&apos;s Follow-ups
                          </h2>
                          <p className="mt-1 text-sm text-slate-400">
                            Priority contacts that need action today
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                              <tr>
                                <th className="px-5 py-3 font-medium">Customer Name</th>
                                <th className="px-5 py-3 font-medium">Phone</th>
                                <th className="px-5 py-3 font-medium">Stage</th>
                                <th className="px-5 py-3 font-medium">Assigned To</th>
                              </tr>
                            </thead>
                            <tbody>
                              {followUpRows.length ? (
                                followUpRows.map((row: any, index: number) => (
                                  <tr
                                    key={
                                      row.id ??
                                      `${row.customer_name}-${row.customer_phone}-${index}`
                                    }
                                    className={index % 2 === 0 ? "bg-[#1e293b]" : "bg-[#233047]"}
                                  >
                                    <td className="px-5 py-4 font-medium text-white">
                                      {row.customer_name}
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">
                                      {row.customer_phone}
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-300">
                                        {row.stage}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">
                                      {row.assigned_to_name || row.assigned_to || "Unassigned"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td className="px-5 py-6 text-slate-400" colSpan={4}>
                                    No follow-ups scheduled for today
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                        <div className="border-b border-white/10 px-5 py-4">
                          <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
                          <p className="mt-1 text-sm text-slate-400">
                            Latest completed dealership transactions
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                              <tr>
                                <th className="px-5 py-3 font-medium">Customer</th>
                                <th className="px-5 py-3 font-medium">Bike</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Salesperson</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {salesRows.length ? (
                                salesRows.map((row: any, index: number) => (
                                  <tr
                                    key={row.id ?? `${row.customer_name}-${index}`}
                                    className={index % 2 === 0 ? "bg-[#1e293b]" : "bg-[#233047]"}
                                  >
                                    <td className="px-5 py-4 font-medium text-white">
                                      {row.customer_name}
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">
                                      {row.motorbike_name || row.motorbike}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-orange-300">
                                      {formatTsh(row.sale_price)}
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">
                                      {row.salesperson_name}
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">{row.sale_date}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td className="px-5 py-6 text-slate-400" colSpan={5}>
                                    No sales recorded yet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RouteGuard>
  );
}
