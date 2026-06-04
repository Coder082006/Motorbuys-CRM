import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  Bike,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import CustomerAvatar from "@/components/CustomerAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useCustomer } from "../hooks/queries";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/customer-profile/$id")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "sales"]}>
      <DashboardLayout>
        <CustomerProfilePage />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Customer Profile - Motorbike CRM" }] }),
});

type CustomerStatus = "prospect" | "active" | "inactive";

type ActivitySummary = {
  orders_count?: number;
  paid_orders_count?: number;
  sales_count?: number;
  leads_count?: number;
  loans_count?: number;
  service_records_count?: number;
  online_payments_count?: number;
  loan_payments_count?: number;
};

type CustomerActivity = {
  id: number;
  [key: string]: unknown;
};

type CustomerProfile = {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email?: string | null;
  phone: string;
  alt_phone?: string | null;
  region?: string | null;
  district?: string | null;
  address?: string | null;
  customer_type?: string;
  status: CustomerStatus;
  budget?: string | null;
  preferred_bike_type?: string | null;
  how_heard?: string | null;
  notes?: string | null;
  profile_picture?: string | null;
  has_photo?: boolean;
  initials: string;
  avatar_color: string;
  onboarding_completed?: boolean | null;
  onboarding_skipped?: boolean | null;
  use_case?: string | null;
  budget_range?: string | null;
  preferred_brands?: string | string[] | null;
  preferred_features?: string[] | null;
  riding_experience?: string | null;
  heard_from?: string | null;
  assigned_to_name?: string | null;
  created_at?: string;
  activity_summary?: ActivitySummary;
  shop_orders?: CustomerActivity[];
  sales_history?: CustomerActivity[];
  leads_history?: CustomerActivity[];
  loans_history?: CustomerActivity[];
  payments_history?: CustomerActivity[];
  service_history?: CustomerActivity[];
};

function statusLabel(status: CustomerStatus) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Prospect";
}

function statusClass(status: CustomerStatus) {
  const map: Record<CustomerStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    inactive: "bg-rose-100 text-rose-700 hover:bg-rose-100",
    prospect: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  };
  return map[status];
}

function text(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function dateText(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function money(value: unknown) {
  return formatCurrency(String(value ?? 0));
}

function CustomerProfilePage() {
  useAuthRedirect();
  const { id } = Route.useParams();
  const customerQ = useCustomer(Number(id));

  if (customerQ.isLoading) {
    return <div className="rounded-lg border bg-card p-8">Loading customer profile...</div>;
  }

  if (customerQ.isError || !customerQ.data) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8">
          <p className="font-semibold">Failed to load this customer profile.</p>
          <Button asChild variant="outline">
            <Link to="/customers">Back to customers</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const customer = customerQ.data as CustomerProfile;
  const summary = customer.activity_summary ?? {};

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2">
        <Link to="/customers">
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
      </Button>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="relative h-20 bg-gradient-to-r from-slate-950 via-slate-800 to-orange-500 sm:h-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(120deg,rgba(15,23,42,0.75),rgba(249,115,22,0.35))]" />
        </div>
        <div className="px-5 pb-7 sm:px-8">
          <div className="-mt-2 rounded-2xl border bg-card p-5 shadow-sm sm:-mt-3 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="rounded-full bg-card p-1.5 shadow-md ring-1 ring-orange-100">
                  <CustomerAvatar
                    profilePicture={customer.profile_picture ?? null}
                    hasPhoto={customer.has_photo}
                    initials={customer.initials}
                    avatarColor={customer.avatar_color}
                    size="xl"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h1 className="break-words text-3xl font-bold leading-tight text-foreground">
                      {customer.full_name}
                    </h1>
                    <Badge className={`w-fit ${statusClass(customer.status)}`}>
                      {statusLabel(customer.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {text(customer.customer_type)} customer joined {dateText(customer.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <ContactPill icon={Phone} value={customer.phone} />
                <ContactPill icon={Mail} value={customer.email} />
                <ContactPill
                  icon={MapPin}
                  value={[customer.region, customer.district].filter(Boolean).join(", ")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Orders" value={summary.orders_count ?? 0} icon={ShoppingBag} />
        <Metric title="Paid Orders" value={summary.paid_orders_count ?? 0} icon={CreditCard} />
        <Metric title="Sales" value={summary.sales_count ?? 0} icon={TrendingUp} />
        <Metric title="Service Jobs" value={summary.service_records_count ?? 0} icon={Wrench} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Info label="Phone" value={customer.phone} />
            <Info label="Alt Phone" value={customer.alt_phone} />
            <Info label="Email" value={customer.email} />
            <Info label="Assigned To" value={customer.assigned_to_name} />
            <Info label="Region" value={customer.region} />
            <Info label="District" value={customer.district} />
            <Info label="Address" value={customer.address} wide />
            <Info label="Budget" value={customer.budget ? money(customer.budget) : "-"} />
            <Info label="Preferred Bike" value={customer.preferred_bike_type} />
            <Info label="How Heard" value={customer.how_heard} wide />
            <Info label="Notes" value={customer.notes} wide />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Online Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList
              items={customer.shop_orders ?? []}
              empty="No online orders for this customer."
              render={(item) => (
                <ActivityRow
                  icon={ShoppingBag}
                  title={`Order #${text(item.customer_order_number)} - ${text(item.motorbike)}`}
                  meta={`${money(item.amount)} · ${text(item.status)} · ${dateText(item.created_at)}`}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Customer Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Main motorbike use" value={customer.use_case} emptyText="Not provided" />
          <Info label="Budget range" value={customer.budget_range} emptyText="Not provided" />
          <Info label="Preferred brands" value={customer.preferred_brands} emptyText="Not provided" />
          <Info
            label="Important features"
            value={customer.preferred_features}
            emptyText="Not provided"
          />
          <Info
            label="Riding experience"
            value={customer.riding_experience}
            emptyText="Not provided"
          />
          <Info label="Heard from" value={customer.heard_from} emptyText="Not provided" />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <HistoryCard
          title="Sales History"
          items={customer.sales_history ?? []}
          empty="No confirmed sales yet."
          render={(item) => (
            <ActivityRow
              icon={Bike}
              title={text(item.motorbike)}
              meta={`${money(item.sale_price)} · ${text(item.payment_method)} · ${dateText(item.sale_date)}`}
            />
          )}
        />
        <HistoryCard
          title="Lead History"
          items={customer.leads_history ?? []}
          empty="No sales leads yet."
          render={(item) => (
            <ActivityRow
              icon={UserRound}
              title={text(item.bike_interested)}
              meta={`${text(item.stage)} · ${dateText(item.created_at)}`}
            />
          )}
        />
        <HistoryCard
          title="Payments"
          items={customer.payments_history ?? []}
          empty="No payments recorded."
          render={(item) => (
            <ActivityRow
              icon={BadgeDollarSign}
              title={`${money(item.amount)} - ${text(item.method)}`}
              meta={`${text(item.status)} · ${text(item.source)} · ${dateText(item.date)}`}
            />
          )}
        />
        <HistoryCard
          title="Financing"
          items={customer.loans_history ?? []}
          empty="No financing records."
          render={(item) => (
            <ActivityRow
              icon={CreditCard}
              title={`${money(item.loan_amount)} loan`}
              meta={`${text(item.status)} · ${text(item.duration_months)} months · ${dateText(item.created_at)}`}
            />
          )}
        />
        <HistoryCard
          title="Service History"
          items={customer.service_history ?? []}
          empty="No service records."
          render={(item) => (
            <ActivityRow
              icon={Wrench}
              title={text(item.motorbike)}
              meta={`${text(item.service_type)} · ${text(item.status)} · ${money(item.total_cost)}`}
            />
          )}
        />
      </div>
    </div>
  );
}

function ContactPill({ icon: Icon, value }: { icon: LucideIcon; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm">
      <Icon className="h-4 w-4 text-brand-orange" />
      <span className="truncate">{value}</span>
    </span>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-brand-orange" />
      </CardContent>
    </Card>
  );
}

function Info({
  label,
  value,
  wide = false,
  emptyText = "-",
}: {
  label: string;
  value: unknown;
  wide?: boolean;
  emptyText?: string;
}) {
  const displayValue = Array.isArray(value)
    ? value.length
      ? value.join(", ")
      : emptyText
    : text(value) === "-"
      ? emptyText
      : text(value);

  return (
    <div className={`rounded-lg border bg-slate-50 p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{displayValue}</p>
    </div>
  );
}

function HistoryCard({
  title,
  items,
  empty,
  render,
}: {
  title: string;
  items: CustomerActivity[];
  empty: string;
  render: (item: CustomerActivity) => ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityList items={items} empty={empty} render={render} />
      </CardContent>
    </Card>
  );
}

function ActivityList({
  items,
  empty,
  render,
}: {
  items: CustomerActivity[];
  empty: string;
  render: (item: CustomerActivity) => ReactNode;
}) {
  if (!items.length) {
    return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</div>;
  }

  return <div className="space-y-3">{items.map((item) => <div key={item.id}>{render(item)}</div>)}</div>;
}

function ActivityRow({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border bg-background p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-brand-orange">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
