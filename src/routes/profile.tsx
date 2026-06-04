import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChevronLeft, Loader2, LogOut, Mail, Phone, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import CustomerAvatar from "@/components/CustomerAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute, useAuth } from "../context/AuthContext";
import {
  getMyCustomerProfile,
  saveMyOnboarding,
  updateMyCustomerProfile,
  type CustomerProfile,
  type OnboardingPayload,
} from "../lib/api/shop";

export const Route = createFileRoute("/profile")({
  component: () => (
    <CustomerRoute>
      <CustomerProfilePage />
    </CustomerRoute>
  ),
  head: () => ({ meta: [{ title: "My Profile - Motorbuy" }] }),
});

type Language = "en" | "sw";

const copy = {
  en: {
    back: "Back to shop",
    title: "My Profile",
    subtitle: "Your Motorbuy account, profile photo, and motorbike preferences.",
    edit: "Edit Profile",
    save: "Save changes",
    cancel: "Cancel",
    saving: "Saving...",
    saved: "Profile updated successfully.",
    upload: "Upload profile picture",
    uploading: "Uploading...",
    personal: "Personal Info",
    picture: "Profile Picture",
    preferences: "Motorbike Preferences",
    discovery: "Discovery",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    altPhone: "Alt phone",
    region: "Region",
    district: "District",
    address: "Address",
    joined: "Date joined",
    useCase: "Main use",
    budget: "Budget range",
    brands: "Preferred brands",
    features: "Important features",
    experience: "Riding experience",
    preferredBike: "Preferred bike",
    notes: "Notes",
    heardFrom: "Heard about Motorbuy from",
    signOut: "Sign out",
    notProvided: "Not provided",
    failed: "Failed to load your profile.",
  },
  sw: {
    back: "Rudi dukani",
    title: "Wasifu Wangu",
    subtitle: "Akaunti yako ya Motorbuy, picha ya profile, na mapendeleo ya pikipiki.",
    edit: "Hariri Wasifu",
    save: "Hifadhi mabadiliko",
    cancel: "Ghairi",
    saving: "Inahifadhi...",
    saved: "Wasifu umebadilishwa kikamilifu.",
    upload: "Pakia picha ya profile",
    uploading: "Inapakia...",
    personal: "Taarifa Binafsi",
    picture: "Picha ya Profile",
    preferences: "Mapendeleo ya Pikipiki",
    discovery: "Ulitujulia Wapi",
    fullName: "Jina kamili",
    email: "Barua pepe",
    phone: "Simu",
    altPhone: "Simu mbadala",
    region: "Mkoa",
    district: "Wilaya",
    address: "Anuani",
    joined: "Tarehe ya kujiunga",
    useCase: "Matumizi makuu",
    budget: "Kiwango cha bajeti",
    brands: "Brand unazopendelea",
    features: "Vipengele muhimu",
    experience: "Uzoefu wa kuendesha",
    preferredBike: "Pikipiki unayopendelea",
    notes: "Maelezo",
    heardFrom: "Ulisikia Motorbuy kupitia",
    signOut: "Toka",
    notProvided: "Haijatolewa",
    failed: "Imeshindikana kupakia wasifu wako.",
  },
} as const;

function valueText(value: unknown, emptyText: string) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : emptyText;
  if (value === null || value === undefined || value === "") return emptyText;
  return String(value);
}

function dateText(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function initials(profile: CustomerProfile | null, fallbackName: string) {
  if (profile?.initials) return profile.initials;
  return fallbackName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type ProfileForm = {
  alt_phone: string;
  region: string;
  district: string;
  address: string;
  preferred_bike_type: string;
  notes: string;
  use_case: string;
  budget_range: string;
  preferred_brands: string;
  preferred_features: string;
  riding_experience: string;
  heard_from: string;
};

function editableForm(profile: CustomerProfile | null): ProfileForm {
  return {
    alt_phone: profile?.alt_phone ?? "",
    region: profile?.region ?? "",
    district: profile?.district ?? "",
    address: profile?.address ?? "",
    preferred_bike_type: profile?.preferred_bike_type ?? "",
    notes: profile?.notes ?? "",
    use_case: profile?.use_case ?? "",
    budget_range: profile?.budget_range ?? "",
    preferred_brands: Array.isArray(profile?.preferred_brands)
      ? profile.preferred_brands.join(", ")
      : profile?.preferred_brands ?? "",
    preferred_features: Array.isArray(profile?.preferred_features)
      ? profile.preferred_features.join(", ")
      : "",
    riding_experience: profile?.riding_experience ?? "",
    heard_from: profile?.heard_from ?? "",
  };
}

function CustomerProfilePage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<Language>("en");
  const [uploadError, setUploadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(() => editableForm(null));
  const [editError, setEditError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const text = copy[language];

  const profileQ = useQuery({
    queryKey: ["shop", "profile"],
    queryFn: getMyCustomerProfile,
  });

  const uploadPhoto = useMutation({
    mutationFn: updateMyCustomerProfile,
    onSuccess: async () => {
      setUploadError("");
      await queryClient.invalidateQueries({ queryKey: ["shop", "profile"] });
    },
    onError: (error: Error) => {
      setUploadError(error.message || "Upload failed");
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (currentForm: ProfileForm) => {
      const contactPayload = new FormData();
      contactPayload.append("alt_phone", currentForm.alt_phone);
      contactPayload.append("region", currentForm.region);
      contactPayload.append("district", currentForm.district);
      contactPayload.append("address", currentForm.address);
      contactPayload.append("preferred_bike_type", currentForm.preferred_bike_type);
      contactPayload.append("notes", currentForm.notes);

      await updateMyCustomerProfile(contactPayload);

      const onboardingPayload: OnboardingPayload = {
        onboarding_completed: true,
        onboarding_skipped: false,
        alt_phone: currentForm.alt_phone,
        region: currentForm.region,
        district: currentForm.district,
        address: currentForm.address,
        preferred_bike_type: currentForm.preferred_bike_type,
        notes: currentForm.notes,
        use_case: currentForm.use_case,
        budget_range: currentForm.budget_range,
        preferred_brands: currentForm.preferred_brands,
        preferred_features: currentForm.preferred_features
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean),
        riding_experience: currentForm.riding_experience,
        heard_from: currentForm.heard_from,
      };

      return saveMyOnboarding(onboardingPayload);
    },
    onSuccess: async () => {
      setEditError("");
      setSavedMessage(text.saved);
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["shop", "profile"] });
    },
    onError: (error: Error) => {
      setSavedMessage("");
      setEditError(error.message || "Could not update profile.");
    },
  });

  const profile = profileQ.data ?? null;
  const displayName = profile?.full_name || profile?.name || auth.user?.name || "Motorbuy Customer";
  const joined = dateText(profile?.date_joined || profile?.created_at);
  const profileInitials = useMemo(
    () => initials(profile, displayName),
    [displayName, profile],
  );

  function startEditing() {
    setForm(editableForm(profile));
    setEditError("");
    setSavedMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setForm(editableForm(profile));
    setEditError("");
    setIsEditing(false);
  }

  function updateForm(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfile.mutate(form);
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_picture", file);
    uploadPhoto.mutate(formData);
  }

  if (profileQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ec]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (profileQ.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ec] p-4">
        <Card className="max-w-md p-6 text-center">
          <p className="font-semibold">{text.failed}</p>
          <Button asChild className="mt-4 rounded-full bg-brand-orange text-white">
            <Link to="/">Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" />
              {text.back}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setLanguage((current) => (current === "en" ? "sw" : "en"))}
            >
              {language === "en" ? "Swahili" : "English"}
            </Button>
            <Button
              className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
              onClick={auth.logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {text.signOut}
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-slate-950 via-slate-800 to-orange-500" />
          <div className="p-5 sm:p-7">
            <div className="-mt-16 flex flex-col gap-5 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="rounded-full bg-white p-1.5 shadow-md ring-1 ring-orange-100">
                  <CustomerAvatar
                    profilePicture={profile?.profile_picture ?? null}
                    hasPhoto={profile?.has_photo}
                    initials={profileInitials || "MC"}
                    avatarColor={profile?.avatar_color}
                    size="xl"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black">{displayName}</h1>
                  <p className="mt-1 max-w-xl text-sm text-slate-600">{text.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ProfileChip icon={Mail} value={profile?.email || auth.user?.email} />
                    <ProfileChip icon={Phone} value={profile?.phone || auth.user?.phone} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
                  onClick={startEditing}
                >
                  {text.edit}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={auth.logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {text.signOut}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {savedMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {savedMessage}
          </div>
        ) : null}

        {isEditing ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{text.edit}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSave}>
                <div className="grid gap-4 md:grid-cols-2">
                  <EditField
                    label={text.altPhone}
                    value={form.alt_phone}
                    onChange={(value) => updateForm("alt_phone", value)}
                  />
                  <EditField
                    label={text.region}
                    value={form.region}
                    onChange={(value) => updateForm("region", value)}
                  />
                  <EditField
                    label={text.district}
                    value={form.district}
                    onChange={(value) => updateForm("district", value)}
                  />
                  <EditField
                    label={text.address}
                    value={form.address}
                    onChange={(value) => updateForm("address", value)}
                  />
                  <EditField
                    label={text.useCase}
                    value={form.use_case}
                    onChange={(value) => updateForm("use_case", value)}
                  />
                  <EditField
                    label={text.budget}
                    value={form.budget_range}
                    onChange={(value) => updateForm("budget_range", value)}
                  />
                  <EditField
                    label={text.brands}
                    value={form.preferred_brands}
                    onChange={(value) => updateForm("preferred_brands", value)}
                  />
                  <EditField
                    label={text.features}
                    value={form.preferred_features}
                    onChange={(value) => updateForm("preferred_features", value)}
                  />
                  <EditField
                    label={text.experience}
                    value={form.riding_experience}
                    onChange={(value) => updateForm("riding_experience", value)}
                  />
                  <EditField
                    label={text.preferredBike}
                    value={form.preferred_bike_type}
                    onChange={(value) => updateForm("preferred_bike_type", value)}
                  />
                  <EditField
                    label={text.heardFrom}
                    value={form.heard_from}
                    onChange={(value) => updateForm("heard_from", value)}
                  />
                  <EditField
                    label={text.notes}
                    value={form.notes}
                    onChange={(value) => updateForm("notes", value)}
                  />
                </div>

                {editError ? <p className="text-sm font-semibold text-destructive">{editError}</p> : null}

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={saveProfile.isPending}
                    onClick={cancelEditing}
                  >
                    {text.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
                    disabled={saveProfile.isPending}
                  >
                    {saveProfile.isPending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {text.saving}
                      </span>
                    ) : (
                      text.save
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{text.picture}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label
                htmlFor="profile-picture"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-orange-50 px-4 py-8 text-sm font-semibold text-brand-orange"
              >
                {uploadPhoto.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {uploadPhoto.isPending ? text.uploading : text.upload}
              </Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{text.personal}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Info label={text.fullName} value={displayName} empty={text.notProvided} />
              <Info label={text.email} value={profile?.email || auth.user?.email} empty={text.notProvided} />
              <Info label={text.phone} value={profile?.phone || auth.user?.phone} empty={text.notProvided} />
              <Info label={text.altPhone} value={profile?.alt_phone} empty={text.notProvided} />
              <Info label={text.joined} value={joined} empty={text.notProvided} />
              <Info label={text.region} value={profile?.region} empty={text.notProvided} />
              <Info label={text.district} value={profile?.district} empty={text.notProvided} />
              <Info label={text.address} value={profile?.address} empty={text.notProvided} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{text.preferences}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Info label={text.useCase} value={profile?.use_case} empty={text.notProvided} />
              <Info label={text.budget} value={profile?.budget_range} empty={text.notProvided} />
              <Info label={text.brands} value={profile?.preferred_brands} empty={text.notProvided} />
              <Info label={text.features} value={profile?.preferred_features} empty={text.notProvided} />
              <Info label={text.experience} value={profile?.riding_experience} empty={text.notProvided} />
              <Info label={text.preferredBike} value={profile?.preferred_bike_type} empty={text.notProvided} />
              <Info label={text.notes} value={profile?.notes} empty={text.notProvided} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{text.discovery}</CardTitle>
            </CardHeader>
            <CardContent>
              <Info label={text.heardFrom} value={profile?.heard_from} empty={text.notProvided} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileChip({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-medium">
      <Icon className="h-4 w-4 text-brand-orange" />
      {value}
    </span>
  );
}

function Info({ label, value, empty }: { label: string; value: unknown; empty: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">
        {valueText(value, empty)}
      </p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl"
      />
    </div>
  );
}
