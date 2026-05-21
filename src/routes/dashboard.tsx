import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bike, TrendingUp, DollarSign, CreditCard, Wrench } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { monthlySales, topBikes, recentSales, customers, formatKES } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "sales", "financing", "advertising", "marketing", "service"]}>
      <DashboardLayout><Dashboard /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Dashboard - Motorbike CRM" }] }),
});

const COLORS = ["oklch(0.7 0.19 50)", "oklch(0.55 0.15 260)", "oklch(0.65 0.18 180)", "oklch(0.7 0.15 320)", "oklch(0.6 0.05 260)"];

function StatCard({ icon: Icon, label, value, trend }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
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

function Dashboard() {
  useAuthRedirect();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back - here's what's happening today.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Customers" value="1,284" trend="+12% MoM" />
        <StatCard icon={Bike} label="Bikes in Stock" value="146" />
        <StatCard icon={TrendingUp} label="Sales (Month)" value="32" trend="+8%" />
        <StatCard icon={DollarSign} label="Revenue" value="KSh 7.1M" trend="+18%" />
        <StatCard icon={CreditCard} label="Active Loans" value="58" />
        <StatCard icon={Wrench} label="Pending Services" value="14" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatKES(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                <Bar dataKey="revenue" fill="oklch(0.7 0.19 50)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Models</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topBikes} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {topBikes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Sales</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Bike</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{s.bike}</TableCell>
                    <TableCell className="text-right font-semibold">{formatKES(s.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Customers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Region</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {customers.slice(0, 5).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.region}</TableCell>
                    <TableCell><StatusBadge s={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
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
