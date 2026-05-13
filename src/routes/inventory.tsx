import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil } from "lucide-react";
import { bikes, formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/inventory")({
  component: () => <DashboardLayout><Inventory /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Inventory — Motorbike CRM" }] }),
});

const statusStyles: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Reserved: "bg-amber-100 text-amber-700",
  Sold: "bg-rose-100 text-rose-700",
  "In Service": "bg-sky-100 text-sky-700",
};

function Inventory() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [brand, setBrand] = useState("all");
  const filtered = bikes.filter(b =>
    b.name.toLowerCase().includes(q.toLowerCase()) &&
    (status === "all" || b.status === status) &&
    (brand === "all" || b.brand === brand)
  );
  const brands = Array.from(new Set(bikes.map(b => b.brand)));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Motorbike Inventory</h1>
        <BikeModal />
      </div>
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(statusStyles).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(b => (
          <Card key={b.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="aspect-[4/3] bg-muted overflow-hidden">
              <img src={b.img} alt={b.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{b.brand}</p>
                  <h3 className="font-semibold leading-tight">{b.model}</h3>
                </div>
                <Badge className={statusStyles[b.status]}>{b.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{b.color} · {b.year} · {b.cc}cc</div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-brand-orange font-bold">{formatKES(b.price)}</span>
                <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BikeModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add Motorbike</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Motorbike</DialogTitle></DialogHeader>
        <form className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-1.5"><Label>Brand</Label><Input /></div>
          <div className="space-y-1.5"><Label>Model Name</Label><Input /></div>
          <div className="space-y-1.5"><Label>Engine CC</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Bike Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="a">Automatic</SelectItem><SelectItem value="s">Semi-Automatic</SelectItem><SelectItem value="m">Manual</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Color</Label><Input /></div>
          <div className="space-y-1.5"><Label>Year</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Chassis Number</Label><Input /></div>
          <div className="space-y-1.5"><Label>Engine Number</Label><Input /></div>
          <div className="space-y-1.5"><Label>Price (KSh)</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{Object.keys(statusStyles).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2"><Label>Image</Label><Input type="file" /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Notes</Label><Textarea rows={3} /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Save Bike</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
