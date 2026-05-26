import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Gauge,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/lib/api/client";
import { getShopProducts, type MotorbikeProduct } from "@/lib/api/shop";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuth } from "../context/AuthContext";
import heroBackground from "../../bike2.jpg";

export const Route = createFileRoute("/")({
  component: ShopHomePage,
  head: () => ({
    meta: [
      { title: "Motorbuy - Premium Motorbike Marketplace" },
      {
        name: "description",
        content:
          "Browse premium motorbikes, compare trusted inventory, and purchase online through Motorbuy.",
      },
    ],
  }),
});

type DisplayProduct = MotorbikeProduct & {
  isDemo?: boolean;
};

type ProductShelf = {
  title: string;
  subtitle: string;
  products: DisplayProduct[];
};

type Language = "en" | "sw";

const uiText = {
  en: {
    admin: "Admin",
    myOrders: "My Orders",
    signOut: "Sign out",
    login: "Login",
    register: "Register",
    featuredEyebrow: "Featured bikes",
    featuredTitle: "Available motorbikes",
    featuredText:
      "Check the bikes we have, compare the details, and choose the one that fits your needs.",
    loadError: "Failed to load motorbikes. Make sure the backend is running.",
    noResults: "No matching motorbikes found.",
    footerText:
      "Motorbike shop connected to dealership operations, customer orders, and inventory visibility.",
    contact: "Contact",
    company: "Company",
    inventory: "Inventory",
    payments: "Payments",
    delivery: "Delivery",
  },
  sw: {
    admin: "Msimamizi",
    myOrders: "Oda Zangu",
    signOut: "Toka",
    login: "Ingia",
    register: "Jisajili",
    featuredEyebrow: "Pikipiki zilizopo",
    featuredTitle: "Pikipiki zinazopatikana",
    featuredText:
      "Angalia pikipiki tulizonazo, linganisha maelezo, kisha chagua inayofaa matumizi yako.",
    loadError: "Imeshindikana kupakia pikipiki. Hakikisha backend inaendelea kufanya kazi.",
    noResults: "Hakuna pikipiki inayolingana na ulichotafuta.",
    footerText:
      "Duka la pikipiki lililounganishwa na shughuli za biashara, oda za wateja, na taarifa za stoo.",
    contact: "Mawasiliano",
    company: "Kampuni",
    inventory: "Stoo",
    payments: "Malipo",
    delivery: "Usafirishaji",
  },
};

const shelfTranslations: Record<string, { en: string; sw: string }> = {
  "Automatic favorites": { en: "Automatic favorites", sw: "Pikipiki za automatic" },
  "Semi-automatic picks": { en: "Semi-automatic picks", sw: "Pikipiki za semi-automatic" },
  "Manual performance": { en: "Manual performance", sw: "Pikipiki za manual" },
  "Featured bikes": { en: "Featured bikes", sw: "Pikipiki maalum" },
};

const colorTranslations: Record<string, string> = {
  black: "nyeusi",
  blue: "bluu",
  red: "nyekundu",
  green: "kijani",
  silver: "silver",
  white: "nyeupe",
};

const bikeImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=85",
];

const heroImage =
  "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1800&q=85";

const demoProducts: DisplayProduct[] = [
  {
    id: -101,
    model_detail: {
      brand: "Honda",
      model_name: "Click 125i",
      engine_cc: 125,
      bike_type: "automatic",
    },
    color: "black",
    year: 2025,
    price: 245000,
    status: "available",
    image: null,
    notes: "Smooth automatic scooter for city rides and daily movement.",
    isDemo: true,
  },
  {
    id: -102,
    model_detail: { brand: "Yamaha", model_name: "NMAX", engine_cc: 155, bike_type: "automatic" },
    color: "blue",
    year: 2025,
    price: 385000,
    status: "available",
    image: null,
    notes: "Premium automatic bike with comfort seating and strong road presence.",
    isDemo: true,
  },
  {
    id: -201,
    model_detail: {
      brand: "TVS",
      model_name: "Neo NX",
      engine_cc: 110,
      bike_type: "semi-automatic",
    },
    color: "red",
    year: 2024,
    price: 185000,
    status: "available",
    image: null,
    notes: "Semi-automatic everyday bike with simple handling and low running cost.",
    isDemo: true,
  },
  {
    id: -202,
    model_detail: {
      brand: "Bajaj",
      model_name: "Boxer X",
      engine_cc: 150,
      bike_type: "semi-automatic",
    },
    color: "green",
    year: 2024,
    price: 225000,
    status: "reserved",
    image: null,
    notes: "Durable semi-automatic option for business, delivery, and rural roads.",
    isDemo: true,
  },
  {
    id: -301,
    model_detail: { brand: "Yamaha", model_name: "FZ-S", engine_cc: 149, bike_type: "manual" },
    color: "silver",
    year: 2025,
    price: 410000,
    status: "available",
    image: null,
    notes: "Manual street bike with sporty styling and responsive handling.",
    isDemo: true,
  },
  {
    id: -302,
    model_detail: { brand: "Honda", model_name: "CB 150R", engine_cc: 150, bike_type: "manual" },
    color: "white",
    year: 2024,
    price: 390000,
    status: "sold",
    image: null,
    notes: "Manual road bike built for confident riding and clean performance.",
    isDemo: true,
  },
];

function productName(product: MotorbikeProduct) {
  const name = [product.model_detail?.brand, product.model_detail?.model_name]
    .filter(Boolean)
    .join(" ");
  return name || `Motorbike #${product.id}`;
}

function productDescription(product: MotorbikeProduct, language: Language = "en") {
  if (language === "sw") {
    const demoNotes: Record<number, string> = {
      [-101]: "Scooter ya automatic kwa safari za mjini na matumizi ya kila siku.",
      [-102]: "Pikipiki ya automatic yenye kiti kizuri na muonekano mzuri barabarani.",
      [-201]: "Pikipiki ya semi-automatic yenye matumizi rahisi na gharama ndogo.",
      [-202]: "Pikipiki imara ya kazi, delivery, na barabara za kawaida.",
      [-301]: "Pikipiki ya manual yenye muonekano wa sport na uendeshaji mzuri.",
      [-302]: "Pikipiki ya manual kwa matumizi ya barabarani na uendeshaji wa kujiamini.",
    };

    return demoNotes[product.id] || product.notes || "Pikipiki nzuri kwa matumizi ya kila siku.";
  }

  return product.notes || "A well-kept motorbike ready for confident everyday riding.";
}

function isAvailable(product: MotorbikeProduct) {
  return product.status === "available";
}

function shelfTitle(product: MotorbikeProduct) {
  const bikeType = product.model_detail?.bike_type?.toLowerCase() ?? "";
  if (bikeType.includes("semi")) return "Semi-automatic picks";
  if (bikeType.includes("manual")) return "Manual performance";
  if (bikeType.includes("automatic") || bikeType.includes("scooter")) return "Automatic favorites";
  return "Featured bikes";
}

function shelfSubtitle(title: string) {
  if (title.includes("Automatic"))
    return "Effortless city rides, clean handling, and daily comfort.";
  if (title.includes("Semi")) return "Balanced control for work, delivery, and everyday movement.";
  if (title.includes("Manual")) return "Responsive machines for riders who want full command.";
  return "Curated stock selected from the Motorbuy inventory.";
}

function translateShelfTitle(title: string, language: Language) {
  return shelfTranslations[title]?.[language] ?? title;
}

function translateShelfSubtitle(title: string, language: Language) {
  if (language === "en") return shelfSubtitle(title);
  if (title.includes("Automatic")) return "Rahisi kuendesha mjini na nzuri kwa matumizi ya kila siku.";
  if (title.includes("Semi")) return "Inafaa kwa kazi, delivery, na safari za kawaida.";
  if (title.includes("Manual")) return "Kwa dereva anayependa control zaidi barabarani.";
  return "Pikipiki zilizochaguliwa kutoka kwenye stoo yetu.";
}

function translateBikeType(type: string | undefined, language: Language) {
  if (language === "en") return type || "Motorbike";
  const value = type?.toLowerCase() ?? "";
  if (value.includes("semi")) return "Semi-automatic";
  if (value.includes("manual")) return "Manual";
  if (value.includes("automatic")) return "Automatic";
  return "Pikipiki";
}

function translateColor(color: string | null | undefined, language: Language) {
  if (!color) return "N/A";
  if (language === "en") return color;
  return colorTranslations[color.toLowerCase()] ?? color;
}

function imageForProduct(product: DisplayProduct, index = 0) {
  if (product.image) {
    if (/^https?:\/\//i.test(product.image)) return product.image;
    const origin = BASE_URL.replace(/\/api$/, "");
    return `${origin}${product.image.startsWith("/") ? product.image : `/${product.image}`}`;
  }
  const stableIndex = Math.abs(product.id + index) % bikeImages.length;
  return bikeImages[stableIndex];
}

function ShopHomePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const isSwahili = language === "sw";
  const copy = uiText[language];
  const productsQ = useQuery({
    queryKey: ["shop", "products"],
    queryFn: getShopProducts,
    enabled: typeof window !== "undefined",
  });

  const allProducts = ((productsQ.data ?? []) as DisplayProduct[]).length
    ? ((productsQ.data ?? []) as DisplayProduct[])
    : demoProducts;

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allProducts;

    return allProducts.filter((product) => {
      const haystack = [
        productName(product),
        product.color,
        product.year,
        product.model_detail?.bike_type,
        product.model_detail?.engine_cc,
        productDescription(product),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [allProducts, search]);

  const shelves = useMemo<ProductShelf[]>(() => {
    const order = [
      "Automatic favorites",
      "Semi-automatic picks",
      "Manual performance",
      "Featured bikes",
    ];
    const grouped = new Map<string, DisplayProduct[]>();

    for (const product of products) {
      const title = shelfTitle(product);
      grouped.set(title, [...(grouped.get(title) ?? []), product]);
    }

    return order
      .map((title) => ({
        title,
        subtitle: shelfSubtitle(title),
        products: grouped.get(title) ?? [],
      }))
      .filter((shelf) => shelf.products.length > 0);
  }, [products]);

  const availableCount = products.filter(isAvailable).length;

  function viewDetails(id: number) {
    navigate({ to: "/purchase/$id", params: { id: String(id) } });
  }

  function buyNow(id: number) {
    if (!auth.isAuthenticated) {
      navigate({ to: "/login", search: { next: `/purchase/${id}` } });
      return;
    }

    if (auth.isAdmin) {
      alert("Admins cannot make purchases");
      return;
    }

    viewDetails(id);
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#101418]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="grid min-h-16 w-full grid-cols-1 items-center gap-4 px-6 py-3 md:grid-cols-[1fr_auto_1fr] md:px-10 lg:px-14">
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-full"
            onClick={() => setLanguage(isSwahili ? "en" : "sw")}
          >
            {isSwahili ? "English" : "Swahili"}
          </Button>

          <Link to="/" className="flex min-w-fit items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f97316] text-white shadow-lg shadow-orange-500/25">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">MOTORBUY</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <div className="relative w-full md:w-56 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isSwahili ? "Tafuta..." : "Search..."}
                className="h-10 w-full rounded-full border border-black/10 bg-white/90 pl-10 pr-4 text-sm outline-none ring-orange-500/20 transition focus:ring-4"
              />
            </div>
            {auth.isAuthenticated ? (
              <>
                {auth.isAdmin ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/admin-dashboard">{copy.admin}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/orders">{copy.myOrders}</Link>
                  </Button>
                )}
                <Button size="sm" className="rounded-full" onClick={auth.logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {copy.signOut}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/login">
                    <UserRound className="mr-2 h-4 w-4" />
                    {copy.login}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                >
                  <Link to="/register">{copy.register}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <HeroSection
          availableCount={availableCount}
          language={language}
          onBrowse={() =>
            document.getElementById("featured-bikes")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <section id="featured-bikes" className="mx-auto max-w-7xl space-y-12 px-4 py-14">
          <SectionHeading
            eyebrow={copy.featuredEyebrow}
            title={copy.featuredTitle}
            text={copy.featuredText}
          />

          {productsQ.isLoading ? (
            <LoadingShelves language={language} />
          ) : productsQ.isError ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              {copy.loadError}
            </div>
          ) : shelves.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              {copy.noResults}
            </div>
          ) : (
            shelves.map((shelf) => (
              <MotorbikeShelf
                key={shelf.title}
                shelf={shelf}
                language={language}
                onDetails={viewDetails}
                onPurchase={buyNow}
              />
            ))
          )}
        </section>

        <CategoriesSection language={language} />
        <WhyChooseUsSection language={language} />
        <TestimonialsSection language={language} />
      </main>

      <Footer language={language} />
    </div>
  );
}

function HeroSection({
  availableCount,
  language,
  onBrowse,
}: {
  availableCount: number;
  language: Language;
  onBrowse: () => void;
}) {
  const isSwahili = language === "sw";

  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-none bg-slate-900">
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
      />
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f4f1ec] to-transparent" />
      <div className="relative flex min-h-[560px] w-full flex-col items-center justify-center px-6 py-16 text-center md:px-10 lg:px-14">
        <div className="max-w-3xl text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30">
            {isSwahili ? "Duka la pikipiki" : "Motorbike shop"}
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] md:text-6xl">
            {isSwahili
              ? "Pata pikipiki sahihi kwa matumizi yako ya kila siku."
              : "Find the right motorbike for your daily use."}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-orange-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] md:text-lg">
            {isSwahili
              ? "Tovuti hii inasaidia wateja kuona pikipiki zilizopo, kulinganisha bei, na kuchagua pikipiki inayolingana na bajeti na matumizi yao."
              : "This website helps customers check available motorbikes, compare prices, and choose a bike that matches their budget and purpose."}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-orange-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] md:text-lg">
            {isSwahili
              ? "Tunauza aina tofauti za pikipiki kutoka brand maarufu kama Kinglion, Sanya, TVS, Honda, Yamaha, na Bajaj."
              : "We have different types of motorbikes from popular brands like Kinglion, Sanya, TVS, Honda, Yamaha, and Bajaj."}
          </p>
        </div>
        <Button
          size="lg"
          className="mt-8 w-fit rounded-md bg-[#f97316] px-10 py-7 text-lg font-semibold text-white hover:bg-[#ea580c]"
          onClick={onBrowse}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isSwahili ? "Anza sasa" : "Get started"}
        </Button>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f97316]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function LoadingShelves({ language }: { language: Language }) {
  return (
    <div className="space-y-10">
      {["Automatic favorites", "Semi-automatic picks", "Manual performance"].map((title) => (
        <section key={title}>
          <h3 className="mb-4 text-2xl font-black">{translateShelfTitle(title, language)}</h3>
          <div className="grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-3xl bg-white shadow-sm" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MotorbikeShelf({
  shelf,
  language,
  onDetails,
  onPurchase,
}: {
  shelf: ProductShelf;
  language: Language;
  onDetails: (id: number) => void;
  onPurchase: (id: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scroll(direction: "left" | "right") {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction === "right" ? node.clientWidth : -node.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight md:text-3xl">
            {translateShelfTitle(shelf.title, language)}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {translateShelfSubtitle(shelf.title, language)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-sm font-semibold text-slate-500">
            {shelf.products.length} {language === "sw" ? "pikipiki" : "bikes"}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shelf.products.map((product, index) => (
          <MotorbikeCard
            key={product.id}
            product={product}
            image={imageForProduct(product, index)}
            language={language}
            onDetails={onDetails}
            onPurchase={onPurchase}
          />
        ))}
      </div>
    </section>
  );
}

function MotorbikeCard({
  product,
  image,
  language,
  onDetails,
  onPurchase,
}: {
  product: DisplayProduct;
  image: string;
  language: Language;
  onDetails: (id: number) => void;
  onPurchase: (id: number) => void;
}) {
  const available = isAvailable(product);
  const isSwahili = language === "sw";

  return (
    <article className="group min-w-[82vw] snap-start overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 sm:min-w-[430px] lg:min-w-[calc((100%-40px)/3)] lg:basis-[calc((100%-40px)/3)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-900">
        <img
          src={image}
          alt={productName(product)}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-950">
          {available ? (isSwahili ? "Inapatikana" : "Available") : isSwahili ? "Haipatikani" : "Not available"}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {translateBikeType(product.model_detail?.bike_type, language)}
          </p>
          <h4 className="mt-1 text-2xl font-black">{productName(product)}</h4>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Spec icon={Gauge} label={`${product.model_detail?.engine_cc || "N/A"}cc`} />
          <Spec icon={Zap} label={product.year ? String(product.year) : "N/A"} />
          <Spec icon={Bike} label={translateColor(product.color, language)} />
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {productDescription(product, language)}
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {isSwahili ? "Bei" : "From"}
            </p>
            <p className="text-2xl font-black text-slate-950">{formatCurrency(product.price)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onDetails(product.id)}
            >
              {isSwahili ? "Maelezo" : "View Details"}
            </Button>
            <Button
              className="rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]"
              disabled={product.isDemo || !available}
              onClick={() => onPurchase(product.id)}
            >
              {available
                ? isSwahili
                  ? "Nunua Sasa"
                  : "Buy Now"
                : isSwahili
                  ? "Haipatikani"
                  : "Not available"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Spec({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-[#f97316]" />
      <span className="truncate capitalize">{label}</span>
    </div>
  );
}

function CategoriesSection({ language }: { language: Language }) {
  const isSwahili = language === "sw";
  const categories = isSwahili
    ? [
        { title: "Automatic", text: "Rahisi kuendesha kwa safari za mjini.", icon: Zap },
        { title: "Semi-automatic", text: "Nzuri kwa kazi na matumizi ya kawaida.", icon: Truck },
        { title: "Manual", text: "Control zaidi kwa dereva wa barabarani.", icon: Gauge },
      ]
    : [
        { title: "Automatic", text: "Smooth rides for daily city movement.", icon: Zap },
        { title: "Semi-automatic", text: "Practical machines for work and errands.", icon: Truck },
        { title: "Manual", text: "Full control for confident road riders.", icon: Gauge },
      ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow={isSwahili ? "Aina za pikipiki" : "Categories"}
          title={isSwahili ? "Chagua kulingana na matumizi yako" : "Choose by the way you ride"}
          text={
            isSwahili
              ? "Kama unahitaji pikipiki ya starehe, kazi, au speed, kila aina imewekwa wazi ili iwe rahisi kulinganisha."
              : "Whether you need comfort, utility, or performance, Motorbuy keeps every category clear and easy to compare."
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-3xl border bg-[#f8fafc] p-6 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <category.icon className="h-8 w-8 text-[#f97316]" />
              <h3 className="mt-5 text-2xl font-black">{category.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection({ language }: { language: Language }) {
  const isSwahili = language === "sw";
  const items = isSwahili
    ? [
        {
          icon: ShieldCheck,
          title: "Stoo iliyohakikiwa",
          text: "Kila pikipiki inaunganishwa na rekodi za stoo ya biashara.",
        },
        {
          icon: Wallet,
          title: "Njia tofauti za malipo",
          text: "Mteja anaweza kuchagua cash, benki, installment, au malipo ya simu.",
        },
        {
          icon: Truck,
          title: "Ufuatiliaji wa oda",
          text: "Wateja wanaweza kufuatilia oda zao wakati wafanyakazi wanaona taarifa kwenye mfumo.",
        },
      ]
    : [
        {
          icon: ShieldCheck,
          title: "Verified inventory",
          text: "Every listing connects directly to dealership stock records.",
        },
        {
          icon: Wallet,
          title: "Flexible payment paths",
          text: "Choose cash, bank transfer, installment, or supported mobile payment flows.",
        },
        {
          icon: Truck,
          title: "Order tracking",
          text: "Customers can follow their purchases while the CRM keeps staff aligned.",
        },
      ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow={isSwahili ? "Kwa nini Motorbuy" : "Why Motorbuy"}
          title={
            isSwahili
              ? "Njia rahisi ya kununua pikipiki kupitia mfumo wa biashara"
              : "A polished buying journey connected to your dealership CRM"
          }
          text={
            isSwahili
              ? "Duka limetengenezwa kwa ajili ya wateja, huku oda, wateja, na taarifa za stoo zikibaki wazi kwa timu ya ndani."
              : "The shop is designed for customers, while every order, customer, and stock movement remains visible to your internal team."
          }
        />
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-black/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#f97316]">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ language }: { language: Language }) {
  const isSwahili = language === "sw";
  const reviews = isSwahili
    ? [
        {
          name: "Amina K.",
          text: "Aina za pikipiki zilikuwa wazi, bei zilionekana, na kununua ilikuwa rahisi.",
          rating: "5.0",
        },
        {
          name: "Brian M.",
          text: "Niliweza kulinganisha pikipiki haraka na kuchagua iliyoendana na bajeti yangu.",
          rating: "4.9",
        },
        {
          name: "Collins T.",
          text: "Inaonekana kama soko la kisasa la pikipiki, si ukurasa wa kawaida wa stoo.",
          rating: "5.0",
        },
      ]
    : [
        {
          name: "Amina K.",
          text: "The bike options were clear, the pricing was visible, and checkout felt simple.",
          rating: "5.0",
        },
        {
          name: "Brian M.",
          text: "I could compare bikes quickly and choose the one that matched my budget.",
          rating: "4.9",
        },
        {
          name: "Collins T.",
          text: "It feels like a real premium marketplace, not a basic inventory page.",
          rating: "5.0",
        },
      ];

  return (
    <section className="bg-[#101418] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow={isSwahili ? "Maoni" : "Reviews"}
          title={isSwahili ? "Imejengwa kuongeza imani ya wateja" : "Built to earn rider confidence"}
          text={
            isSwahili
              ? "Uzoefu mzuri wa kununua unasaidia wateja kuamini bidhaa kabla hawajafika showroom."
              : "A clean buying experience helps customers trust the products before they ever visit the showroom."
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur"
            >
              <div className="flex items-center gap-1 text-[#f97316]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 leading-7 text-white/80">"{review.text}"</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-black">{review.name}</span>
                <span className="text-sm font-semibold text-white/60">{review.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ language }: { language: Language }) {
  const copy = uiText[language];

  return (
    <footer className="bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f97316] text-white">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-xl font-black">MOTORBUY</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            {copy.footerText}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterColumn
            title={copy.contact}
            items={[
              ["Dar es Salaam, Tanzania", MapPin],
              ["+255 755 005 000", Phone],
              ["sales@motorbuy.co", Mail],
            ]}
          />
          <FooterColumn
            title={copy.company}
            items={[
              [copy.inventory, Bike],
              [copy.payments, Wallet],
              [copy.delivery, Truck],
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<[string, React.ComponentType<{ className?: string }>]>;
}) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
            <Icon className="h-4 w-4 text-[#f97316]" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
