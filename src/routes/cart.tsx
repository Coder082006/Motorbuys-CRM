import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerRoute } from "../context/AuthContext";
import { BASE_URL } from "../lib/api/client";
import { getCartItems, removeCartItem, updateCartItem, type CartItem, type MotorbikeProduct } from "../lib/api/shop";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart - Motorbuy" }] }),
});

const bikeImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=85",
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

function CartPage() {
  return (
    <CustomerRoute>
      <CartContent />
    </CustomerRoute>
  );
}

function CartContent() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCart() {
    setIsLoading(true);
    try {
      const response = await getCartItems();
      setItems(response.results);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.motorbike_detail?.price ?? 0) * (item.quantity ?? 1),
        0,
      ),
    [items],
  );

  async function removeItem(id: number) {
    setMessage("");
    await removeCartItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function changeQuantity(itemId: number, newQty: number) {
    if (newQty < 1) return;
    setMessage("");
    try {
      const updated = await updateCartItem(itemId, newQty);
      setItems((current) =>
        current.map((item) => (item.id === itemId ? updated : item)),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update quantity.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="ghost" className="mb-5 -ml-3 rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to motorbikes
          </Link>
        </Button>

        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-orange-600 px-6 py-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">
              Shopping cart
            </p>
            <h1 className="mt-2 text-3xl font-black">Confirm your motorbikes</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Review saved bikes before checkout. Each motorbike is unique stock, so checkout one
              bike when you are ready to place the order.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-black">Your cart is empty</h2>
              <p className="mt-2 text-sm text-slate-500">Add a motorbike from the shop to continue.</p>
              <Button asChild className="mt-5 rounded-full bg-brand-orange text-white">
                <Link to="/">Shop motorbikes</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4">
                {items.map((item) => {
                  const product = item.motorbike_detail;
                  return (
                    <article
                      key={item.id}
                      className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr]"
                    >
                      <img
                        src={imageForProduct(product)}
                        alt={productName(product)}
                        className="h-36 w-full rounded-xl object-cover sm:h-full"
                      />
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-black">{productName(product)}</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            {product?.notes || "Available Motorbuy stock ready for checkout."}
                          </p>
                          <div className="mt-3 flex items-center gap-4">
                            <p className="text-2xl font-black text-brand-orange">
                              {formatCurrency(product?.price ?? 0)}
                            </p>
                            <span className="text-sm text-slate-400">× {item.quantity ?? 1}</span>
                            <span className="text-lg font-bold text-slate-700">
                              = {formatCurrency(Number(product?.price ?? 0) * (item.quantity ?? 1))}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1 rounded-full border">
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-l-full text-lg font-bold hover:bg-slate-100"
                              onClick={() => void changeQuantity(item.id, (item.quantity ?? 1) - 1)}
                              disabled={(item.quantity ?? 1) <= 1}
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-bold">
                              {item.quantity ?? 1}
                            </span>
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-r-full text-lg font-bold hover:bg-slate-100"
                              onClick={() => void changeQuantity(item.id, (item.quantity ?? 1) + 1)}
                            >
                              +
                            </button>
                          </div>
                          <Button
                            className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
                            onClick={() =>
                              navigate({
                                to: "/checkout",
                                search: { all: undefined, cartItem: String(item.id) },
                              })
                            }
                          >
                            Checkout
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => void removeItem(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="h-fit rounded-2xl border bg-slate-50 p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Cart summary</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-600">Items</span>
                <span className="font-black">{items.length}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-600">Total quantity</span>
                <span className="font-black">
                  {items.reduce((sum, item) => sum + (item.quantity ?? 1), 0)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-600">Total amount</span>
                <span className="font-black">{formatCurrency(total)}</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Adjust quantities per motorbike above. Cart totals include quantity × unit price.
              </p>
                {message ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}
                <Button
                  className="mt-5 w-full rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
                  onClick={() =>
                    navigate({
                      to: "/checkout",
                      search: { all: "1", cartItem: undefined },
                    })
                  }
                >
                  Checkout all items
                </Button>
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
