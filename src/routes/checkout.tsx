import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute, useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/api/client";
import {
  completeDemoPayment,
  createShopOrder,
  getCartItems,
  type CartItem,
  type MotorbikeProduct,
  type ShopOrder,
} from "../lib/api/shop";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    all: search.all === "1" ? "1" : undefined,
    cartItem: typeof search.cartItem === "string" ? search.cartItem : undefined,
  }),
  component: CheckoutPage,
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
];

function productName(product?: MotorbikeProduct) {
  if (!product) return "Motorbike";
  return product.model_detail
    ? `${product.model_detail.brand} ${product.model_detail.model_name}`
    : `Motorbike #${product.id}`;
}

function imageForProduct(product?: MotorbikeProduct) {
  if (product?.image) {
    if (/^https?:\/\//i.test(product.image)) return product.image;
    const origin = BASE_URL.replace(/\/api$/, "");
    return `${origin}${product.image.startsWith("/") ? product.image : `/${product.image}`}`;
  }
  return bikeImages[Math.abs(product?.id ?? 0) % bikeImages.length];
}

function paymentLabel(method: DemoPaymentMethod) {
  return paymentOptions.find((option) => option.id === method)?.label.replace("Pay with ", "") || "Payment";
}

function CheckoutPage() {
  return (
    <CustomerRoute>
      <CheckoutContent />
    </CustomerRoute>
  );
}

function CheckoutContent() {
  const auth = useAuth();
  const search = Route.useSearch();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [paidOrders, setPaidOrders] = useState<ShopOrder[]>([]);
  const [phone, setPhone] = useState(auth.user?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<DemoPaymentMethod>("mpesa");
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const selectedCartItem = search.cartItem;
    const checkoutAll = search.all === "1";

    getCartItems()
      .then((response) => {
        if (!mounted) return;
        const selected = response.results.find((item) => String(item.id) === selectedCartItem);
        setCartItems(checkoutAll ? response.results : selected ? [selected] : response.results[0] ? [response.results[0]] : []);
      })
      .catch(() => {
        if (mounted) setErrorMessage("Could not load your cart item.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search.all, search.cartItem]);

  const products = useMemo(
    () => cartItems.map((item) => item.motorbike_detail).filter((item): item is MotorbikeProduct => Boolean(item)),
    [cartItems],
  );
  const primaryProduct = products[0];
  const isMultiCheckout = products.length > 1;
  const name = useMemo(
    () => (isMultiCheckout ? `${products.length} motorbikes selected` : productName(primaryProduct)),
    [isMultiCheckout, primaryProduct, products.length],
  );
  const orderTotal = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.price || 0), 0),
    [products],
  );
  const customerName = auth.user?.name || auth.user?.email || "Customer";

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (products.length === 0) return;

    setErrorMessage("");
    setIsPlacingOrder(true);
    try {
      const createdOrders: ShopOrder[] = [];
      for (const product of products) {
        const created = await createShopOrder({
          motorbike: product.id,
          payment_method: "demo",
          delivery_address: deliveryAddress,
          delivery_city: deliveryCity,
          delivery_region: deliveryRegion,
          phone,
          notes: `Checkout payment method selected: ${paymentLabel(selectedMethod)}${isMultiCheckout ? " | Multi-item cart checkout" : ""}`,
        });
        createdOrders.push(created);
      }
      setOrders(createdOrders);
      setShowPayment(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  async function confirmPayment() {
    if (orders.length === 0) return;

    setErrorMessage("");
    setIsProcessingPayment(true);

    // TODO: PAYMENT GATEWAY INTEGRATION POINT
    // Replace this demo simulation with real payment gateway (e.g. Flutterwave, M-Pesa Daraja)
    // Expected: call payment API, get transaction ID, then mark this order as paid
    await new Promise((resolve) => window.setTimeout(resolve, 2000));

    try {
      const paid: ShopOrder[] = [];
      for (const order of orders) {
        paid.push(await completeDemoPayment(order.id, phone));
      }
      setPaidOrders(paid);
      setShowPayment(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not complete payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
      </main>
    );
  }

  if (paidOrders.length > 0) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10">
        <section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center shadow-xl shadow-black/5">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-3xl font-black">Payment Successful!</h1>
          <p className="mt-2 text-slate-500">
            Your {paidOrders.length === 1 ? "order is" : "orders are"} now visible in Motorbuy CRM for processing and delivery updates.
          </p>
          <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-left text-sm">
            <InfoRow
              label={paidOrders.length === 1 ? "Order ID" : "Order IDs"}
              value={paidOrders.map((order) => `#${order.customer_order_number}`).join(", ")}
            />
            <InfoRow label="Amount" value={formatCurrency(orderTotal)} />
            <InfoRow label="Payment Method" value={paymentLabel(selectedMethod)} />
            <InfoRow label="Status" value="Paid" />
          </div>
          <p className="mt-5 text-slate-500">
            A confirmation SMS has been sent to {paidOrders[0]?.phone || phone}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-brand-orange text-white">
              <Link to="/orders">Track My Order</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <section className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">No cart item selected</h1>
          <p className="mt-2 text-slate-500">Add a motorbike to cart before checkout.</p>
          <Button asChild className="mt-5 rounded-full bg-brand-orange text-white">
            <Link to="/">Shop motorbikes</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="ghost" className="mb-5 -ml-3 rounded-full">
          <Link to="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to cart
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="overflow-hidden rounded-3xl border bg-white shadow-xl shadow-black/5">
            <img src={imageForProduct(primaryProduct)} alt={name} className="h-80 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
                Checkout Order
              </p>
              <h1 className="mt-2 text-3xl font-black">{name}</h1>
              <p className="mt-2 text-2xl font-black text-brand-orange">
                {formatCurrency(orderTotal)}
              </p>
              {isMultiCheckout ? (
                <div className="mt-5 grid gap-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-3">
                      <div>
                        <p className="font-semibold">{productName(product)}</p>
                        <p className="text-xs text-slate-500">
                          {product.year || "N/A"} • {product.color || "N/A"} • {product.model_detail?.engine_cc || "N/A"} cc
                        </p>
                      </div>
                      <span className="font-black">{formatCurrency(product.price)}</span>
                    </div>
                  ))}
                </div>
              ) : primaryProduct ? (
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <InfoBox label="Year" value={String(primaryProduct.year || "N/A")} />
                  <InfoBox label="Color" value={primaryProduct.color || "N/A"} />
                  <InfoBox label="Engine" value={`${primaryProduct.model_detail?.engine_cc || "N/A"} cc`} />
                </div>
              ) : null}
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-orange-50 p-4 text-sm text-orange-900">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <p>
                  Order is created only after you confirm checkout. Payment comes next, then staff
                  can process and update delivery status from the CRM.
                </p>
              </div>
            </div>
          </section>

          <section className="h-fit rounded-3xl border bg-white p-6 shadow-xl shadow-black/5">
            <h2 className="text-xl font-black">Checkout Details</h2>
            <p className="mt-1 text-sm text-slate-500">Confirm delivery and payment details.</p>
            <form onSubmit={placeOrder} className="mt-5 space-y-4">
              <InfoBox label="Customer" value={customerName} />
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" required value={phone} onChange={(event) => setPhone(event.target.value)} />
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery_city">City</Label>
                  <Input
                    id="delivery_city"
                    value={deliveryCity}
                    onChange={(event) => setDeliveryCity(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_region">Region</Label>
                  <Input
                    id="delivery_region"
                    value={deliveryRegion}
                    onChange={(event) => setDeliveryRegion(event.target.value)}
                  />
                </div>
              </div>
              <InfoBox label="Order Total" value={formatCurrency(orderTotal)} />
              {errorMessage ? <p className="text-sm font-semibold text-destructive">{errorMessage}</p> : null}
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-brand-orange font-semibold text-white hover:bg-brand-orange/90"
                disabled={isPlacingOrder || orders.length > 0}
              >
                {isPlacingOrder ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order
                  </span>
                ) : orders.length > 0 ? (
                  `${orders.length} order${orders.length === 1 ? "" : "s"} placed`
                ) : (
                  isMultiCheckout ? "Confirm Checkout All" : "Confirm Checkout"
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>

      {showPayment ? (
        <PaymentDialog
          amount={formatCurrency(orderTotal)}
          phone={phone}
          setPhone={setPhone}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          isProcessing={isProcessingPayment}
          errorMessage={errorMessage}
          onClose={() => setShowPayment(false)}
          onConfirm={confirmPayment}
        />
      ) : null}
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function PaymentDialog({
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
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Payment simulation: no real transaction will occur.
        </div>
        <h2 className="mt-5 text-2xl font-black">Make Payment</h2>
        <p className="mt-1 text-sm text-slate-500">Amount due: {amount}</p>
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
          <Input id="demo-phone" required value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="rounded-full" disabled={isProcessing} onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
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
