import { type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bike, CreditCard, DollarSign, TrendingUp, Users, Wrench } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatters";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useCustomers,
  useDashboard,
  useInventoryReport,
  useSales,
  useSalesReport,
} from "../hooks/queries";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RouteGuard
      allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
    >
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Dashboard - Motorbike CRM" }] }),
});

const COLORS = [
  "oklch(0.7 0.19 50)",
  "oklch(0.55 0.15 260)",
  "oklch(0.65 0.18 180)",
  "oklch(0.7 0.15 320)",
  "oklch(0.6 0.05 260)",
];

interface DashboardSummary {
  total_bikes_in_stock: number | string;
  total_customers: number | string;
  total_sales_this_month: number | string;
  revenue_this_month: number | string;
  active_loans: number | string;
  pending_services: number | string;
  active_campaigns: number | string;
  total_leads: number | string;
}

interface MonthlySalesItem {
  month: string;
  total_revenue: number | string;
}

interface TopModelItem {
  brand: string;
  model_name: string;
  total_sold: number;
}

interface SaleRow {
  id: number | string;
  customer_name?: string;
  customer?: string;
  motorbike_name?: string;
  motorbike?: string;
  amount?: number | string;
  sale_price?: number | string;
  sale_date?: string;
  created_at?: string;
}

interface CustomerRow {
  id: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  region?: string;
  city?: string;
  status?: string;
}

function toNum(value: string | number | undefined): number {
  return value === undefined ? 0 : typeof value === "number" ? value : parseFloat(value) || 0;
}

function pickTimestamp(row: SaleRow | CustomerRow | { sale_date?: string; created_at?: string }) {
  return row.sale_date || row.created_at || null;
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

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
          </div>
          <div className="h-11 w-11 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}

function LoadingStatGrid() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-5 space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Dashboard() {
  useAuthRedirect();

  const dashboardQ = useDashboard();
  const salesReportQ = useSalesReport();
  const inventoryReportQ = useInventoryReport();
  const customersQ = useCustomers();
  const salesQ = useSales();

  const isLoading =
    dashboardQ.isLoading ||
    salesReportQ.isLoading ||
    inventoryReportQ.isLoading ||
    customersQ.isLoading ||
    salesQ.isLoading;
  const isError =
    dashboardQ.isError ||
    salesReportQ.isError ||
    inventoryReportQ.isError ||
    customersQ.isError ||
    salesQ.isError;

  const dashboardData = dashboardQ.data as DashboardSummary | undefined;
  const monthlySales = (salesReportQ.data?.monthly_sales || []).map((item: MonthlySalesItem) => ({
    month: item.month,
    revenue: toNum(item.total_revenue),
  }));

  const topModels = (inventoryReportQ.data?.top_selling_models || []).map((item: TopModelItem) => ({
    name: `${item.brand} ${item.model_name}`.trim(),
    value: item.total_sold,
  }));

  const salesRows = ((salesQ.data || []) as SaleRow[])
    .slice()
    .sort(
      (a, b) =>
        new Date((b.sale_date || b.created_at || 0) as string).getTime() -
        new Date((a.sale_date || a.created_at || 0) as string).getTime(),
    )
    .slice(0, 5);

  const customerRows = ((customersQ.data || []) as CustomerRow[]).slice(0, 5);

  const activityItems = [
    ...salesRows.slice(0, 2).map((sale) => ({
      label: `Sale recorded for ${sale.customer_name || sale.customer || "customer"}`,
      detail: sale.motorbike_name || sale.motorbike || "motorbike",
      time: formatActivityTime(pickTimestamp(sale)),
      timestamp: pickTimestamp(sale),
    })),
    ...customerRows.slice(0, 1).map((customer) => ({
      label: "Customer synced",
      detail:
        customer.name ||
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
        "Customer",
      time: formatActivityTime(pickTimestamp(customer)),
      timestamp: pickTimestamp(customer),
    })),
    ...salesRows.slice(2, 3).map((sale) => ({
      label: "Payment captured",
      detail: formatCurrency(sale.amount ?? sale.sale_price ?? 0),
      time: formatActivityTime(pickTimestamp(sale)),
      timestamp: pickTimestamp(sale),
    })),
  ]
    .filter((item) => item.timestamp)
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <RouteGuard
        allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
      >
        <DashboardLayout>
          <div className="space-y-6 p-6">
            <LoadingStatGrid />
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2 animate-pulse">
                <CardContent className="h-72" />
              </Card>
              <Card className="animate-pulse">
                <CardContent className="h-72" />
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="animate-pulse">
                <CardContent className="h-64" />
              </Card>
              <Card className="animate-pulse">
                <CardContent className="h-64" />
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (isError) {
    return (
      <RouteGuard
        allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
      >
        <DashboardLayout>
          <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-4 font-semibold">
                  Failed to load dashboard data.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    void dashboardQ.refetch();
                    void salesReportQ.refetch();
                    void inventoryReportQ.refetch();
                    void customersQ.refetch();
                    void salesQ.refetch();
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard
      allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}
    >
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back - here's what's happening today.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={Users}
              label="Customers"
              value={dashboardData ? toNum(dashboardData.total_customers) : 0}
              trend="Live"
            />
            <StatCard
              icon={Bike}
              label="Bikes in Stock"
              value={dashboardData ? toNum(dashboardData.total_bikes_in_stock) : 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Sales (Month)"
              value={dashboardData ? toNum(dashboardData.total_sales_this_month) : 0}
              trend="Live"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={
                dashboardData ? formatCurrency(dashboardData.revenue_this_month) : formatCurrency(0)
              }
              trend="Live"
            />
            <StatCard
              icon={CreditCard}
              label="Active Loans"
              value={dashboardData ? toNum(dashboardData.active_loans) : 0}
            />
            <StatCard
              icon={Wrench}
              label="Pending Services"
              value={dashboardData ? toNum(dashboardData.pending_services) : 0}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {monthlySales.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis
                        fontSize={12}
                        tickFormatter={(v) => `${(Number(v) / 1e6).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(value: number | string) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                      />
                      <Bar dataKey="revenue" fill="oklch(0.7 0.19 50)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyCard
                    title="No revenue data"
                    message="The sales report has not returned monthly revenue yet."
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Selling Models</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {topModels.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topModels}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {topModels.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyCard
                    title="No model data"
                    message="The inventory report has not returned top-selling models yet."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {salesRows.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Bike</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRows.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                          <TableCell>{sale.customer_name || sale.customer || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {sale.motorbike_name || sale.motorbike || "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(sale.amount ?? sale.sale_price ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyCard title="No recent sales" message="The sales list is empty." />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {customerRows.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerRows.map((customer) => {
                        const fullName =
                          customer.name ||
                          `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                          "—";
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>{fullName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {customer.region || customer.city || "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge s={customer.status || "Active"} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyCard title="No customers" message="The customers list is empty." />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {activityItems.length ? (
                <div className="space-y-3">
                  {activityItems.map((item) => (
                    <div
                      key={`${item.label}-${item.time}`}
                      className="rounded-2xl border border-border bg-card px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.detail}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  title="No recent activity"
                  message="There are no recent sales or customer updates."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Prospect: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Inactive: "bg-rose-100 text-rose-700 hover:bg-rose-100",
  };

  return <Badge className={map[s] || ""}>{s}</Badge>;
}
