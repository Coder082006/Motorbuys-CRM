import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Facebook,
  Gauge,
  Instagram,
  Linkedin,
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

function productDescription(product: MotorbikeProduct) {
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
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-fit items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f97316] text-white shadow-lg shadow-orange-500/25">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">MOTORBUY</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={auth.isAdmin ? "/inventory" : "/login"}>Inventory</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={auth.isAdmin ? "/sales" : "/login"}>Sales</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={auth.isAdmin ? "/reports" : "/login"}>Reports</Link>
            </Button>
          </nav>

          <div className="relative order-last w-full md:order-none md:ml-auto md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search brand, model, engine..."
              className="h-11 w-full rounded-full border border-black/10 bg-white/90 pl-10 pr-4 text-sm outline-none ring-orange-500/20 transition focus:ring-4"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {auth.isAuthenticated ? (
              <>
                {auth.isAdmin ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/admin-dashboard">Admin</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/orders">My Orders</Link>
                  </Button>
                )}
                <Button size="sm" className="rounded-full" onClick={auth.logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/login">
                    <UserRound className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                >
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <HeroSection
          availableCount={availableCount}
          onBrowse={() =>
            document.getElementById("featured-bikes")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <section id="featured-bikes" className="mx-auto max-w-7xl space-y-12 px-4 py-14">
          <SectionHeading
            eyebrow="Featured bikes"
            title="Curated machines, ready when you are"
            text="Only three cards are visible on desktop so every bike feels deliberate, premium, and easy to compare."
          />

          {productsQ.isLoading ? (
            <LoadingShelves />
          ) : productsQ.isError ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              Failed to load motorbikes. Make sure the backend is running.
            </div>
          ) : shelves.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              No matching motorbikes found.
            </div>
          ) : (
            shelves.map((shelf) => (
              <MotorbikeShelf
                key={shelf.title}
                shelf={shelf}
                onDetails={viewDetails}
                onPurchase={buyNow}
              />
            ))
          )}
        </section>

        <CategoriesSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection({
  availableCount,
  onBrowse,
}: {
  availableCount: number;
  onBrowse: () => void;
}) {
  return (
    <section className="relative min-h-[620px] overflow-hidden">
      <img
        src={heroImage}
        alt="Premium motorcycle on the road"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f1ec] to-transparent" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center px-4 py-20">
        <div className="max-w-3xl animate-fade-in text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Star className="h-4 w-4 fill-[#f97316] text-[#f97316]" />
            Premium motorbike marketplace
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Own the ride that moves your ambition.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Discover verified bikes, compare clean inventory, and reserve your next machine through
            a smooth buying experience built for serious riders.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full bg-[#f97316] px-7 text-white shadow-xl shadow-orange-500/25 hover:bg-[#ea580c]"
              onClick={onBrowse}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explore bikes
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur hover:bg-white hover:text-slate-950"
              onClick={onBrowse}
            >
              View collection
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <HeroStat label="Bikes listed" value={`${availableCount}+`} />
            <HeroStat label="Categories" value="3" />
            <HeroStat label="Checkout" value="Secure" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
    </div>
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

function LoadingShelves() {
  return (
    <div className="space-y-10">
      {["Automatic favorites", "Semi-automatic picks", "Manual performance"].map((title) => (
        <section key={title}>
          <h3 className="mb-4 text-2xl font-black">{title}</h3>
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
  onDetails,
  onPurchase,
}: {
  shelf: ProductShelf;
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
          <h3 className="text-2xl font-black tracking-tight md:text-3xl">{shelf.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{shelf.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-sm font-semibold text-slate-500">
            {shelf.products.length} bikes
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
  onDetails,
  onPurchase,
}: {
  product: DisplayProduct;
  image: string;
  onDetails: (id: number) => void;
  onPurchase: (id: number) => void;
}) {
  const available = isAvailable(product);

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
          {available ? "Available" : "Not available"}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {product.model_detail?.bike_type || "Motorbike"}
          </p>
          <h4 className="mt-1 text-2xl font-black">{productName(product)}</h4>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Spec icon={Gauge} label={`${product.model_detail?.engine_cc || "N/A"}cc`} />
          <Spec icon={Zap} label={product.year ? String(product.year) : "N/A"} />
          <Spec icon={Bike} label={product.color || "N/A"} />
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {productDescription(product)}
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">From</p>
            <p className="text-2xl font-black text-slate-950">{formatCurrency(product.price)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onDetails(product.id)}
            >
              View Details
            </Button>
            <Button
              className="rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]"
              disabled={product.isDemo || !available}
              onClick={() => onPurchase(product.id)}
            >
              {available ? "Buy Now" : "Not available"}
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

function CategoriesSection() {
  const categories = [
    { title: "Automatic", text: "Smooth rides for daily city movement.", icon: Zap },
    { title: "Semi-automatic", text: "Practical machines for work and errands.", icon: Truck },
    { title: "Manual", text: "Full control for confident road riders.", icon: Gauge },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Categories"
          title="Choose by the way you ride"
          text="Whether you need comfort, utility, or performance, Motorbuy keeps every category clear and easy to compare."
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

function WhyChooseUsSection() {
  const items = [
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
          eyebrow="Why Motorbuy"
          title="A polished buying journey connected to your dealership CRM"
          text="The shop is designed for customers, while every order, customer, and stock movement remains visible to your internal team."
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

function TestimonialsSection() {
  const reviews = [
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
          eyebrow="Reviews"
          title="Built to earn rider confidence"
          text="A clean buying experience helps customers trust the products before they ever visit the showroom."
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

function Footer() {
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
            Premium motorbike marketplace connected to dealership operations, customer orders, and
            inventory visibility.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterColumn
            title="Contact"
            items={[
              ["Nairobi, Kenya", MapPin],
              ["+254 700 000 000", Phone],
              ["sales@motorbuy.co", Mail],
            ]}
          />
          <FooterColumn
            title="Company"
            items={[
              ["Inventory", Bike],
              ["Payments", Wallet],
              ["Delivery", Truck],
            ]}
          />
          <div>
            <h3 className="font-black">Social</h3>
            <div className="mt-4 flex gap-2">
              {[Facebook, Instagram, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border text-slate-700 transition hover:border-[#f97316] hover:text-[#f97316]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
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
