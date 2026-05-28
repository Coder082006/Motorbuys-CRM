import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute, useAuth } from "../context/AuthContext";
import {
  createShopOrder,
  getShopProduct,
  type MotorbikeProduct,
  type ShopOrder,
} from "../lib/api/shop";
import { BASE_URL } from "../lib/api/client";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/purchase/$id")({
  component: PurchasePage,
  head: () => ({ meta: [{ title: "Checkout - Motorbuy" }] }),
});

type DemoPaymentMethod = "card" | "mpesa" | "bank_transfer";

const paymentOptions: Array<{
  id: DemoPaymentMethod;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "card", label: "Pay with Card", icon: CreditCard },
  { id: "mpesa", label: "Pay with M-Pesa", icon: Phone },
  { id: "bank_transfer", label: "Pay with Bank Transfer", icon: Landmark },
];

const bikeImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=85",
];

function productName(product: MotorbikeProduct) {
  const model = product.model_detail;
  return model ? `${model.brand} ${model.model_name}` : `Motorbike #${product.id}`;
}

function imageForProduct(product: MotorbikeProduct) {
  if (product.image) {
    if (/^https?:\/\//i.test(product.image)) return product.image;
    const origin = BASE_URL.replace(/\/api$/, "");
    return `${origin}${product.image.startsWith("/") ? product.image : `/${product.image}`}`;
  }

  return bikeImages[Math.abs(product.id) % bikeImages.length];
}

function paymentLabel(method: DemoPaymentMethod) {
  return paymentOptions.find((option) => option.id === method)?.label.replace("Pay with ", "") || "Payment";
}

function PurchasePage() {
  const { id } = Route.useParams();

  return (
    <CustomerRoute>
      <PurchaseContent id={Number(id)} />
    </CustomerRoute>
  );
}

function PurchaseContent({ id }: { id: number }) {
  const auth = useAuth();
  const [product, setProduct] = useState<MotorbikeProduct | null>(null);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [phone, setPhone] = useState(auth.user?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<DemoPaymentMethod>("mpesa");
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getShopProduct(id)
      .then((nextProduct) => {
        if (isMounted) setProduct(nextProduct);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("This motorbike is not available right now.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const name = useMemo(() => (product ? productName(product) : "Motorbike"), [product]);
  const customerName = auth.user?.name || auth.user?.email || "Customer";

  const proceedToPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!product) return;

    setErrorMessage("");
    setIsProcessing(true);

    // TODO: PAYMENT GATEWAY INTEGRATION POINT
    // Replace this demo simulation with real payment gateway (e.g. Flutterwave, M-Pesa Daraja)
    // Expected: call payment API, get transaction ID, then create order
    await new Promise((resolve) => window.setTimeout(resolve, 2000));

    try {
      const created = await createShopOrder({
        motorbike: product.id,
        payment_method: "demo",
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        phone,
        notes: `Payment method selected: ${paymentLabel(selectedMethod)}`,
      });
      setOrder(created);
      setShowPayment(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not confirm payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
      </main>
    );
  }

  if (order && product) {
    return (
      <main className="min-h-screen bg-[#f6f4ef] px-4 py-10">
        <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-xl shadow-black/5">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-3xl font-black">Payment Successful!</h1>
          <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-left text-sm">
            <InfoRow label="Order ID" value={`#${order.customer_order_number}`} />
            <InfoRow label="Amount" value={formatCurrency(order.total_amount)} />
            <InfoRow label="Payment Method" value={paymentLabel(selectedMethod)} />
            <InfoRow label="Reference" value={`Order #${order.customer_order_number}`} />
          </div>
          <p className="mt-5 text-muted-foreground">
            A confirmation SMS has been sent to {order.phone || phone}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-brand-orange text-brand-navy">
              <Link to="/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Motorbike not available</h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (product.status !== "available") {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <BackHomeButton />
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <ProductImage product={product} name={name} />
            <div className="p-6">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="mt-2 text-2xl font-bold text-brand-orange">
                {formatCurrency(product.price)}
              </p>
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                This motorbike is not available for purchase right now.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <BackHomeButton />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_430px]">
          <section className="overflow-hidden rounded-2xl border bg-white shadow-xl shadow-black/5">
            <ProductImage product={product} name={name} />
            <div className="p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
                Order Summary
              </p>
              <h1 className="mt-2 text-3xl font-black">{name}</h1>
              <p className="mt-2 text-2xl font-black text-brand-orange">
                {formatCurrency(product.price)}
              </p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <Spec label="Year" value={product.year || "N/A"} />
                <Spec label="Color" value={product.color || "N/A"} />
                <Spec label="Engine" value={`${product.model_detail?.engine_cc || "N/A"} cc`} />
              </div>
              {product.notes ? <p className="mt-5 text-muted-foreground">{product.notes}</p> : null}
            </div>
          </section>

          <section className="h-fit rounded-2xl border bg-white p-6 shadow-xl shadow-black/5">
            <h2 className="text-xl font-black">Customer Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm your details before opening the payment screen.
            </p>
            <form onSubmit={proceedToPayment} className="mt-5 space-y-4">
              <InfoBox label="Customer" value={customerName} />
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Input
                  id="delivery_address"
                  required
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_city">City / Region</Label>
                <Input
                  id="delivery_city"
                  value={deliveryCity}
                  onChange={(event) => setDeliveryCity(event.target.value)}
                />
              </div>
              <InfoBox label="Order Total" value={formatCurrency(product.price)} />
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-brand-orange font-semibold text-brand-navy hover:bg-brand-orange/90"
              >
                Proceed to Payment
              </Button>
            </form>
          </section>
        </div>
      </div>

      {showPayment ? (
        <DemoPaymentDialog
          amount={formatCurrency(product.price)}
          phone={phone}
          setPhone={setPhone}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          isProcessing={isProcessing}
          errorMessage={errorMessage}
          onClose={() => setShowPayment(false)}
          onConfirm={confirmPayment}
        />
      ) : null}
    </main>
  );
}

function BackHomeButton() {
  return (
    <Button asChild variant="ghost" className="mb-5">
      <Link to="/">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to motorbikes
      </Link>
    </Button>
  );
}

function ProductImage({ product, name }: { product: MotorbikeProduct; name: string }) {
  const image = imageForProduct(product);

  return (
    <div className="aspect-[16/10] overflow-hidden bg-muted">
      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function DemoPaymentDialog({
  amount,
  phone,
  setPhone,
  selectedMethod,
  setSelectedMethod,
  isProcessing,
  errorMessage,
  onClose,
  onConfirm,
}: {
  amount: string;
  phone: string;
  setPhone: (value: string) => void;
  selectedMethod: DemoPaymentMethod;
  setSelectedMethod: (value: DemoPaymentMethod) => void;
  isProcessing: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Payment simulation: no real transaction will occur.
        </div>
        <div className="mt-5">
          <h2 className="text-2xl font-black">Choose Payment Method</h2>
          <p className="mt-1 text-sm text-muted-foreground">Amount due: {amount}</p>
        </div>
        <div className="mt-5 grid gap-3">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedMethod(option.id)}
              className={[
                "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                selectedMethod === option.id
                  ? "border-brand-orange bg-orange-50"
                  : "border-slate-200 hover:border-brand-orange/60",
              ].join(" ")}
            >
              <option.icon className="h-5 w-5 text-brand-orange" />
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Label htmlFor="demo-phone">
            {selectedMethod === "mpesa" ? "Enter your M-Pesa phone number" : "Phone number"}
          </Label>
          <Input
            id="demo-phone"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="rounded-full" disabled={isProcessing} onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
            disabled={isProcessing}
            onClick={onConfirm}
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing
              </span>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
