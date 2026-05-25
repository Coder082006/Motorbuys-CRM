import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/purchase/$id")({
  component: PurchasePage,
  head: () => ({ meta: [{ title: "Purchase Motorbike - Motorbuy" }] }),
});

function productName(product: MotorbikeProduct) {
  const model = product.model_detail;
  return model ? `${model.brand} ${model.model_name}` : `Motorbike #${product.id}`;
}

function money(value: string | number) {
  return formatCurrency(value);
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
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "cash" | "bank_transfer" | "installment"
  >("mpesa");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const created = await createShopOrder({
        motorbike: product.id,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        phone,
      });
      setOrder(created);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
      </main>
    );
  }

  if (order) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <section className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Order placed successfully!</h1>
          <p className="mt-3 text-muted-foreground">
            A confirmation SMS has been sent to {order.phone || phone}.
          </p>
          <p className="mt-2 font-medium">Order ID: #{order.id}</p>
          <Button asChild className="mt-6 rounded-full bg-brand-orange text-brand-navy">
            <Link to="/orders">View My Orders</Link>
          </Button>
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
          <Button asChild variant="ghost" className="mb-5">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to motorbikes
            </Link>
          </Button>
          <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="aspect-[16/9] bg-muted">
              {product.image ? (
                <img src={product.image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="mt-2 text-2xl font-bold text-brand-orange">{money(product.price)}</p>
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
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="ghost" className="mb-5">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to motorbikes
          </Link>
        </Button>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
          <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="aspect-[16/10] bg-muted">
              {product.image ? (
                <img src={product.image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="mt-2 text-2xl font-bold text-brand-orange">{money(product.price)}</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <span className="text-muted-foreground">Year</span>
                  <div className="font-semibold">{product.year || "N/A"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <span className="text-muted-foreground">Color</span>
                  <div className="font-semibold">{product.color || "N/A"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <span className="text-muted-foreground">Engine</span>
                  <div className="font-semibold">{product.model_detail?.engine_cc || "N/A"} cc</div>
                </div>
              </div>
              {product.notes ? <p className="mt-5 text-muted-foreground">{product.notes}</p> : null}
            </div>
          </section>

          <section className="h-fit rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Confirm Purchase</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your order will be sent to the Motorbuy CRM for staff follow-up.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" value={money(product.price)} readOnly />
              </div>
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
                <Label htmlFor="payment_method">Payment Method</Label>
                <select
                  id="payment_method"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value as "mpesa" | "cash" | "bank_transfer" | "installment",
                    )
                  }
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="installment">Installment</option>
                </select>
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
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-brand-orange font-semibold text-brand-navy hover:bg-brand-orange/90"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order
                  </span>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
