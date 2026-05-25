import { type ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BadgeDollarSign,
  CalendarRange,
  CreditCard,
  Megaphone,
  PieChart as PieChartIcon,
  ShieldAlert,
  TrendingUp,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { DashboardLayout } from "@/components/DashboardLayout";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import apiClient from "../lib/api/client";

export const Route = createFileRoute("/reports")({
  component: () => (
    <RouteGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Reports />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Reports & Analytics - Motorbike CRM" }] }),
});

const BAR_COLORS = ["#f97316", "#38bdf8", "#22c55e", "#a855f7", "#ec4899", "#14b8a6"];
const PIE_COLORS = ["#22c55e", "#f97316", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"];

type RangeKey = "week" | "month" | "year" | "custom";

interface SalesMonthlyItem {
  month: string;
  year: number;
  total_sales: number;
  total_revenue: string;
}

interface SalesPaymentMethodItem {
  payment_method: string;
  count: number;
}

interface SalesBySalespersonItem {
  name: string;
  total_sales: number;
  total_revenue: string;
}

interface RecentSaleItem {
  customer_name: string;
  motorbike: string;
  sale_price: string;
  salesperson_name: string;
  sale_date: string;
}

interface SalesReport {
  monthly_sales: SalesMonthlyItem[];
  sales_by_payment_method: SalesPaymentMethodItem[];
  sales_by_salesperson: SalesBySalespersonItem[];
  recent_sales: RecentSaleItem[];
}

interface InventorySummaryItem {
  status: string;
  count: number;
}

interface InventoryBrandItem {
  brand: string;
  count: number;
}

interface InventoryModelItem {
  brand: string;
  model_name: string;
  total_sold: number;
}

interface InventoryLowStockItem {
  brand: string;
  model_name: string;
  available_count: number;
}

interface InventoryReport {
  stock_summary: InventorySummaryItem[];
  stock_by_brand: InventoryBrandItem[];
  top_selling_models: InventoryModelItem[];
  low_stock_alert: InventoryLowStockItem[];
}

interface FinancingSummaryItem {
  status: string;
  count: number;
}

interface FinancingCollectionItem {
  month: string;
  year: number;
  total_amount: string;
}

interface FinancingDefaulterItem {
  customer_name: string;
  customer_phone: string;
  loan_amount: string;
  status: string;
}

interface FinancingReport {
  loans_summary: FinancingSummaryItem[];
  total_loan_amount: string;
  total_collected: string;
  total_pending: string;
  defaulters: FinancingDefaulterItem[];
  monthly_collections: FinancingCollectionItem[];
}

interface AdvertisingPlatformItem {
  platform: string;
  count: number;
  total_budget: string;
}

interface AdvertisingCampaignItem {
  title: string;
  platform: string;
  budget: string;
  amount_spent: string;
  leads_generated: number;
  cost_per_lead: number;
}

interface AdvertisingReport {
  campaigns_summary: { status: string; count: number }[];
  campaigns_by_platform: AdvertisingPlatformItem[];
  total_budget: string;
  total_spent: string;
  total_leads_generated: number;
  overall_cost_per_lead: number;
  top_campaigns: AdvertisingCampaignItem[];
}

interface MarketingSummaryItem {
  status: string;
  count: number;
}

interface MarketingPromotionItem {
  title: string;
  discount_percentage: string | null;
  discount_amount: string | null;
  start_date: string;
  end_date?: string;
}

interface MarketingSmsCampaignItem {
  title: string;
  status: string;
  total_sent: number;
  sent_at: string | null;
}

interface MarketingReport {
  sms_summary: MarketingSummaryItem[];
  total_sms_sent: number;
  active_promotions: MarketingPromotionItem[];
  upcoming_promotions: MarketingPromotionItem[];
  recent_sms_campaigns: MarketingSmsCampaignItem[];
}

function formatTsh(value: unknown) {
  const numeric = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numeric)) {
    return `TSh ${String(value ?? 0)}`;
  }

  return `TSh ${numeric.toLocaleString()}`;
}

function parseAmount(value: unknown) {
  const numeric = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function rangeQuery(range: RangeKey) {
  return `?range=${range}`;
}

function Reports() {
  useAuthRedirect();
  const [range, setRange] = useState<RangeKey>("month");

  const salesReportQ = useQuery({
    queryKey: ["reports", "sales", range],
    queryFn: () => apiClient(`/reports/sales/${rangeQuery(range)}`) as Promise<SalesReport>,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });

  const inventoryReportQ = useQuery({
    queryKey: ["reports", "inventory", range],
    queryFn: () => apiClient(`/reports/inventory/${rangeQuery(range)}`) as Promise<InventoryReport>,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });

  const financingReportQ = useQuery({
    queryKey: ["reports", "financing", range],
    queryFn: () => apiClient(`/reports/financing/${rangeQuery(range)}`) as Promise<FinancingReport>,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });

  const advertisingReportQ = useQuery({
    queryKey: ["reports", "advertising", range],
    queryFn: () =>
      apiClient(`/reports/advertising/${rangeQuery(range)}`) as Promise<AdvertisingReport>,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });

  const marketingReportQ = useQuery({
    queryKey: ["reports", "marketing", range],
    queryFn: () => apiClient(`/reports/marketing/${rangeQuery(range)}`) as Promise<MarketingReport>,
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });

  const salesReport: SalesReport = salesReportQ.data ?? {
    monthly_sales: [],
    sales_by_payment_method: [],
    sales_by_salesperson: [],
    recent_sales: [],
  };
  const inventoryReport: InventoryReport = inventoryReportQ.data ?? {
    stock_summary: [],
    stock_by_brand: [],
    top_selling_models: [],
    low_stock_alert: [],
  };
  const financingReport: FinancingReport = financingReportQ.data ?? {
    loans_summary: [],
    total_loan_amount: "0",
    total_collected: "0",
    total_pending: "0",
    defaulters: [],
    monthly_collections: [],
  };
  const advertisingReport: AdvertisingReport = advertisingReportQ.data ?? {
    campaigns_summary: [],
    campaigns_by_platform: [],
    total_budget: "0",
    total_spent: "0",
    total_leads_generated: 0,
    overall_cost_per_lead: 0,
    top_campaigns: [],
  };
  const marketingReport: MarketingReport = marketingReportQ.data ?? {
    sms_summary: [],
    total_sms_sent: 0,
    active_promotions: [],
    upcoming_promotions: [],
    recent_sms_campaigns: [],
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live report snapshots from the Django API.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {(["week", "month", "year", "custom"] as RangeKey[]).map((item) => (
            <Button
              key={item}
              variant={range === item ? "default" : "outline"}
              onClick={() => setRange(item)}
              className="justify-center gap-2"
            >
              <CalendarRange className="h-4 w-4" />
              {item === "week"
                ? "This Week"
                : item === "month"
                  ? "This Month"
                  : item === "year"
                    ? "This Year"
                    : "Custom Range"}
            </Button>
          ))}
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["sales", "inventory", "financing", "advertising", "marketing"]}
        className="space-y-3"
      >
        <ReportSection
          value="sales"
          title="Sales Reports"
          icon={TrendingUp}
          isLoading={salesReportQ.isLoading}
          isError={salesReportQ.isError}
          onRetry={() => salesReportQ.refetch()}
        >
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {salesReport.monthly_sales?.length ? (
                  <ResponsiveContainer>
                    <BarChart
                      data={salesReport.monthly_sales.map((item: SalesMonthlyItem) => ({
                        month: item.month,
                        revenue: parseAmount(item.total_revenue),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(value) => formatTsh(value)} />
                      <Tooltip formatter={(value: number) => [formatTsh(value), "Revenue"]} />
                      <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No monthly sales data available." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales by Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {salesReport.sales_by_payment_method?.length ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={salesReport.sales_by_payment_method}
                        dataKey="count"
                        nameKey="payment_method"
                        outerRadius={82}
                      >
                        {salesReport.sales_by_payment_method.map(
                          (_: SalesPaymentMethodItem, index: number) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No payment method breakdown available." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Salespersons</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ReportTable
                  columns={["Name", "Total Sales", "Total Revenue"]}
                  rows={(salesReport.sales_by_salesperson || [])
                    .slice()
                    .sort(
                      (a: SalesBySalespersonItem, b: SalesBySalespersonItem) =>
                        (b.total_sales || 0) - (a.total_sales || 0),
                    )
                    .map((row: SalesBySalespersonItem) => [
                      row.name,
                      row.total_sales,
                      formatTsh(row.total_revenue),
                    ])}
                  emptyMessage="No salesperson data available."
                />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                columns={["Customer", "Bike", "Price", "Salesperson", "Date"]}
                rows={(salesReport.recent_sales || [])
                  .slice(0, 10)
                  .map((row: RecentSaleItem) => [
                    row.customer_name,
                    row.motorbike,
                    formatTsh(row.sale_price),
                    row.salesperson_name,
                    row.sale_date,
                  ])}
                emptyMessage="No recent sales available."
              />
            </CardContent>
          </Card>
        </ReportSection>

        <ReportSection
          value="inventory"
          title="Inventory Reports"
          icon={Warehouse}
          isLoading={inventoryReportQ.isLoading}
          isError={inventoryReportQ.isError}
          onRetry={() => inventoryReportQ.refetch()}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {inventoryReport.stock_summary?.length ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={inventoryReport.stock_summary}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={45}
                        outerRadius={80}
                      >
                        {inventoryReport.stock_summary.map(
                          (_: InventorySummaryItem, index: number) => (
                            <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No stock summary available." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock By Brand</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {inventoryReport.stock_by_brand?.length ? (
                  <ResponsiveContainer>
                    <BarChart data={inventoryReport.stock_by_brand}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                      <XAxis dataKey="brand" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No stock by brand data available." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Selling Models</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ReportTable
                  columns={["Brand", "Model", "Total Sold"]}
                  rows={(inventoryReport.top_selling_models || [])
                    .slice(0, 5)
                    .map((row: InventoryModelItem) => [row.brand, row.model_name, row.total_sold])}
                  emptyMessage="No top selling model data available."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm inline-flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4" /> Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ReportTable
                  columns={["Brand", "Model", "Available Count"]}
                  rows={(inventoryReport.low_stock_alert || []).map(
                    (row: InventoryLowStockItem) => [
                      row.brand,
                      row.model_name,
                      row.available_count,
                    ],
                  )}
                  emptyMessage="No low stock alerts."
                  rowClassName="bg-rose-50 text-rose-900"
                />
              </CardContent>
            </Card>
          </div>
        </ReportSection>

        <ReportSection
          value="financing"
          title="Financing Reports"
          icon={CreditCard}
          isLoading={financingReportQ.isLoading}
          isError={financingReportQ.isError}
          onRetry={() => financingReportQ.refetch()}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Loan Amount"
              value={formatTsh(financingReport.total_loan_amount)}
              icon={BadgeDollarSign}
            />
            <MetricCard
              title="Total Collected"
              value={formatTsh(financingReport.total_collected)}
              icon={TrendingUp}
            />
            <MetricCard
              title="Total Pending"
              value={formatTsh(financingReport.total_pending)}
              icon={ShieldAlert}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Loan Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {financingReport.loans_summary?.length ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={financingReport.loans_summary}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={45}
                        outerRadius={80}
                      >
                        {financingReport.loans_summary.map(
                          (_: FinancingSummaryItem, index: number) => (
                            <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No loan status summary available." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Collections</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {financingReport.monthly_collections?.length ? (
                  <ResponsiveContainer>
                    <BarChart
                      data={financingReport.monthly_collections.map(
                        (item: FinancingCollectionItem) => ({
                          month: item.month,
                          amount: parseAmount(item.total_amount),
                        }),
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(value) => formatTsh(value)} />
                      <Tooltip formatter={(value: number) => [formatTsh(value), "Collected"]} />
                      <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No monthly collections data available." />
                )}
              </CardContent>
            </Card>

          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm inline-flex items-center gap-2 text-rose-600">
                <ShieldAlert className="h-4 w-4" /> Defaulters List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                columns={["Customer Name", "Phone", "Loan Amount", "Status"]}
                rows={(financingReport.defaulters || []).map((row: FinancingDefaulterItem) => [
                  row.customer_name,
                  row.customer_phone,
                  formatTsh(row.loan_amount),
                  row.status,
                ])}
                emptyMessage="No defaulters currently listed."
                rowClassName="bg-rose-50 text-rose-900"
              />
            </CardContent>
          </Card>
        </ReportSection>

        <ReportSection
          value="advertising"
          title="Advertising Reports"
          icon={Megaphone}
          isLoading={advertisingReportQ.isLoading}
          isError={advertisingReportQ.isError}
          onRetry={() => advertisingReportQ.refetch()}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campaigns By Platform</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {advertisingReport.campaigns_by_platform?.length ? (
                  <ResponsiveContainer>
                    <BarChart data={advertisingReport.campaigns_by_platform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                      <XAxis dataKey="platform" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No campaign platform data available." />
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                title="Total Budget"
                value={formatTsh(advertisingReport.total_budget)}
                icon={BadgeDollarSign}
              />
              <MetricCard
                title="Total Spent"
                value={formatTsh(advertisingReport.total_spent)}
                icon={TrendingUp}
              />
              <MetricCard
                title="Total Leads"
                value={String(advertisingReport.total_leads_generated ?? 0)}
                icon={BarChart3}
              />
              <MetricCard
                title="Overall Cost Per Lead"
                value={formatTsh(advertisingReport.overall_cost_per_lead)}
                icon={CreditCard}
              />
            </div>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                columns={["Title", "Platform", "Budget", "Spent", "Leads", "Cost/Lead"]}
                rows={(advertisingReport.top_campaigns || [])
                  .slice(0, 5)
                  .map((row: AdvertisingCampaignItem) => [
                    row.title,
                    row.platform,
                    formatTsh(row.budget),
                    formatTsh(row.amount_spent),
                    row.leads_generated,
                    formatTsh(row.cost_per_lead),
                  ])}
                emptyMessage="No top campaigns available."
              />
            </CardContent>
          </Card>
        </ReportSection>

        <ReportSection
          value="marketing"
          title="Marketing Reports"
          icon={PieChartIcon}
          isLoading={marketingReportQ.isLoading}
          isError={marketingReportQ.isError}
          onRetry={() => marketingReportQ.refetch()}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                title="Total SMS Campaigns"
                value={String(
                  (marketingReport.sms_summary || []).reduce(
                    (sum: number, item: MarketingSummaryItem) => sum + Number(item.count || 0),
                    0,
                  ),
                )}
                icon={BadgeDollarSign}
              />
              <MetricCard
                title="Total SMS Sent"
                value={String(marketingReport.total_sms_sent ?? 0)}
                icon={TrendingUp}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent SMS Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ReportTable
                  columns={["Title", "Status", "Recipients", "Sent", "Sent At"]}
                  rows={(marketingReport.recent_sms_campaigns || []).map(
                    (row: MarketingSmsCampaignItem) => [
                      row.title,
                      row.status,
                      row.total_sent,
                      row.total_sent,
                      row.sent_at || "-",
                    ],
                  )}
                  emptyMessage="No recent SMS campaigns available."
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Active Promotions</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {(marketingReport.active_promotions || []).length ? (
                  marketingReport.active_promotions.map(
                    (promotion: MarketingPromotionItem, index: number) => (
                      <Card key={`${promotion.title}-${index}`}>
                        <CardContent className="space-y-2 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{promotion.title}</div>
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                              Active
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {promotion.discount_percentage || promotion.discount_amount
                              ? `${promotion.discount_percentage || promotion.discount_amount}`
                              : "No discount set"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {promotion.start_date} - {promotion.end_date}
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )
                ) : (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      No active promotions.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Upcoming Promotions</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {(marketingReport.upcoming_promotions || []).length ? (
                  marketingReport.upcoming_promotions.map(
                    (promotion: MarketingPromotionItem, index: number) => (
                      <Card key={`${promotion.title}-${index}`}>
                        <CardContent className="space-y-2 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{promotion.title}</div>
                            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                              Upcoming
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {promotion.discount_percentage || promotion.discount_amount
                              ? `${promotion.discount_percentage || promotion.discount_amount}`
                              : "No discount set"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Starts {promotion.start_date}
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )
                ) : (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      No upcoming promotions.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </ReportSection>
      </Accordion>
    </div>
  );
}

function ReportSection({
  value,
  title,
  icon: Icon,
  isLoading,
  isError,
  onRetry,
  children,
}: {
  value: string;
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
        <span className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-[#f97316]">
            <Icon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold text-foreground">{title}</span>
            <span className="block text-xs text-muted-foreground">
              Live report data from the backend
            </span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-5 sm:px-5">
        {isLoading ? (
          <SectionSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <div className="flex-1">
                <div className="font-semibold">Failed to load {title.toLowerCase()}</div>
                <div className="text-sm text-muted-foreground">
                  Try again to fetch the latest API data.
                </div>
              </div>
              <Button onClick={onRetry}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          children
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function ReportTable({
  columns,
  rows,
  emptyMessage,
  rowClassName,
}: {
  columns: string[];
  rows: Array<Array<unknown>>;
  emptyMessage: string;
  rowClassName?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row, index) => (
            <TableRow key={`${index}-${String(row[0] ?? index)}`} className={rowClassName}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{String(cell ?? "-")}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full min-h-28 flex-col justify-between p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase leading-5 text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <p className="break-words text-2xl font-bold leading-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 rounded-2xl bg-muted/40" />
        <div className="h-72 rounded-2xl bg-muted/40" />
        <div className="h-72 rounded-2xl bg-muted/40" />
      </div>
      <div className="h-72 rounded-2xl bg-muted/40" />
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  );
}
