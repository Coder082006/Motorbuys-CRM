import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getResults } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils/formatters";
import { Plus, Send } from "lucide-react";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useCreatePromotion,
  useCreateSMSCampaign,
  useCustomers,
  useDeletePromotion,
  usePromotions,
  useSMSCampaigns,
  useSendSMSCampaign,
} from "../hooks/queries";

export const Route = createFileRoute("/marketing")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "marketing"]}>
      <DashboardLayout>
        <Marketing />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Marketing - Motorbike CRM" }] }),
});

const smsColor: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  scheduled: "bg-sky-100 text-sky-700",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

const promoColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-amber-100 text-amber-700",
  expired: "bg-slate-200 text-slate-700",
};

function Marketing() {
  useAuthRedirect();

  const smsQ = useSMSCampaigns();
  const promosQ = usePromotions();
  const customersQ = useCustomers();
  const createSMS = useCreateSMSCampaign();
  const sendSMS = useSendSMSCampaign();
  const createPromo = useCreatePromotion();
  const deletePromo = useDeletePromotion();
  const [smsOpen, setSmsOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  const sms = getResults<any>(smsQ.data);
  const promos = getResults<any>(promosQ.data);
  const customers = getResults<any>(customersQ.data);

  function onSendNow(campaign: any) {
    if (!confirm(`Send SMS to ${campaign.recipient_count ?? 0} recipients?`)) return;
    sendSMS.mutate(campaign.id);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Manage SMS campaigns and customer promotions.
        </p>
      </div>

      <Tabs defaultValue="sms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sms">SMS Campaigns</TabsTrigger>
          <TabsTrigger value="promo">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-4">
          <div className="flex justify-end">
            <SmsModal
              open={smsOpen}
              onOpenChange={setSmsOpen}
              creating={createSMS.isPending}
              customers={customers}
              onCreate={(payload: Record<string, unknown>) => createSMS.mutateAsync(payload)}
            />
          </div>

          {smsQ.isLoading ? (
            <Card className="h-48 animate-pulse" />
          ) : smsQ.isError ? (
            <ErrorCard message="Failed to load SMS campaigns" onRetry={() => smsQ.refetch()} />
          ) : sms.length === 0 ? (
            <EmptyState
              title="No SMS campaigns"
              action="New SMS Campaign"
              onAction={() => setSmsOpen(true)}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sms.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.title}</TableCell>
                        <TableCell>{campaign.recipient_count ?? campaign.recipients?.length ?? 0}</TableCell>
                        <TableCell>
                          <Badge className={smsColor[campaign.status] ?? smsColor.draft}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {campaign.sent_at ?? "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="gap-1 bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                            onClick={() => onSendNow(campaign)}
                          >
                            <Send className="h-3 w-3" /> Send Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promo" className="space-y-4">
          <div className="flex justify-end">
            <PromotionModal
              open={promoOpen}
              onOpenChange={setPromoOpen}
              creating={createPromo.isPending}
              onCreate={(payload: Record<string, unknown>) => createPromo.mutateAsync(payload)}
            />
          </div>

          {promosQ.isLoading ? (
            <Card className="h-48 animate-pulse" />
          ) : promosQ.isError ? (
            <ErrorCard message="Failed to load promotions" onRetry={() => promosQ.refetch()} />
          ) : promos.length === 0 ? (
            <EmptyState
              title="No promotions"
              action="New Promotion"
              onAction={() => setPromoOpen(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((promo: any) => (
                <Card key={promo.id} className="p-5 transition-shadow hover:shadow-md">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{promo.title}</h3>
                    <Badge className={promoColor[promo.status] ?? "bg-slate-200"}>
                      {promo.status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-brand-orange">
                    {promo.discount_percentage
                      ? `${promo.discount_percentage}%`
                      : promo.discount_amount
                        ? formatCurrency(promo.discount_amount)
                        : "Offer"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {promo.start_date} to {promo.end_date}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete promotion?")) deletePromo.mutate(promo.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-6">
      <p className="font-semibold">{message}</p>
      <div className="pt-2">
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </Card>
  );
}

function EmptyState({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <Card className="p-6 text-center">
      <p className="font-semibold">{title}</p>
      <div className="pt-4">
        <Button onClick={onAction} className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
          {action}
        </Button>
      </div>
    </Card>
  );
}

function SmsModal({
  open,
  onOpenChange,
  creating,
  customers,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creating: boolean;
  customers: any[];
  onCreate: (payload: Record<string, unknown>) => Promise<unknown>;
}) {
  const [form, setForm] = useState({ title: "", message: "", recipients: [] as number[] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setErrors({});

    if (!form.title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    if (!form.message.trim()) {
      setErrors({ message: "Message is required" });
      return;
    }

    try {
      await onCreate({ ...form, status: "draft" });
      setForm({ title: "", message: "", recipients: [] });
      onOpenChange(false);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Failed to create SMS campaign" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
          <Plus className="mr-1 h-4 w-4" /> New SMS Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New SMS Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              rows={4}
              placeholder="Hi {name}, ..."
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
            />
            {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Recipient</Label>
            <Select
              value={form.recipients[0] ? String(form.recipients[0]) : undefined}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, recipients: [Number(value)] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {customers.length ? (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.first_name} {customer.last_name} - {customer.phone}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No customers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        </form>
        <DialogFooter>
          <Button
            onClick={() => void submit()}
            disabled={creating}
            className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromotionModal({
  open,
  onOpenChange,
  creating,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creating: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<unknown>;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_percentage: "",
    discount_amount: "",
    start_date: "",
    end_date: "",
    status: "active",
  });
  const [error, setError] = useState("");

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");

    try {
      await onCreate(form);
      setForm({
        title: "",
        description: "",
        discount_percentage: "",
        discount_amount: "",
        start_date: "",
        end_date: "",
        status: "active",
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create promotion");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
          <Plus className="mr-1 h-4 w-4" /> New Promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Promotion</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, start_date: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, end_date: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Discount %</Label>
              <Input
                type="number"
                value={form.discount_percentage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discount_percentage: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Amount</Label>
              <Input
                type="number"
                value={form.discount_amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, discount_amount: event.target.value }))
                }
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
        <DialogFooter>
          <Button
            onClick={() => void submit()}
            disabled={creating}
            className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
          >
            {creating ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
