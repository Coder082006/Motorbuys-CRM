import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useLoans,
  useCreateLoan,
  useUpdateLoan,
  usePayments,
  useCreatePayment,
  useInitiateMpesa,
  useCustomers,
} from "../hooks/queries";

export const Route = createFileRoute("/financing")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "financing"]}>
      <DashboardLayout>
        <Financing />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Financing - Motorbike CRM" }] }),
});

const loanColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-sky-100 text-sky-700",
  Active: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-200 text-slate-700",
  Defaulted: "bg-rose-100 text-rose-700",
};

function Stat({ label, value, color }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color || ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Financing() {
  useAuthRedirect();
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const loansQ = useLoans();
  const paymentsQ = usePayments();
  const customersQ = useCustomers();
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const initiateMpesa = useInitiateMpesa();

  const loans = loansQ.data || [];
  const payments = paymentsQ.data || [];

  const totalActive = loans.filter((l: any) => l.status === "active").length;
  const totalCollectedThisMonth = payments.reduce((s: any, p: any) => s + Number(p.amount || 0), 0);
  const totalPending = loans.reduce((s: any, l: any) => s + Number(l.total_payable || 0), 0);
  const totalDefaulters = loans.filter((l: any) => l.status === "defaulted").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Financing & Loans</h1>
        <LoanModal
          open={loanModalOpen}
          onOpenChange={setLoanModalOpen}
          customers={customersQ.data}
          creating={createLoan.isLoading}
          onCreate={(data: any) => createLoan.mutate(data)}
        />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Loans" value={String(totalActive)} color="text-brand-orange" />
        <Stat
          label="Total Collected"
          value={formatCurrency(totalCollectedThisMonth)}
          color="text-emerald-600"
        />
        <Stat label="Total Pending" value={formatCurrency(totalPending)} color="text-amber-600" />
        <Stat label="Defaulters" value={String(totalDefaulters)} color="text-rose-600" />
      </div>
      <Tabs defaultValue="loans">
        <TabsList>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="loans">
          {loansQ.isLoading ? (
            <Card className="p-6 animate-pulse" />
          ) : loansQ.isError ? (
            <Card className="p-6">
              <p>Failed to load loans</p>
              <div className="pt-2">
                <Button onClick={() => loansQ.refetch()}>Retry</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.customer_name}</TableCell>
                        <TableCell>{formatCurrency(l.loan_amount)}</TableCell>
                        <TableCell>{formatCurrency(l.monthly_installment)}</TableCell>
                        <TableCell>{l.duration_months} mo</TableCell>
                        <TableCell>
                          <Badge className={loanColors[mapLoanStatusLabel(l.status)]}>
                            {mapLoanStatusLabel(l.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => openMpesa(l)}
                            >
                              <Smartphone className="h-3 w-3" /> M-Pesa
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => editLoan(l)}>
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="payments">
          {paymentsQ.isLoading ? (
            <Card className="p-6 animate-pulse" />
          ) : paymentsQ.isError ? (
            <Card className="p-6">
              <p>Failed to load payments</p>
              <div className="pt-2">
                <Button onClick={() => paymentsQ.refetch()}>Retry</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>{p.customer_name}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{p.payment_date}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              p.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <MpesaModal />
    </div>
  );

  function mapLoanStatusLabel(status: string) {
    if (!status) return "Pending";
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "defaulted":
        return "Defaulted";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  }

  function editLoan(l: any) {
    // open simple prompt for quick status update to satisfy requirements
    const newStatus = prompt(
      "Update loan status (pending, approved, active, completed, defaulted, rejected)",
      l.status,
    );
    if (!newStatus) return;
    updateLoan.mutate({ id: l.id, data: { ...l, status: newStatus } });
  }

  function openMpesa(l: any) {
    const phone = prompt("Enter customer phone for M-Pesa prompt:", l.customer_phone || "");
    if (!phone) return;
    const amount = prompt("Amount to request:", l.down_payment || l.loan_amount || "");
    if (!amount) return;
    initiateMpesa.mutate({ loan: l.id, phone, amount });
  }
}

function LoanModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">
          <Plus className="h-4 w-4 mr-1" /> Add Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Loan</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label>Customer</Label>
            <Input />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Sale</Label>
            <Input placeholder="Sale ID" />
          </div>
          <div className="space-y-1.5">
            <Label>Loan Amount</Label>
            <Input type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Down Payment</Label>
            <Input type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Interest %</Label>
            <Input type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Duration (mo)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Monthly Installment</Label>
            <Input type="number" />
          </div>
        </form>
        <DialogFooter>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">
            Create Loan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
