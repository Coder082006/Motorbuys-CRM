import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart3,
  Bell,
  Bike,
  BriefcaseBusiness,
  CreditCard,
  Megaphone,
  LogOut,
  Settings2,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const username = "Amina";
const role = "Admin";

const stats = [
  { label: "Total Bikes in Stock", value: "42", icon: Bike },
  { label: "Total Customers", value: "128", icon: Users },
  { label: "Sales This Month", value: "TSh 24,500,000", icon: TrendingUp },
  { label: "Active Loans", value: "17", icon: CreditCard },
  { label: "Pending Services", value: "8", icon: Wrench },
  { label: "Active Campaigns", value: "3", icon: Megaphone },
] as const;

const modules = [
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
] as const;

const monthlySales = [
  { month: "Jan", sales: 14200000 },
  { month: "Feb", sales: 16800000 },
  { month: "Mar", sales: 15400000 },
  { month: "Apr", sales: 19700000 },
  { month: "May", sales: 22100000 },
  { month: "Jun", sales: 24500000 },
];

const activityFeed = [
  "John added a new customer - 2 mins ago",
  "Payment of TSh 500,000 received - 1 hour ago",
  "New lead assigned to Peter - 3 hours ago",
  "Bajaj Boxer marked as Sold - Today",
  "Service request opened for customer Ali - Today",
];

const followUps = [
  { customer: "Asha Mushi", phone: "+255 713 220 114", stage: "Negotiation", assignedTo: "Peter" },
  { customer: "Salum Juma", phone: "+255 754 983 210", stage: "Documentation", assignedTo: "Rehema" },
  { customer: "Neema Ally", phone: "+255 687 112 904", stage: "Deposit Pending", assignedTo: "John" },
  { customer: "Bakari Said", phone: "+255 765 401 551", stage: "Financing Review", assignedTo: "Amina" },
];

const recentSales = [
  { customer: "Hassan Omari", bike: "Bajaj Boxer 150", amount: "TSh 2,800,000", salesperson: "Peter", date: "13 May 2026" },
  { customer: "Joyce Peter", bike: "TVS HLX 125", amount: "TSh 3,100,000", salesperson: "Rehema", date: "12 May 2026" },
  { customer: "Adam Yusuf", bike: "Honda Ace CB125", amount: "TSh 4,600,000", salesperson: "John", date: "12 May 2026" },
  { customer: "Mariam Ali", bike: "Yamaha AG100", amount: "TSh 5,250,000", salesperson: "Amina", date: "11 May 2026" },
];

function HomePage() {
  const navigate = useNavigate();

  return (
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
                    <div className="text-xs text-slate-400">
                      Staff operations dashboard
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 text-left lg:items-center lg:text-center">
                <div className="text-xl font-semibold text-white">
                  Welcome back, {username}
                </div>
                <span className="inline-flex items-center rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  {role}
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
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
                    <div className="text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </section>

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
                  {modules.map(({ title, description, icon: Icon, to }) => (
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
                      <p className="text-sm text-slate-400">Last 6 months</p>
                    </div>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySales}>
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(value) => `TSh ${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "16px",
                            color: "#f8fafc",
                          }}
                          formatter={(value: number) => [`TSh ${value.toLocaleString()}`, "Sales"]}
                        />
                        <Bar dataKey="sales" fill="#f97316" radius={[10, 10, 0, 0]} maxBarSize={46} />
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
                      <p className="text-sm text-slate-400">Latest actions across the dealership</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activityFeed.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/8 bg-[#0f172a]/60 px-4 py-3"
                      >
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/15 text-[#f97316]">
                          {index === 0 && <ShieldCheck className="h-4 w-4" />}
                          {index === 1 && <CreditCard className="h-4 w-4" />}
                          {index === 2 && <UserRound className="h-4 w-4" />}
                          {index === 3 && <Bike className="h-4 w-4" />}
                          {index === 4 && <Settings2 className="h-4 w-4" />}
                        </div>
                        <div className="text-sm leading-6 text-slate-200">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-lg font-semibold text-white">Today&apos;s Follow-ups</h2>
                    <p className="mt-1 text-sm text-slate-400">Priority contacts that need action today</p>
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
                        {followUps.map((row, index) => (
                          <tr
                            key={`${row.customer}-${row.phone}`}
                            className={index % 2 === 0 ? "bg-[#1e293b]" : "bg-[#233047]"}
                          >
                            <td className="px-5 py-4 font-medium text-white">{row.customer}</td>
                            <td className="px-5 py-4 text-slate-300">{row.phone}</td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-300">
                                {row.stage}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-300">{row.assignedTo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b] shadow-sm shadow-black/20">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
                    <p className="mt-1 text-sm text-slate-400">Latest completed dealership transactions</p>
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
                        {recentSales.map((row, index) => (
                          <tr
                            key={`${row.customer}-${row.date}`}
                            className={index % 2 === 0 ? "bg-[#1e293b]" : "bg-[#233047]"}
                          >
                            <td className="px-5 py-4 font-medium text-white">{row.customer}</td>
                            <td className="px-5 py-4 text-slate-300">{row.bike}</td>
                            <td className="px-5 py-4 font-semibold text-orange-300">{row.amount}</td>
                            <td className="px-5 py-4 text-slate-300">{row.salesperson}</td>
                            <td className="px-5 py-4 text-slate-300">{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
