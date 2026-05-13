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
import { campaigns, formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/advertising")({
  component: () => <DashboardLayout><Advertising /></DashboardLayout>,
  head: () => ({ meta: [{ title: "Advertising — Motorbike CRM" }] }),
});

const platformIcon: Record<string, any> = {
  Facebook, Instagram, Google: Globe, TV: Tv, Radio, Billboard: ImageIcon,
};
const statusColor: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700", Paused: "bg-amber-100 text-amber-700", Completed: "bg-slate-200 text-slate-700",
};

function Stat({ label, value }: any) {
  return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}

function Advertising() {
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Ad Campaigns</h1>
        <CampaignModal />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Campaigns" value={campaigns.length} />
        <Stat label="Total Budget" value={formatKES(totalBudget)} />
        <Stat label="Total Spent" value={formatKES(totalSpent)} />
        <Stat label="Leads Generated" value={totalLeads} />
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Platform</TableHead><TableHead>Status</TableHead>
            <TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Leads</TableHead>
            <TableHead>Cost/Lead</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {campaigns.map(c => {
              const Icon = platformIcon[c.platform] || Globe;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell><span className="inline-flex items-center gap-1.5 text-sm"><Icon className="h-4 w-4 text-brand-orange" />{c.platform}</span></TableCell>
                  <TableCell><Badge className={statusColor[c.status]}>{c.status}</Badge></TableCell>
                  <TableCell>{formatKES(c.budget)}</TableCell>
                  <TableCell>{formatKES(c.spent)}</TableCell>
                  <TableCell className="font-semibold">{c.leads}</TableCell>
                  <TableCell>{c.leads ? formatKES(Math.round(c.spent / c.leads)) : "—"}</TableCell>
                  <TableCell className="text-right"><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

function CampaignModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2"><Label>Title</Label><Input /></div>
          <div className="space-y-1.5"><Label>Platform</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{Object.keys(platformIcon).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Budget</Label><Input type="number" /></div>
          <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" /></div>
          <div className="space-y-1.5"><Label>End Date</Label><Input type="date" /></div>
          <div className="space-y-1.5 col-span-2"><Label>Target Audience</Label><Input /></div>
          <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea rows={3} /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Launch</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
