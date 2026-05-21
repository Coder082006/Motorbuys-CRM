import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Facebook, Instagram, Tv, Radio, Globe, Image as ImageIcon, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from "../hooks/queries";

export const Route = createFileRoute("/advertising")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "advertising"]}>
      <DashboardLayout><Advertising /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Advertising - Motorbike CRM" }] }),
});

const platformIcon: Record<string, any> = { Facebook, Instagram, Google: Globe, TV: Tv, Radio, Billboard: ImageIcon };
const statusColor: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
};

function Stat({ label, value }: any) {
  return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}

function Advertising() {
  useAuthRedirect();
  const campaignsQ = useCampaigns();
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const remove = useDeleteCampaign();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const campaigns = campaignsQ.data || [];
  const totalBudget = campaigns.reduce((s:any, c:any) => s + Number(c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s:any, c:any) => s + Number(c.amount_spent || 0), 0);
  const totalLeads = campaigns.reduce((s:any, c:any) => s + Number(c.leads_generated || 0), 0);

  function onEdit(c:any) { setEditing(c); setOpen(true); }
  function onDelete(id:number) { if (!confirm("Delete this campaign?")) return; remove.mutate(id); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Ad Campaigns</h1>
        <CampaignModal open={open} onOpenChange={setOpen} creating={create.isLoading} updating={update.isLoading} onCreate={(p:any)=>create.mutate(p)} onUpdate={(id:any,p:any)=>update.mutate({id,data:p})} initialData={editing} onSaved={()=>{ setOpen(false); setEditing(null); campaignsQ.refetch(); }} />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Campaigns" value={campaigns.length} />
        <Stat label="Total Budget" value={formatCurrency(totalBudget)} />
        <Stat label="Total Spent" value={formatCurrency(totalSpent)} />
        <Stat label="Leads Generated" value={totalLeads} />
      </div>

      {campaignsQ.isLoading ? (
        <Card className="p-6 animate-pulse" />
      ) : campaignsQ.isError ? (
        <Card className="p-6"><p>Failed to load campaigns</p><div className="pt-2"><Button onClick={()=>campaignsQ.refetch()}>Retry</Button></div></Card>
      ) : campaigns.length === 0 ? (
        <Card className="p-6 text-center"><p className="font-semibold">No campaigns found</p><p className="text-sm text-muted-foreground">Create your first campaign to get started.</p><div className="pt-4"><Button onClick={()=>setOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">New Campaign</Button></div></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Cost/Lead</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c:any) => {
                  const Icon = platformIcon[c.platform] || Globe;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Icon className="h-4 w-4 text-brand-orange" />
                          {c.platform}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[c.status]}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(c.budget)}</TableCell>
                      <TableCell>{formatCurrency(c.amount_spent)}</TableCell>
                      <TableCell className="font-semibold">{c.leads_generated}</TableCell>
                      <TableCell>{c.leads_generated ? formatCurrency(Math.round(Number(c.amount_spent || 0) / Number(c.leads_generated || 1))) : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={()=>onEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={()=>onDelete(c.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )
    </div>
  );
}

function CampaignModal({ open, onOpenChange, creating, updating, onCreate, onUpdate, initialData, onSaved }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>(initialData || { title: "", platform: "facebook", status: "draft", budget: "", amount_spent: 0, start_date: "", end_date: "", target_audience: "", description: "", leads_generated: 0 });
  const [errors, setErrors] = useState<Record<string,string>>({});

  if (open !== undefined && open !== isOpen) setIsOpen(open);
  if (initialData && initialData.id && initialData.id !== form.id) setForm(initialData);

  function close() { setIsOpen(false); onOpenChange?.(false); setForm({ title: "", platform: "facebook", status: "draft", budget: "", amount_spent: 0, start_date: "", end_date: "", target_audience: "", description: "", leads_generated: 0 }); }

  async function submit(e?:any) {
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
    } catch (err:any) {
      setErrors({ _general: err?.message || 'Failed to save' });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogTrigger asChild><Button onClick={()=>setIsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{form.id ? 'Edit Campaign' : 'New Campaign'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e)=>setForm((s:any)=>({...s,title:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Platform</Label><Select value={form.platform} onValueChange={(v)=>setForm((s:any)=>({...s,platform:v}))}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{Object.keys(platformIcon).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Budget</Label><Input type="number" value={form.budget} onChange={(e)=>setForm((s:any)=>({...s,budget:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e)=>setForm((s:any)=>({...s,start_date:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e)=>setForm((s:any)=>({...s,end_date:e.target.value}))} /></div>
          <div className="space-y-1.5 col-span-2"><Label>Target Audience</Label><Input value={form.target_audience} onChange={(e)=>setForm((s:any)=>({...s,target_audience:e.target.value}))} /></div>
          <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e)=>setForm((s:any)=>({...s,description:e.target.value}))} /></div>
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy" disabled={creating || updating}>{(creating||updating) ? 'Saving...' : (form.id ? 'Save Changes' : 'Launch')}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
