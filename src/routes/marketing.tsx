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
import { smsCampaigns, promotions } from "@/lib/mock-data";

export const Route = createFileRoute("/marketing")({
  component: () => <DashboardLayout><Marketing /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Marketing — Motorbike CRM" }] }),
});

const smsColor: Record<string, string> = {
  Sent: "bg-emerald-100 text-emerald-700", Scheduled: "bg-sky-100 text-sky-700", Draft: "bg-slate-200 text-slate-700",
};
const promoColor: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700", Upcoming: "bg-amber-100 text-amber-700", Ended: "bg-slate-200 text-slate-700",
};

function Marketing() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
      <Tabs defaultValue="sms">
        <TabsList><TabsTrigger value="sms">SMS Campaigns</TabsTrigger><TabsTrigger value="promo">Promotions</TabsTrigger></TabsList>
        <TabsContent value="sms" className="space-y-4">
          <div className="flex justify-end"><SmsModal /></div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Recipients</TableHead><TableHead>Status</TableHead><TableHead>Sent At</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {smsCampaigns.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell>{s.recipients}</TableCell>
                    <TableCell><Badge className={smsColor[s.status]}>{s.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{s.sentAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy gap-1"><Send className="h-3 w-3" /> Send Now</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="promo" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New Promotion</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>New Promotion</DialogTitle></DialogHeader>
                <form className="space-y-4">
                  <div className="space-y-1.5"><Label>Title</Label><Input /></div>
                  <div className="space-y-1.5"><Label>Discount</Label><Input /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Start</Label><Input type="date" /></div>
                    <div className="space-y-1.5"><Label>End</Label><Input type="date" /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} /></div>
                </form>
                <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map(p => (
              <Card key={p.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{p.title}</h3>
                  <Badge className={promoColor[p.status] || "bg-slate-200"}>{p.status}</Badge>
                </div>
                <p className="text-2xl font-bold text-brand-orange">{p.discount}</p>
                <p className="text-xs text-muted-foreground mt-2">{p.start} → {p.end}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SmsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New SMS Campaign</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New SMS Campaign</DialogTitle></DialogHeader>
        <form className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input /></div>
          <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} placeholder="Hi {name}, …" /></div>
          <div className="space-y-1.5"><Label>Recipients (comma separated)</Label><Input placeholder="Active customers, Prospects…" /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Send</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
