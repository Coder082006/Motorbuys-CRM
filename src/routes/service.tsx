import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { services, spareParts, formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/service")({
  component: () => <DashboardLayout><Service /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Service Center — Motorbike CRM" }] }),
});

const stColor: Record<string, string> = {
  Received: "bg-slate-200 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  "Awaiting Parts": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function Stat({ label, value }: any) {
  return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}

function Service() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Service Center</h1>
        <ServiceModal />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Bikes Received" value="14" />
        <Stat label="In Progress" value="6" />
        <Stat label="Completed Today" value="3" />
        <Stat label="Service Revenue" value="KSh 184K" />
      </div>
      <Tabs defaultValue="srv">
        <TabsList><TabsTrigger value="srv">Service Requests</TabsTrigger><TabsTrigger value="parts">Spare Parts</TabsTrigger></TabsList>
        <TabsContent value="srv">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Customer</TableHead><TableHead>Motorbike</TableHead><TableHead>Service Type</TableHead>
                <TableHead>Status</TableHead><TableHead>Technician</TableHead><TableHead>Cost</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {services.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{s.bike}</TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell><Badge className={stColor[s.status]}>{s.status}</Badge></TableCell>
                    <TableCell>{s.technician}</TableCell>
                    <TableCell>{formatKES(s.cost)}</TableCell>
                    <TableCell className="text-right"><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="parts">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Part Name</TableHead><TableHead>Part #</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
              <TableBody>
                {spareParts.map(p => (
                  <TableRow key={p.part}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.part}</TableCell>
                    <TableCell><Badge className={p.stock < 10 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}>{p.stock} pcs</Badge></TableCell>
                    <TableCell>{formatKES(p.price)}</TableCell>
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

function ServiceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New Service Request</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Service Request</DialogTitle></DialogHeader>
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2"><Label>Customer</Label><Input /></div>
          <div className="space-y-1.5 col-span-2"><Label>Motorbike</Label><Input /></div>
          <div className="space-y-1.5"><Label>Service Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="full">Full Service</SelectItem><SelectItem value="oil">Oil Change</SelectItem><SelectItem value="tyre">Tyre Replacement</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Technician</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="eric">Eric W.</SelectItem><SelectItem value="joel">Joel K.</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea rows={3} /></div>
          <div className="space-y-1.5 col-span-2"><Label>Estimated Completion</Label><Input type="date" /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
