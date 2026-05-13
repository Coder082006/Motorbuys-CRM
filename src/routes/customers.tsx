import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { customers } from "@/lib/mock-data";

export const Route = createFileRoute("/customers")({
  component: () => <DashboardLayout><Customers /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Customers — Motorbike CRM" }] }),
});

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Prospect: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Inactive: "bg-rose-100 text-rose-700 hover:bg-rose-100",
  };
  return <Badge className={map[s]}>{s}</Badge>;
}

function Customers() {
  const [q, setQ] = useState("");
  const filtered = customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <CustomerModal />
      </div>
      <Card className="p-4">
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Region</TableHead>
            <TableHead>Status</TableHead><TableHead>Assigned To</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell>{c.region}</TableCell>
                <TableCell><StatusBadge s={c.status} /></TableCell>
                <TableCell>{c.assignedTo}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function CustomerModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add Customer</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
        <form className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-1.5"><Label>First Name</Label><Input /></div>
          <div className="space-y-1.5"><Label>Last Name</Label><Input /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input /></div>
          <div className="space-y-1.5"><Label>Alt Phone</Label><Input /></div>
          <div className="space-y-1.5"><Label>ID Number</Label><Input /></div>
          <div className="space-y-1.5"><Label>Region</Label><Input /></div>
          <div className="space-y-1.5"><Label>District</Label><Input /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Address</Label><Input /></div>
          <div className="space-y-1.5">
            <Label>Customer Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="ind">Individual</SelectItem><SelectItem value="biz">Business</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="p">Prospect</SelectItem><SelectItem value="a">Active</SelectItem><SelectItem value="i">Inactive</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Budget (KSh)</Label><Input type="number" /></div>
          <div className="space-y-1.5">
            <Label>Preferred Bike Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="auto">Automatic</SelectItem><SelectItem value="semi">Semi-Automatic</SelectItem><SelectItem value="man">Manual</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2"><Label>How Did You Hear About Us</Label><Input /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Notes</Label><Textarea rows={3} /></div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Assigned To</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select sales staff…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="po">Peter Otieno</SelectItem>
                <SelectItem value="ma">Mary Achieng</SelectItem>
                <SelectItem value="jm">James Mutua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Save Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
