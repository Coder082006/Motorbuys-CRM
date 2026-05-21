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
import { Plus, Send } from "lucide-react";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useSMSCampaigns, useCreateSMSCampaign, useSendSMSCampaign, usePromotions, useCreatePromotion, useDeletePromotion, useCustomers } from "../hooks/queries";

export const Route = createFileRoute("/marketing")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "marketing"]}>
      <DashboardLayout><Marketing /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Marketing - Motorbike CRM" }] }),
});

const smsColor: Record<string, string> = { sent: "bg-emerald-100 text-emerald-700", scheduled: "bg-sky-100 text-sky-700", draft: "bg-slate-200 text-slate-700" };
const promoColor: Record<string, string> = { active: "bg-emerald-100 text-emerald-700", upcoming: "bg-amber-100 text-amber-700", expired: "bg-slate-200 text-slate-700" };

function Marketing() {
  useAuthRedirect();
  const smsQ = useSMSCampaigns();
  const promosQ = usePromotions();
  const createSMS = useCreateSMSCampaign();
  const sendSMS = useSendSMSCampaign();
  const createPromo = useCreatePromotion();
  const deletePromo = useDeletePromotion();
  const customersQ = useCustomers();
  const [smsOpen, setSmsOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  const sms = smsQ.data || [];
  const promos = promosQ.data || [];

  function onSendNow(campaign:any) {
    if (!confirm(`Send SMS to ${campaign.recipient_count} recipients?`)) return;
    sendSMS.mutate(campaign.id);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
      <Tabs defaultValue="sms">
        <TabsList><TabsTrigger value="sms">SMS Campaigns</TabsTrigger><TabsTrigger value="promo">Promotions</TabsTrigger></TabsList>
        <TabsContent value="sms" className="space-y-4">
          <div className="flex justify-end"><SmsModal open={smsOpen} onOpenChange={setSmsOpen} creating={createSMS.isLoading} customers={customersQ.data} onCreate={(p:any)=>createSMS.mutate(p)} /></div>

          {smsQ.isLoading ? <Card className="p-6 animate-pulse" /> : smsQ.isError ? <Card className="p-6"><p>Failed to load SMS campaigns</p><div className="pt-2"><Button onClick={()=>smsQ.refetch()}>Retry</Button></div></Card> : sms.length === 0 ? <Card className="p-6 text-center"><p className="font-semibold">No SMS campaigns</p><div className="pt-4"><Button onClick={()=>setSmsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">New SMS Campaign</Button></div></Card> : (
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Recipients</TableHead><TableHead>Status</TableHead><TableHead>Sent At</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{sms.map((s:any) => <TableRow key={s.id}><TableCell className="font-medium">{s.title}</TableCell><TableCell>{s.recipient_count}</TableCell><TableCell><Badge className={smsColor[s.status]}>{s.status}</Badge></TableCell><TableCell className="text-muted-foreground">{s.sent_at}</TableCell><TableCell className="text-right"><Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy gap-1" onClick={()=>onSendNow(s)}><Send className="h-3 w-3" /> Send Now</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          )}
        </TabsContent>
        <TabsContent value="promo" className="space-y-4">
          <div className="flex justify-end"><PromotionModal open={promoOpen} onOpenChange={setPromoOpen} creating={createPromo.isLoading} onCreate={(p:any)=>createPromo.mutate(p)} /></div>

          {promosQ.isLoading ? <Card className="p-6 animate-pulse" /> : promosQ.isError ? <Card className="p-6"><p>Failed to load promotions</p><div className="pt-2"><Button onClick={()=>promosQ.refetch()}>Retry</Button></div></Card> : promos.length === 0 ? <Card className="p-6 text-center"><p className="font-semibold">No promotions</p><div className="pt-4"><Button onClick={()=>setPromoOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">New Promotion</Button></div></Card> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{promos.map((p:any) => <Card key={p.id} className="p-5 hover:shadow-md transition-shadow"><div className="flex items-start justify-between mb-2"><h3 className="font-semibold">{p.title}</h3><Badge className={promoColor[p.status] || "bg-slate-200"}>{p.status}</Badge></div><p className="text-2xl font-bold text-brand-orange">{p.discount_percentage ? `${p.discount_percentage}%` : (p.discount_amount ? formatKES(p.discount_amount) : "")}</p><p className="text-xs text-muted-foreground mt-2">{p.start_date} -> {p.end_date}</p></Card>)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SmsModal({ open, onOpenChange, creating, customers, onCreate }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>({ title: "", message: "", recipients: [] });
  const [errors, setErrors] = useState<Record<string,string>>({});

  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?: any) {
    e?.preventDefault();
    setErrors({});
    try {
      await onCreate(form);
      setIsOpen(false);
      onOpenChange?.(false);
    } catch (err:any) {
      setErrors({ _general: err?.message || 'Failed to create SMS campaign' });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogTrigger asChild><Button onClick={()=>setIsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New SMS Campaign</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New SMS Campaign</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e)=>setForm((s:any)=>({...s,title:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} placeholder="Hi {name}, ..." value={form.message} onChange={(e)=>setForm((s:any)=>({...s,message:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Recipients</Label><Select value={form.recipients.map(String)} onValueChange={(v:any)=>setForm((s:any)=>({...s,recipients:v.map(Number)}))} multiSelect>
            <SelectTrigger><SelectValue placeholder="Select recipients" /></SelectTrigger>
            <SelectContent>{customers?.map((c:any)=><SelectItem key={c.id} value={String(c.id)}>{c.first_name} {c.last_name} — {c.phone}</SelectItem>)}</SelectContent>
          </Select></div>
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromotionModal({ open, onOpenChange, creating, onCreate }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>({ title: "", description: "", discount_percentage: "", discount_amount: "", start_date: "", end_date: "", status: "active" });
  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?:any) {
    e?.preventDefault();
    try {
      await onCreate(form);
      setIsOpen(false);
      onOpenChange?.(false);
    } catch (err:any) {
      console.error(err);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogTrigger asChild><Button onClick={()=>setIsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New Promotion</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Promotion</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e)=>setForm((s:any)=>({...s,title:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e)=>setForm((s:any)=>({...s,description:e.target.value}))} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label>Start</Label><Input type="date" value={form.start_date} onChange={(e)=>setForm((s:any)=>({...s,start_date:e.target.value}))} /></div><div className="space-y-1.5"><Label>End</Label><Input type="date" value={form.end_date} onChange={(e)=>setForm((s:any)=>({...s,end_date:e.target.value}))} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label>Discount %</Label><Input type="number" value={form.discount_percentage} onChange={(e)=>setForm((s:any)=>({...s,discount_percentage:e.target.value}))} /></div><div className="space-y-1.5"><Label>Discount Amount</Label><Input type="number" value={form.discount_amount} onChange={(e)=>setForm((s:any)=>({...s,discount_amount:e.target.value}))} /></div></div>
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
