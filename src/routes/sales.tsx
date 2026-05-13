import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Phone } from "lucide-react";
import { leads } from "@/lib/mock-data";

export const Route = createFileRoute("/sales")({
  component: () => <DashboardLayout><Sales /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Sales Pipeline — Motorbike CRM" }] }),
});

const stages = [
  { key: "Inquiry", emoji: "📥", color: "border-t-slate-400" },
  { key: "Showroom Visit", emoji: "🏪", color: "border-t-sky-400" },
  { key: "Test Ride", emoji: "🏍️", color: "border-t-indigo-400" },
  { key: "Negotiation", emoji: "🤝", color: "border-t-amber-400" },
  { key: "Closed Won", emoji: "✅", color: "border-t-emerald-500" },
  { key: "Closed Lost", emoji: "❌", color: "border-t-rose-500" },
] as const;

function Sales() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
        <LeadModal />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stages.map(s => {
          const items = (leads as any)[s.key] || [];
          return (
            <Card key={s.key} className={`p-3 border-t-4 ${s.color} bg-muted/30`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{s.emoji} {s.key}</h3>
                <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((l: any) => (
                  <div key={l.id} className="bg-card rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-medium text-sm">{l.customer}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{l.phone}</p>
                    <p className="text-xs mt-2">🏍️ {l.bike}</p>
                    <p className="text-xs text-brand-orange mt-1">@ {l.sales}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LeadModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
        <form className="space-y-4">
          <div className="space-y-1.5"><Label>Customer</Label><Input /></div>
          <div className="space-y-1.5"><Label>Bike Interested</Label><Input /></div>
          <div className="space-y-1.5"><Label>Stage</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{stages.map(s => <SelectItem key={s.key} value={s.key}>{s.key}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Assigned To</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent><SelectItem value="po">Peter Otieno</SelectItem><SelectItem value="ma">Mary Achieng</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Follow Up Date</Label><Input type="date" /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Add Lead</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
