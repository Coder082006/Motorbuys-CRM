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
import { formatKES } from "@/lib/mock-data";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useBikes, useBikeModels, useCreateBike, useUpdateBike, useDeleteBike } from "../hooks/queries";

export const Route = createFileRoute("/inventory")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "sales", "marketing"]}>
      <DashboardLayout><Inventory /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Inventory - Motorbike CRM" }] }),
});

const statusStyles: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Reserved: "bg-amber-100 text-amber-700",
  Sold: "bg-rose-100 text-rose-700",
  "In Service": "bg-sky-100 text-sky-700",
};

function Inventory() {
  useAuthRedirect();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [brand, setBrand] = useState("all");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const params = (() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (status !== "all") p.set("status", status.toLowerCase());
    if (brand !== "all") p.set("brand", brand);
    const s = p.toString();
    return s ? `?${s}` : "";
  })();

  const { data, isLoading, isError, error, refetch } = useBikes(params);
  const modelsQ = useBikeModels();
  const create = useCreateBike();
  const update = useUpdateBike();
  const remove = useDeleteBike();

  const bikesList: any[] = data || [];
  const uniqueBrands = Array.from(new Set(bikesList.map((b) => b.model_detail?.brand).filter(Boolean)));

  function openEdit(bike: any) {
    setEditing(bike);
    setOpenModal(true);
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this motorbike? This action cannot be undone.")) return;
    remove.mutate(id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Motorbike Inventory</h1>
        <BikeModal
          open={openModal}
          onOpenChange={setOpenModal}
          models={modelsQ.data}
          creating={create.isLoading}
          updating={update.isLoading}
          onCreate={(payload) => create.mutate(payload)}
          onUpdate={(id, payload) => update.mutate({ id, data: payload })}
          initialData={editing}
          onSaved={() => { setOpenModal(false); setEditing(null); }}
        />
      </div>
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search (chassis or model)..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(statusStyles).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {uniqueBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-56" />
            ))}
          </div>
        ) : isError ? (
          <Card className="p-6"><div className="space-y-2"><p className="font-semibold">Failed to load inventory</p><p className="text-sm text-muted-foreground">{String((error as any)?.message || "Unknown error")}</p><div className="pt-2"><Button onClick={() => refetch()}>Retry</Button></div></div></Card>
        ) : bikesList.length === 0 ? (
          <Card className="p-6 text-center"><p className="font-semibold">No motorbikes found</p><p className="text-sm text-muted-foreground">Add your first motorbike to get started.</p><div className="pt-4 flex justify-center"><Button onClick={() => setOpenModal(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Add Motorbike</Button></div></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bikesList.map((b: any) => (
              <Card key={b.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={b.image || "/placeholder-bike.jpg"} alt={`${b.model_detail?.brand} ${b.model_detail?.model_name}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{b.model_detail?.brand}</p>
                      <h3 className="font-semibold leading-tight">{b.model_detail?.model_name}</h3>
                    </div>
                    <Badge className={statusStyles[mapStatusLabel(b.status)]}>{mapStatusLabel(b.status)}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{b.color} - {b.year} - {b.model_detail?.engine_cc}cc</div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-brand-orange font-bold">{formatKES(b.price)}</span>
                    <div className="inline-flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(b.id)}>Delete</Button></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function handleDelete(id: number) {
    if (!confirm("Delete this motorbike? This action cannot be undone.")) return;
    remove.mutate(id);
  }

  function mapStatusLabel(status: string) {
    switch (status) {
      case "available":
        return "Available";
      case "reserved":
        return "Reserved";
      case "sold":
        return "Sold";
      case "service":
        return "In Service";
      default:
        return status;
    }
  }
}

function BikeModal({ open, onOpenChange, models, creating, updating, onCreate, onUpdate, initialData, onSaved }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>(initialData || { model: "", color: "black", year: new Date().getFullYear(), chassis_number: "", engine_number: "", price: "", status: "available", notes: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});

  // sync external open prop
  if (open !== undefined && open !== isOpen) setIsOpen(open);
  if (initialData && initialData.id && initialData.id !== form.id) setForm(initialData);

  function close() {
    setIsOpen(false);
    onOpenChange?.(false);
    setForm({ model: "", color: "black", year: new Date().getFullYear(), chassis_number: "", engine_number: "", price: "", status: "available", notes: "" });
    setErrors({});
  }

  async function submit(e?: any) {
    e?.preventDefault();
    setErrors({});
    try {
      if (form.id) {
        await onUpdate(form.id, form);
      } else {
        await onCreate(form);
      }
      close();
      onSaved?.();
    } catch (err: any) {
      setErrors({ _general: err?.message || "Save failed" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); onOpenChange?.(v); if (!v) setForm({}); }}>
      <DialogTrigger asChild><Button onClick={() => setIsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add Motorbike</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{form?.id ? "Edit Motorbike" : "Add Motorbike"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-1.5"><Label>Model</Label>
            <Select value={String(form.model || "")} onValueChange={(v)=>setForm((s:any)=>({...s, model: Number(v)}))}>
              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
              <SelectContent>{models?.map((m:any)=> <SelectItem key={m.id} value={String(m.id)}>{m.brand} {m.model_name}</SelectItem>)}</SelectContent>
            </Select>
            {errors.model && <p className="text-destructive text-xs">{errors.model}</p>}
          </div>
          <div className="space-y-1.5"><Label>Color</Label><Select value={form.color} onValueChange={(v)=>setForm((s:any)=>({...s,color:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="red">red</SelectItem><SelectItem value="black">black</SelectItem><SelectItem value="blue">blue</SelectItem><SelectItem value="white">white</SelectItem><SelectItem value="silver">silver</SelectItem><SelectItem value="green">green</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Year</Label><Input type="number" value={form.year} onChange={(e)=>setForm((s:any)=>({...s,year:Number(e.target.value)}))} /></div>
          <div className="space-y-1.5"><Label>Chassis Number</Label><Input value={form.chassis_number} onChange={(e)=>setForm((s:any)=>({...s,chassis_number:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Engine Number</Label><Input value={form.engine_number} onChange={(e)=>setForm((s:any)=>({...s,engine_number:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Price (KSh)</Label><Input type="number" value={form.price} onChange={(e)=>setForm((s:any)=>({...s,price:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={mapStatusLabel(form.status)} onValueChange={(v)=>setForm((s:any)=>({...s,status:v.toLowerCase()}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(statusStyles).map((s)=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e)=>setForm((s:any)=>({...s,notes:e.target.value}))} /></div>
          {errors._general && <div className="md:col-span-2 text-destructive">{errors._general}</div>}
        </form>
        <DialogFooter>
          <Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy" disabled={creating || updating}>{(creating || updating) ? "Saving..." : (form?.id ? "Save Changes" : "Save Bike")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function mapStatusLabel(status: string) {
  if (!status) return "Available";
  switch (status.toLowerCase()) {
    case "available":
      return "Available";
    case "reserved":
      return "Reserved";
    case "sold":
      return "Sold";
    case "service":
      return "In Service";
    default:
      return status;
  }
}
