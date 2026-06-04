import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bike, Check, ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute } from "../context/AuthContext";
import { saveMyOnboarding, type OnboardingPayload } from "../lib/api/shop";

export const Route = createFileRoute("/onboarding")({
  component: () => (
    <CustomerRoute>
      <OnboardingPage />
    </CustomerRoute>
  ),
  head: () => ({ meta: [{ title: "Customer Onboarding - Motorbuy" }] }),
});

type Language = "en" | "sw";

const useCases = [
  "Personal transport",
  "Delivery business",
  "Bodaboda/business transport",
  "Long-distance travel",
  "Other",
] as const;

const budgets = [
  "Under 2 Million TZS",
  "2M - 4M TZS",
  "4M - 6M TZS",
  "Above 6M TZS",
] as const;

const features = [
  "Fuel efficiency",
  "Speed",
  "Comfort",
  "Durability",
  "Easy maintenance",
  "Storage space",
] as const;

const experience = ["Beginner", "Intermediate", "Experienced"] as const;

const heardFrom = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "Friend/Referral",
  "Google Search",
  "Advertisement",
  "Other",
] as const;

const text = {
  en: {
    eyebrow: "Customer setup",
    title: "Tell us what kind of motorbike fits you",
    subtitle:
      "This helps Motorbuy recommend better bikes and gives the CRM team clearer customer preferences.",
    q1: "What will you mainly use the motorbike for?",
    q2: "What is your budget range?",
    q3: "Which motorbike brands do you prefer?",
    q3Placeholder: "Example: Honda, Yamaha, TVS",
    q4: "What features matter most to you?",
    q5: "How experienced are you with riding motorbikes?",
    q6: "Where have you heard about MOTORBUY?",
    contactTitle: "Contact and delivery details",
    altPhone: "Alternative phone number",
    region: "Region",
    district: "District",
    address: "Address",
    preferredBike: "Preferred bike type or model",
    notes: "Notes or special request",
    optional: "Optional, but useful for delivery and CRM follow-up.",
    submit: "Save preferences",
    skip: "Skip for now",
    saving: "Saving...",
    back: "Back to shop",
    required: "Please answer the required questions or choose skip for now.",
  },
  sw: {
    eyebrow: "Usajili wa mteja",
    title: "Tuambie pikipiki gani inakufaa",
    subtitle:
      "Hii inasaidia Motorbuy kupendekeza pikipiki bora na timu ya CRM kuelewa mapendeleo yako.",
    q1: "Utatumia pikipiki zaidi kwa nini?",
    q2: "Bajeti yako iko kwenye kiwango gani?",
    q3: "Unapendelea brand gani za pikipiki?",
    q3Placeholder: "Mfano: Honda, Yamaha, TVS",
    q4: "Vipengele gani ni muhimu zaidi kwako?",
    q5: "Una uzoefu gani wa kuendesha pikipiki?",
    q6: "Ulisikia MOTORBUY kupitia wapi?",
    contactTitle: "Mawasiliano na eneo la delivery",
    altPhone: "Namba nyingine ya simu",
    region: "Mkoa",
    district: "Wilaya",
    address: "Anuani",
    preferredBike: "Aina au model ya pikipiki unayopendelea",
    notes: "Maelezo au ombi maalum",
    optional: "Si lazima, lakini inasaidia delivery na ufuatiliaji wa CRM.",
    submit: "Hifadhi mapendeleo",
    skip: "Ruka kwa sasa",
    saving: "Inahifadhi...",
    back: "Rudi dukani",
    required: "Tafadhali jibu maswali muhimu au chagua kuruka kwa sasa.",
  },
} as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("en");
  const [useCase, setUseCase] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [preferredBrands, setPreferredBrands] = useState("");
  const [preferredFeatures, setPreferredFeatures] = useState<string[]>([]);
  const [ridingExperience, setRidingExperience] = useState("");
  const [heard, setHeard] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [preferredBike, setPreferredBike] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const copy = text[language];

  const save = useMutation({
    mutationFn: saveMyOnboarding,
    onSuccess: (profile) => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("customer", JSON.stringify(profile));
        const next = window.sessionStorage.getItem("post_onboarding_next");
        window.sessionStorage.removeItem("post_onboarding_next");
        window.location.href = next || "/";
        return;
      }
      void navigate({ to: "/" });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to save onboarding");
    },
  });

  function toggleFeature(feature: string) {
    setPreferredFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  }

  function payload(skipped = false): OnboardingPayload {
    if (skipped) {
      return {
        onboarding_completed: true,
        onboarding_skipped: true,
      };
    }

    return {
      onboarding_completed: true,
      onboarding_skipped: false,
      use_case: useCase,
      budget_range: budgetRange,
      preferred_brands: preferredBrands,
      preferred_features: preferredFeatures,
      riding_experience: ridingExperience,
      heard_from: heard,
      alt_phone: altPhone,
      region,
      district,
      address,
      preferred_bike_type: preferredBike,
      notes,
    };
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!useCase || !budgetRange || !ridingExperience || !heard) {
      setErrorMessage(copy.required);
      return;
    }

    save.mutate(payload(false));
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="gap-2" onClick={() => navigate({ to: "/" })}>
            <ChevronLeft className="h-4 w-4" />
            {copy.back}
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setLanguage((current) => (current === "en" ? "sw" : "en"))}
          >
            {language === "en" ? "Swahili" : "English"}
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-orange-500 p-8 text-white">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Bike className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-orange-200">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">{copy.subtitle}</p>
          </div>

          <form onSubmit={submit} className="grid gap-8 p-5 sm:p-8">
            <Question title={copy.q1}>
              <ChoiceGrid options={useCases} value={useCase} onChange={setUseCase} />
            </Question>

            <Question title={copy.q2}>
              <ChoiceGrid options={budgets} value={budgetRange} onChange={setBudgetRange} />
            </Question>

            <Question title={copy.q3}>
              <Label htmlFor="preferred-brands" className="sr-only">
                {copy.q3}
              </Label>
              <Input
                id="preferred-brands"
                value={preferredBrands}
                onChange={(event) => setPreferredBrands(event.target.value)}
                placeholder={copy.q3Placeholder}
              />
            </Question>

            <Question title={copy.q4}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => {
                  const selected = preferredFeatures.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-orange-300 bg-orange-50 text-brand-orange"
                          : "bg-white hover:border-orange-200"
                      }`}
                      onClick={() => toggleFeature(feature)}
                    >
                      {feature}
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </button>
                  );
                })}
              </div>
            </Question>

            <Question title={copy.q5}>
              <ChoiceGrid options={experience} value={ridingExperience} onChange={setRidingExperience} />
            </Question>

            <Question title={copy.q6}>
              <ChoiceGrid options={heardFrom} value={heard} onChange={setHeard} />
            </Question>

            <Question title={copy.contactTitle} description={copy.optional}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.altPhone} value={altPhone} onChange={setAltPhone} />
                <Field label={copy.region} value={region} onChange={setRegion} />
                <Field label={copy.district} value={district} onChange={setDistrict} />
                <Field label={copy.preferredBike} value={preferredBike} onChange={setPreferredBike} />
                <Field label={copy.address} value={address} onChange={setAddress} wide />
                <Field label={copy.notes} value={notes} onChange={setNotes} wide />
              </div>
            </Question>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={save.isPending}
                className="rounded-full"
                onClick={() => save.mutate(payload(true))}
              >
                {copy.skip}
              </Button>
              <Button
                type="submit"
                disabled={save.isPending}
                className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
              >
                {save.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.saving}
                  </span>
                ) : (
                  copy.submit
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Question({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-black">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              selected
                ? "border-orange-300 bg-orange-50 text-brand-orange"
                : "bg-white hover:border-orange-200"
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
