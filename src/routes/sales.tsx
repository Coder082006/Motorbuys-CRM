import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Phone } from "lucide-react";
import { getResults } from "@/lib/api/client";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useSales,
  useCreateSale,
  useBikes,
  useUsers,
  useCustomers,
} from "../hooks/queries";

export const Route = createFileRoute("/sales")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "sales"]}>
      <DashboardLayout>
        <Sales />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Sales Pipeline - Motorbike CRM" }] }),
});

const stages = [
  { key: "Inquiry", emoji: "In", color: "border-t-slate-400", api: "inquiry" },
  { key: "Showroom Visit", emoji: "Sv", color: "border-t-sky-400", api: "showroom_visit" },
  { key: "Test Ride", emoji: "Tr", color: "border-t-indigo-400", api: "test_ride" },
  { key: "Negotiation", emoji: "Ng", color: "border-t-amber-400", api: "negotiation" },
  { key: "Closed Won", emoji: "Ok", color: "border-t-emerald-500", api: "closed_won" },
  { key: "Closed Lost", emoji: "No", color: "border-t-rose-500", api: "closed_lost" },
] as const;

function Sales() {
  useAuthRedirect();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const leadsQ = useLeads();
  const salesQ = useSales();
  const bikesQ = useBikes("?status=available");
  const usersQ = useUsers();
  const customersQ = useCustomers();
  const update = useUpdateLead();
  const remove = useDeleteLead();
  const leads = getResults<any>(leadsQ.data);
  const sales = getResults<any>(salesQ.data);

  const isLoading = leadsQ.isLoading || salesQ.isLoading;
  const isError = leadsQ.isError;

  function moveLead(lead: any, apiStage: string) {
    update.mutate({ id: lead.id, data: { stage: apiStage } });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
        <LeadModal
          open={showLeadModal}
          onOpenChange={setShowLeadModal}
          customers={getResults<any>(customersQ.data)}
          bikes={getResults<any>(bikesQ.data)}
          users={getResults<any>(usersQ.data)}
          onCreate={() => {
            leadsQ.refetch();
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((s) => (
            <Card key={s.key} className={`p-3 border-t-4 ${s.color} bg-muted/30 animate-pulse`} />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6">
          <div className="space-y-2">
            <p className="font-semibold">Failed to load leads</p>
            <div className="pt-2">
              <Button onClick={() => leadsQ.refetch()}>Retry</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((s) => {
            const items = leads.filter((l: any) => l.stage === s.api);
            return (
              <Card key={s.key} className={`p-3 border-t-4 ${s.color} bg-muted/30`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">
                    {s.emoji} {s.key}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((l: any) => (
                    <div
                      key={l.id}
                      className="bg-card rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{l.customer_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {l.customer_phone}
                          </p>
                          <p className="text-xs mt-2">
                            {l.bike_interested_name || l.bike_interested}
                          </p>
                          <p className="text-xs text-brand-orange mt-1">
                            {l.assigned_to_name || "Unassigned"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div>
                            <Select value={l.stage} onValueChange={(v) => moveLead(l, v)}>
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map((st) => (
                                  <SelectItem key={st.api} value={st.api}>
                                    {st.key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {l.follow_up_date && new Date(l.follow_up_date) < new Date() ? (
                              <span className="text-rose-600">Follow up overdue</span>
                            ) : (
                              l.follow_up_date || ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="pt-6">
        <h2 className="text-lg font-semibold">Sales</h2>
        {salesQ.isLoading ? (
          <Card className="p-4 animate-pulse" />
        ) : salesQ.isError ? (
          <Card className="p-4">
            <p>Failed to load sales</p>
          </Card>
        ) : (
          <Card className="mt-3">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th>Customer</th>
                    <th>Bike</th>
                    <th>Price</th>
                    <th>Payment Method</th>
                    <th>Salesperson</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s: any) => (
                    <tr key={s.id}>
                      <td className="py-2">{s.customer_name}</td>
                      <td>{s.motorbike_name || s.motorbike}</td>
                      <td className="font-semibold">{s.sale_price}</td>
                      <td className="text-muted-foreground">{s.payment_method}</td>
                      <td>{s.salesperson_name}</td>
                      <td className="text-muted-foreground">{s.sale_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function LeadModal({ open, onOpenChange, customers, bikes, users, onCreate }: any) {
  const create = useCreateLead();
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>({
    customer: "",
    bike_interested: "",
    stage: "inquiry",
    assigned_to: "",
    follow_up_date: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?: any) {
    e?.preventDefault();
    setErrors({});
    try {
      await create.mutateAsync(form);
      setIsOpen(false);
      onOpenChange?.(false);
      onCreate?.();
    } catch (err: any) {
      setErrors({ _general: err?.message || "Failed to create lead" });
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        setIsOpen(v);
        onOpenChange?.(v);
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select
              value={String(form.customer)}
              onValueChange={(v) => setForm((s: any) => ({ ...s, customer: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.first_name} {c.last_name} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Bike Interested</Label>
            <Select
              value={String(form.bike_interested)}
              onValueChange={(v) => setForm((s: any) => ({ ...s, bike_interested: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bike" />
              </SelectTrigger>
              <SelectContent>
                {bikes?.map((b: any) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.model_detail?.brand} {b.model_detail?.model_name} — {b.chassis_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm((s: any) => ({ ...s, stage: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.api} value={s.api}>
                    {s.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select
              value={String(form.assigned_to)}
              onValueChange={(v) => setForm((s: any) => ({ ...s, assigned_to: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {users?.map((u: any) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.first_name} {u.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Follow Up Date</Label>
            <Input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((s: any) => ({ ...s, follow_up_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            onClick={submit}
            className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"
          >
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
