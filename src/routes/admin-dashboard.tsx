import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bike, Loader2, ShoppingCart, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminRoute, useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  getAdminCustomers,
  getAdminOrders,
  type AdminCustomer,
  type ShopOrder,
} from "../lib/api/shop";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard - Motorbuy" }] }),
});

function money(value: string | number) {
  return formatCurrency(value);
}

function customerName(customer: AdminCustomer) {
  return (
    customer.name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() ||
    customer.email ||
    `Customer #${customer.id}`
  );
}

function orderMotorbikeName(order: ShopOrder) {
  const model = order.motorbike_detail?.model_detail;
  return model ? `${model.brand} ${model.model_name}` : `Motorbike #${order.motorbike}`;
}

function AdminDashboardPage() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <AdminDashboardContent />
      </DashboardLayout>
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const auth = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getAdminOrders(), getAdminCustomers()])
      .then(([ordersResponse, customersResponse]) => {
        if (!isMounted) return;
        setOrders(ordersResponse.results);
        setCustomers(customersResponse.results);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Could not load admin dashboard data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [orders],
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending").length,
    [orders],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {auth.user?.name || auth.user?.email || "Admin"}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">Open CRM Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ShoppingCart} label="Total Orders" value={orders.length.toString()} />
        <StatCard icon={Users} label="Total Customers" value={customers.length.toString()} />
        <StatCard icon={Wallet} label="Total Revenue" value={money(totalRevenue)} />
        <StatCard icon={Bike} label="Pending Orders" value={pendingOrders.toString()} />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border bg-card p-6 text-center text-destructive">
          {errorMessage}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <section className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-lg font-bold">All Orders</h2>
              <p className="text-sm text-muted-foreground">
                Purchases placed from the customer shop.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Motorbike</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        No online orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">#{order.id}</td>
                        <td className="px-4 py-3">{order.customer_name || "Customer"}</td>
                        <td className="px-4 py-3">{order.phone}</td>
                        <td className="px-4 py-3">{orderMotorbikeName(order)}</td>
                        <td className="px-4 py-3">{money(order.total_amount)}</td>
                        <td className="px-4 py-3 capitalize">{order.status.replace("_", " ")}</td>
                        <td className="px-4 py-3">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-lg font-bold">Customer Profiles</h2>
              <p className="text-sm text-muted-foreground">Registered CRM customer records.</p>
            </div>
            <div className="divide-y">
              {customers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No customers yet.</div>
              ) : (
                customers.slice(0, 12).map((customer) => (
                  <div key={customer.id} className="p-4">
                    <div className="font-medium">{customerName(customer)}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email || "No email"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phone || "No phone"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
