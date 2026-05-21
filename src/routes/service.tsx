import { useState } from "react";
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
import { formatKES } from "@/lib/mock-data";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useServiceRecords, useCreateServiceRecord, useUpdateServiceRecord, useSpareParts, useCreateSparePart, useDeleteSparePart, useUsers, useCustomers } from "../hooks/queries";

export const Route = createFileRoute("/service")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "service"]}>
      <DashboardLayout><Service /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Service Center - Motorbike CRM" }] }),
});

const stColor: Record<string, string> = {
  received: "bg-slate-200 text-slate-700",
  diagnosing: "bg-amber-100 text-amber-700",
  in_progress: "bg-amber-100 text-amber-700",
  waiting_parts: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  delivered: "bg-slate-200 text-slate-700",
};

function Stat({ label, value }: any) {
  return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}

function Service() {
  useAuthRedirect();
  const recordsQ = useServiceRecords();
  const partsQ = useSpareParts();
  const createRecord = useCreateServiceRecord();
  const updateRecord = useUpdateServiceRecord();
  const createPart = useCreateSparePart();
  const deletePart = useDeleteSparePart();
  const usersQ = useUsers();
  const customersQ = useCustomers();

  const records = recordsQ.data || [];
  const parts = partsQ.data || [];

  const bikesReceivedToday = records.filter((r:any)=> new Date(r.received_date).toDateString() === new Date().toDateString()).length;
  const inProgress = records.filter((r:any)=> r.status === 'in_progress' || r.status === 'diagnosing').length;
  const completedToday = records.filter((r:any)=> r.completed_date && new Date(r.completed_date).toDateString() === new Date().toDateString()).length;
  const revenue = records.reduce((s:any,r:any)=> s + Number(r.total_cost || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl font-bold tracking-tight">Service Center</h1><ServiceModal open={false} onOpenChange={()=>{}} customers={customersQ.data} bikes={[]} technicians={usersQ.data} onCreate={(d:any)=> createRecord.mutate(d)} /></div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4"><Stat label="Bikes Received" value={String(bikesReceivedToday)} /><Stat label="In Progress" value={String(inProgress)} /><Stat label="Completed Today" value={String(completedToday)} /><Stat label="Service Revenue" value={formatKES(revenue)} /></div>
      <Tabs defaultValue="srv">
        <TabsList><TabsTrigger value="srv">Service Requests</TabsTrigger><TabsTrigger value="parts">Spare Parts</TabsTrigger></TabsList>
        <TabsContent value="srv">
          {recordsQ.isLoading ? <Card className="p-6 animate-pulse" /> : recordsQ.isError ? <Card className="p-6"><p>Failed to load service records</p><div className="pt-2"><Button onClick={()=>recordsQ.refetch()}>Retry</Button></div></Card> : (
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Motorbike</TableHead><TableHead>Service Type</TableHead><TableHead>Status</TableHead><TableHead>Technician</TableHead><TableHead>Total Cost</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{records.map((s:any) => <TableRow key={s.id}><TableCell className="font-medium">{s.customer_name}</TableCell><TableCell className="text-muted-foreground">{s.motorbike_name || s.motorbike}</TableCell><TableCell>{s.service_type}</TableCell><TableCell><Badge className={stColor[s.status]}>{mapStatusLabel(s.status)}</Badge></TableCell><TableCell>{s.technician_name}</TableCell><TableCell>{formatKES(s.total_cost)}</TableCell><TableCell className="text-right"><div className="inline-flex gap-2"><Select value={s.status} onValueChange={(v)=> updateRecord.mutate({ id: s.id, data: { ...s, status: v } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="received">Bike Received</SelectItem><SelectItem value="diagnosing">Diagnosing</SelectItem><SelectItem value="in_progress">Work In Progress</SelectItem><SelectItem value="waiting_parts">Waiting for Parts</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          )}
        </TabsContent>
        <TabsContent value="parts">
          {partsQ.isLoading ? <Card className="p-6 animate-pulse" /> : partsQ.isError ? <Card className="p-6"><p>Failed to load spare parts</p><div className="pt-2"><Button onClick={()=>partsQ.refetch()}>Retry</Button></div></Card> : (
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Part Name</TableHead><TableHead>Part #</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{parts.map((p:any) => <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="font-mono text-xs">{p.part_number}</TableCell><TableCell>{p.quantity_in_stock < 5 ? <Badge className="bg-rose-100 text-rose-700">{p.quantity_in_stock} pcs</Badge> : <Badge className="bg-emerald-100 text-emerald-700">{p.quantity_in_stock} pcs</Badge>}</TableCell><TableCell>{formatKES(p.unit_price)}</TableCell><TableCell className="text-right"><div className="inline-flex gap-1"><Button size="icon" variant="ghost" onClick={()=>{ const qty = prompt('Update stock quantity', String(p.quantity_in_stock)); if (qty) {/* quick update */} }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={()=>{ if (confirm('Delete spare part?')) deletePart.mutate(p.id); }}>Delete</Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          )}
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
          <div className="space-y-1.5"><Label>Service Type</Label><Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="full">Full Service</SelectItem><SelectItem value="oil">Oil Change</SelectItem><SelectItem value="tyre">Tyre Replacement</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Technician</Label><Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="eric">Eric W.</SelectItem><SelectItem value="joel">Joel K.</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea rows={3} /></div>
          <div className="space-y-1.5 col-span-2"><Label>Estimated Completion</Label><Input type="date" /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
