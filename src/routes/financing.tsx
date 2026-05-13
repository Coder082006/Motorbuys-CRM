import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Smartphone } from "lucide-react";
import { loans, payments, formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/financing")({
  component: () => <DashboardLayout><Financing /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Financing — Motorbike CRM" }] }),
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
    <Card><CardContent className="p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || ""}`}>{value}</p>
    </CardContent></Card>
  );
}

function Financing() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Financing & Loans</h1>
        <LoanModal />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Loans" value="58" color="text-brand-orange" />
        <Stat label="Total Collected" value="KSh 12.4M" color="text-emerald-600" />
        <Stat label="Total Pending" value="KSh 3.1M" color="text-amber-600" />
        <Stat label="Defaulters" value="6" color="text-rose-600" />
      </div>
      <Tabs defaultValue="loans">
        <TabsList><TabsTrigger value="loans">Loans</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger></TabsList>
        <TabsContent value="loans">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Customer</TableHead><TableHead>Loan Amount</TableHead><TableHead>Monthly</TableHead>
                <TableHead>Duration</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {loans.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.customer}</TableCell>
                    <TableCell>{formatKES(l.amount)}</TableCell>
                    <TableCell>{formatKES(l.monthly)}</TableCell>
                    <TableCell>{l.duration} mo</TableCell>
                    <TableCell><Badge className={loanColors[l.status]}>{l.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="gap-1"><Smartphone className="h-3 w-3" /> M-Pesa</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Transaction ID</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>{p.customer}</TableCell>
                    <TableCell>{formatKES(p.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.date}</TableCell>
                    <TableCell><Badge className={p.status === "Success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoanModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add Loan</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Loan</DialogTitle></DialogHeader>
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2"><Label>Customer</Label><Input /></div>
          <div className="space-y-1.5 col-span-2"><Label>Sale</Label><Input placeholder="Sale ID" /></div>
          <div className="space-y-1.5"><Label>Loan Amount</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Down Payment</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Interest %</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Duration (mo)</Label><Input type="number" /></div>
          <div className="space-y-1.5 col-span-2"><Label>Monthly Installment</Label><Input type="number" /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Create Loan</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
