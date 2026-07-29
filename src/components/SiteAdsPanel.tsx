import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ImagePlus,
  MousePointerClick,
  Pencil,
  Plus,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { getResults } from "@/lib/api/client";
import { resolveAdImage, type SiteAd } from "@/lib/api/siteAds";
import {
  useBikes,
  useCreateSiteAd,
  useCustomers,
  useDeleteSiteAd,
  useSiteAds,
  useSiteAdSummary,
  useUpdateSiteAd,
} from "../hooks/queries";

const stateStyles: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-sky-100 text-sky-700",
  expired: "bg-slate-200 text-slate-600",
  paused: "bg-amber-100 text-amber-700",
  draft: "bg-slate-200 text-slate-700",
};

const stateLabels: Record<string, string> = {
  live: "Live on site",
  scheduled: "Scheduled",
  expired: "Expired",
  paused: "Paused",
  draft: "Draft",
};

/** Minimal shape of an inventory bike as used by the link picker. */
type BikeOption = {
  id: number;
  model_detail?: { brand: string; model_name: string } | null;
};

const audienceOptions = [
  { value: "everyone", label: "Everyone (including visitors not signed in)" },
  { value: "logged_in", label: "All signed-in customers" },
  { value: "specific", label: "Specific customers only" },
] as const;

const audienceLabels: Record<string, string> = {
  everyone: "Everyone",
  logged_in: "Signed-in customers",
  specific: "Specific customers",
};

/** Minimal shape of a CRM customer as used by the targeting list. */
type CustomerOption = {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
};

function customerLabel(customer: CustomerOption) {
  return (
    customer.full_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() ||
    `Customer #${customer.id}`
  );
}

type FormState = {
  id?: number;
  title: string;
  headline: string;
  headline_sw: string;
  body: string;
  body_sw: string;
  cta_text: string;
  cta_text_sw: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  link_bike: string;
  link_url: string;
  dismissible: boolean;
  audience: string;
  recipients: number[];
};

const emptyForm: FormState = {
  title: "",
  headline: "",
  headline_sw: "",
  body: "",
  body_sw: "",
  cta_text: "",
  cta_text_sw: "",
  status: "active",
  priority: "0",
  start_date: "",
  end_date: "",
  link_bike: "none",
  link_url: "",
  dismissible: true,
  audience: "everyone",
  recipients: [],
};

function formFromAd(ad: SiteAd): FormState {
  return {
    id: ad.id,
    title: ad.title ?? "",
    headline: ad.headline ?? "",
    headline_sw: ad.headline_sw ?? "",
    body: ad.body ?? "",
    body_sw: ad.body_sw ?? "",
    cta_text: ad.cta_text ?? "",
    cta_text_sw: ad.cta_text_sw ?? "",
    status: ad.status ?? "draft",
    priority: String(ad.priority ?? 0),
    start_date: ad.start_date ?? "",
    end_date: ad.end_date ?? "",
    link_bike: ad.link_bike ? String(ad.link_bike) : "none",
    link_url: ad.link_url ?? "",
    dismissible: ad.dismissible ?? true,
    audience: ad.audience ?? "everyone",
    recipients: ad.recipients ?? [],
  };
}

export function SiteAdsPanel() {
  const adsQuery = useSiteAds();
  const summaryQuery = useSiteAdSummary();
  const createAd = useCreateSiteAd();
  const updateAd = useUpdateSiteAd();
  const deleteAd = useDeleteSiteAd();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ads = getResults<SiteAd>(adsQuery.data);

  // Totals come from the server so they cover every advert, not just the
  // 20 records on the current page.
  const totals = summaryQuery.data;

  function openCreate() {
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl(null);
    setErrorMessage("");
    setIsOpen(true);
  }

  function openEdit(ad: SiteAd) {
    setForm(formFromAd(ad));
    setImageFile(null);
    setPreviewUrl(resolveAdImage(ad.image));
    setErrorMessage("");
    setIsOpen(true);
  }

  function onPickImage(file: File | null) {
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Give the advert an internal title.");
      return;
    }
    if (!form.id && !imageFile) {
      setErrorMessage("An advert image is required.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setErrorMessage("Set both a start and an end date.");
      return;
    }
    if (form.audience === "specific" && form.recipients.length === 0) {
      setErrorMessage("Select at least one customer, or change the audience.");
      return;
    }

    // Multipart because of the image upload - the api client detects FormData
    // and drops the JSON content-type header automatically.
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("headline", form.headline);
    payload.append("headline_sw", form.headline_sw);
    payload.append("body", form.body);
    payload.append("body_sw", form.body_sw);
    payload.append("cta_text", form.cta_text);
    payload.append("cta_text_sw", form.cta_text_sw);
    payload.append("placement", "bottom_right");
    payload.append("status", form.status);
    payload.append("priority", form.priority || "0");
    payload.append("start_date", form.start_date);
    payload.append("end_date", form.end_date);
    payload.append("link_url", form.link_url);
    payload.append("dismissible", String(form.dismissible));
    payload.append("audience", form.audience);
    // Repeat the key per id - that is how DRF reads a many-to-many from
    // multipart form data. For the other audiences we send nothing and let the
    // server clear the list, since an empty value is not a valid pk.
    if (form.audience === "specific") {
      form.recipients.forEach((id) => payload.append("recipients", String(id)));
    }
    if (form.link_bike && form.link_bike !== "none") {
      payload.append("link_bike", form.link_bike);
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (form.id) {
        await updateAd.mutateAsync({ id: form.id, data: payload });
      } else {
        await createAd.mutateAsync(payload);
      }
      setIsOpen(false);
      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save the advert.");
    }
  }

  function onDelete(ad: SiteAd) {
    if (!confirm(`Delete "${ad.title}"? It will stop showing on the shop immediately.`)) {
      return;
    }
    deleteAd.mutate(ad.id);
  }

  const isSaving = createAd.isPending || updateAd.isPending;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Storefront Adverts</h2>
          <p className="text-sm text-muted-foreground">
            These banners float in the bottom-right corner of the shop for customers.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
        >
          <Plus className="mr-1 h-4 w-4" /> New Advert
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Adverts" value={totals ? String(totals.total_ads) : "-"} />
        <Stat label="Live Now" value={totals ? String(totals.live_now) : "-"} />
        <Stat
          label="Impressions"
          value={totals ? totals.total_impressions.toLocaleString() : "-"}
        />
        <Stat label="Clicks" value={totals ? totals.total_clicks.toLocaleString() : "-"} />
      </div>

      {adsQuery.isLoading ? (
        <Card className="h-48 animate-pulse" />
      ) : adsQuery.isError ? (
        <Card className="p-6">
          <p className="font-semibold">Failed to load adverts</p>
          <div className="pt-3">
            <Button onClick={() => adsQuery.refetch()}>Retry</Button>
          </div>
        </Card>
      ) : ads.length === 0 ? (
        <Card className="p-10 text-center">
          <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-semibold">No storefront adverts yet</p>
          <p className="text-sm text-muted-foreground">
            Create one to promote an offer or a price cut on the shop.
          </p>
          <div className="pt-4">
            <Button
              onClick={openCreate}
              className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
            >
              New Advert
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => {
            const image = resolveAdImage(ad.image);
            return (
              <Card key={ad.id} className="overflow-hidden pt-0">
                {image ? (
                  <img src={image} alt={ad.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{ad.title}</p>
                      {ad.headline ? (
                        <p className="truncate text-sm text-muted-foreground">{ad.headline}</p>
                      ) : null}
                    </div>
                    <Badge className={stateStyles[ad.schedule_state] ?? stateStyles.draft}>
                      {stateLabels[ad.schedule_state] ?? ad.schedule_state}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {ad.impressions}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3.5 w-3.5" /> {ad.clicks}
                    </span>
                    <span>CTR {ad.click_through_rate}%</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {ad.start_date} &rarr; {ad.end_date}
                  </p>

                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {audienceLabels[ad.audience] ?? ad.audience}
                    {ad.audience === "specific" ? ` (${ad.recipient_count})` : ""}
                  </p>

                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(ad)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(ad)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SiteAdDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        form={form}
        setForm={setForm}
        previewUrl={previewUrl}
        onPickImage={onPickImage}
        fileInputRef={fileInputRef}
        onSubmit={submit}
        isSaving={isSaving}
        errorMessage={errorMessage}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SiteAdDialog({
  isOpen,
  onOpenChange,
  form,
  setForm,
  previewUrl,
  onPickImage,
  fileInputRef,
  onSubmit,
  isSaving,
  errorMessage,
}: {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  previewUrl: string | null;
  onPickImage: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (event: React.FormEvent) => void;
  isSaving: boolean;
  errorMessage: string;
}) {
  const bikesQuery = useBikes();
  const bikes = getResults<BikeOption>(bikesQuery.data);
  const customersQuery = useCustomers();
  const customers = getResults<CustomerOption>(customersQuery.data);
  const allSelected = customers.length > 0 && form.recipients.length === customers.length;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((state) => ({ ...state, [key]: value }));
  }

  function toggleRecipient(customerId: number) {
    setForm((state) => ({
      ...state,
      recipients: state.recipients.includes(customerId)
        ? state.recipients.filter((id) => id !== customerId)
        : [...state.recipients, customerId],
    }));
  }

  function toggleAllRecipients() {
    setForm((state) => ({
      ...state,
      recipients: allSelected ? [] : customers.map((customer) => customer.id),
    }));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Advert" : "New Storefront Advert"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full space-y-1.5">
            <Label>Advert image {form.id ? "(leave empty to keep current)" : "*"}</Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => onPickImage(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Landscape works best - it is shown about 320px wide.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-full space-y-1.5">
            <Label>Internal title *</Label>
            <Input
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="December price cut - Boxer 150"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Headline (English)</Label>
            <Input
              value={form.headline}
              onChange={(event) => set("headline", event.target.value)}
              placeholder="Save 400,000 TZS this week"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Headline (Swahili)</Label>
            <Input
              value={form.headline_sw}
              onChange={(event) => set("headline_sw", event.target.value)}
              placeholder="Okoa TZS 400,000 wiki hii"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Message (English)</Label>
            <Textarea
              rows={2}
              value={form.body}
              onChange={(event) => set("body", event.target.value)}
              placeholder="Limited stock on all 150cc commuters."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message (Swahili)</Label>
            <Textarea
              rows={2}
              value={form.body_sw}
              onChange={(event) => set("body_sw", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Button text (English)</Label>
            <Input
              value={form.cta_text}
              onChange={(event) => set("cta_text", event.target.value)}
              placeholder="Shop the offer"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Button text (Swahili)</Label>
            <Input
              value={form.cta_text_sw}
              onChange={(event) => set("cta_text_sw", event.target.value)}
              placeholder="Nunua sasa"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Links to bike</Label>
            <Select value={form.link_bike} onValueChange={(value) => set("link_bike", value)}>
              <SelectTrigger>
                <SelectValue placeholder="No bike" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No bike - use URL below</SelectItem>
                {bikes.map((bike) => (
                  <SelectItem key={bike.id} value={String(bike.id)}>
                    {bike.model_detail
                      ? `${bike.model_detail.brand} ${bike.model_detail.model_name}`
                      : `Bike #${bike.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Or link URL</Label>
            <Input
              value={form.link_url}
              onChange={(event) => set("link_url", event.target.value)}
              placeholder="/ or https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Start date *</Label>
            <Input
              type="date"
              value={form.start_date}
              onChange={(event) => set("start_date", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End date *</Label>
            <Input
              type="date"
              value={form.end_date}
              onChange={(event) => set("end_date", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => set("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active - show on shop</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Input
              type="number"
              min={0}
              value={form.priority}
              onChange={(event) => set("priority", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">Higher number shows first.</p>
          </div>

          <div className="col-span-full space-y-1.5">
            <Label>Who sees this advert</Label>
            <Select value={form.audience} onValueChange={(value) => set("audience", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.audience === "specific" && (
            <div className="col-span-full space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Choose customers</Label>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  <Users className="h-3.5 w-3.5" />
                  {form.recipients.length} selected
                </span>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                {customers.length ? (
                  <>
                    <button
                      type="button"
                      onClick={toggleAllRecipients}
                      className="mb-3 flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm font-semibold shadow-sm transition hover:border-brand-orange/70"
                    >
                      <span>{allSelected ? "Clear all customers" : "Select all customers"}</span>
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded border",
                          allSelected
                            ? "border-brand-orange bg-brand-orange text-brand-navy"
                            : "border-slate-300 bg-white",
                        ].join(" ")}
                      >
                        {allSelected ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </button>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {customers.map((customer) => (
                        <label
                          key={customer.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-orange-50"
                        >
                          <input
                            type="checkbox"
                            checked={form.recipients.includes(customer.id)}
                            onChange={() => toggleRecipient(customer.id)}
                            className="h-4 w-4 accent-brand-orange"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">
                              {customerLabel(customer)}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {customer.phone || customer.email || ""}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="rounded-lg bg-white p-3 text-sm text-muted-foreground">
                    No customers are available yet.
                  </p>
                )}
              </div>
            </div>
          )}

          <label className="col-span-full flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.dismissible}
              onChange={(event) => set("dismissible", event.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Customers can close this advert
          </label>

          {errorMessage ? (
            <p className="col-span-full text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSaving}
            className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
          >
            {isSaving ? "Saving..." : form.id ? "Save Changes" : "Publish Advert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SiteAdsPanel;
