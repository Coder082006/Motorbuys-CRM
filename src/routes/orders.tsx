import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Loader2, Receipt, ShoppingBag, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute } from "../context/AuthContext";
import {
  completeDemoPayment,
  confirmOrderReceived,
  getMyOrders,
  submitOrderReview,
  type ShopOrder,
} from "../lib/api/shop";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "My Orders - Motorbuy" }] }),
});

function money(value: string | number) {
  return formatCurrency(value);
}

function paymentText(value: string) {
  if (value === "demo") return "Online payment";
  return value.replace("_", " ");
}

function statusText(value: string) {
  if (value === "paid_demo") return "Paid";
  if (value === "out_for_delivery") return "Out for delivery";
  return value.replace("_", " ");
}

function bikeName(order: ShopOrder) {
  return order.motorbike_detail?.model_detail
    ? `${order.motorbike_detail.model_detail.brand} ${order.motorbike_detail.model_detail.model_name}`
    : `Motorbike #${order.motorbike}`;
}

function statusClass(value: string) {
  if (value === "paid_demo" || value === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (value === "pending" || value === "confirmed") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function OrdersPage() {
  return (
    <CustomerRoute>
      <OrdersContent />
    </CustomerRoute>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [reviewOrder, setReviewOrder] = useState<ShopOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    getMyOrders()
      .then((response) => {
        if (isMounted) setOrders(response.results);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Could not load your orders.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openPayment = (order: ShopOrder) => {
    setSelectedOrder(order);
    setPaymentPhone(order.phone || "");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const confirmPayment = async () => {
    if (!selectedOrder) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessingPayment(true);

    // TODO: PAYMENT GATEWAY INTEGRATION POINT
    // Replace this demo simulation with real payment gateway (e.g. Flutterwave, M-Pesa Daraja)
    // Expected: call payment API, get transaction ID, then mark this order as paid
    await new Promise((resolve) => window.setTimeout(resolve, 2000));

    try {
      const paidOrder = await completeDemoPayment(selectedOrder.id, paymentPhone);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === paidOrder.id ? paidOrder : order)),
      );
      setSuccessMessage(`Payment successful. Order #${paidOrder.customer_order_number} is now paid.`);
      setSelectedOrder(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not complete payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const markReceived = async (order: ShopOrder) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await confirmOrderReceived(order.id);
      setOrders((currentOrders) =>
        currentOrders.map((current) => (current.id === updated.id ? updated : current)),
      );
      setSuccessMessage(`Order #${updated.customer_order_number} marked as received.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not confirm delivery.");
    }
  };

  const sendReview = async () => {
    if (!reviewOrder) return;
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const review = await submitOrderReview(reviewOrder.id, rating, reviewComment);
      setOrders((currentOrders) =>
        currentOrders.map((current) =>
          current.id === reviewOrder.id ? { ...current, review } : current,
        ),
      );
      setSuccessMessage(`Thank you. Review saved for order #${reviewOrder.customer_order_number}.`);
      setReviewOrder(null);
      setRating(5);
      setReviewComment("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save review.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="ghost" className="mb-5 -ml-3 rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to motorbikes
          </Link>
        </Button>

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-orange-600 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">
                  Motorbuy purchases
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Orders</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  Track your motorbike purchases, complete pending payments, and keep every order
                  reference in one place.
                </p>
              </div>
              <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-orange-50">
                <Link to="/">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop motorbikes
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
            <SummaryStat icon={Receipt} label="Total orders" value={String(orders.length)} />
            <SummaryStat
              icon={CreditCard}
              label="Pending payment"
              value={String(orders.filter((order) => order.status === "pending" || order.status === "confirmed").length)}
            />
            <SummaryStat
              icon={CheckCircle2}
              label="Completed"
              value={String(orders.filter((order) => order.status === "paid_demo" || order.status === "paid").length)}
            />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Purchase history</h2>
            <p className="text-sm text-slate-500">Customer order numbers are personal to your account.</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            </div>
          ) : errorMessage ? (
            <div className="p-6 text-center text-destructive">{errorMessage}</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              You have not placed any orders yet.
            </div>
          ) : (
            <div>
              {successMessage ? (
                <div className="border-b bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              ) : null}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Order</th>
                      <th className="px-5 py-4 font-semibold">Motorbike</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Payment</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const canPay = order.status === "pending" || order.status === "confirmed";
                      return (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-orange-50/40">
                          <td className="px-5 py-4">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">
                              #{order.customer_order_number}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold">{bikeName(order)}</td>
                          <td className="px-5 py-4 font-bold">{money(order.amount ?? order.total_amount)}</td>
                          <td className="px-5 py-4 capitalize">{paymentText(order.payment_method)}</td>
                          <td className="px-5 py-4 capitalize">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                              {statusText(order.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {canPay ? (
                              <Button
                                size="sm"
                                className="rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                                onClick={() => openPayment(order)}
                              >
                                Complete Payment
                              </Button>
                            ) : order.status !== "delivered" && order.status !== "cancelled" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void markReceived(order)}
                              >
                                Confirm Received
                              </Button>
                            ) : order.status === "delivered" && !order.review ? (
                              <Button
                                size="sm"
                                className="rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                                onClick={() => setReviewOrder(order)}
                              >
                                Review
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Done
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 md:hidden">
                {orders.map((order) => {
                  const canPay = order.status === "pending" || order.status === "confirmed";
                  return (
                    <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Order</p>
                          <h3 className="text-2xl font-black">#{order.customer_order_number}</h3>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass(order.status)}`}>
                          {statusText(order.status)}
                        </span>
                      </div>
                      <OrderProgress status={order.status} />
                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500">Motorbike</p>
                          <p className="font-semibold">{bikeName(order)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-black">{money(order.amount ?? order.total_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">Payment</span>
                          <span className="font-semibold capitalize">{paymentText(order.payment_method)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            Date
                          </span>
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {canPay ? (
                        <Button
                          className="mt-5 w-full rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                          onClick={() => openPayment(order)}
                        >
                          Complete Payment
                        </Button>
                      ) : order.status !== "delivered" && order.status !== "cancelled" ? (
                        <Button
                          variant="outline"
                          className="mt-5 w-full rounded-full"
                          onClick={() => void markReceived(order)}
                        >
                          Confirm Received
                        </Button>
                      ) : order.status === "delivered" && !order.review ? (
                        <Button
                          className="mt-5 w-full rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                          onClick={() => setReviewOrder(order)}
                        >
                          Leave Review
                        </Button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              Payment simulation: no real transaction will occur.
            </div>
            <h2 className="mt-5 text-2xl font-black">Complete Payment</h2>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Order</span>
                <span className="font-semibold">#{selectedOrder.customer_order_number}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {money(selectedOrder.amount ?? selectedOrder.total_amount)}
                </span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="payment-phone">Enter your M-Pesa phone number</Label>
              <Input
                id="payment-phone"
                value={paymentPhone}
                onChange={(event) => setPaymentPhone(event.target.value)}
              />
            </div>
            {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={isProcessingPayment}
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                disabled={isProcessingPayment}
                onClick={confirmPayment}
              >
                {isProcessingPayment ? (
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
      ) : null}

      {reviewOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black">Review your motorbike</h2>
            <p className="mt-1 text-sm text-slate-500">{bikeName(reviewOrder)}</p>
            <div className="mt-5 space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={value <= rating ? "text-brand-orange" : "text-slate-300"}
                      onClick={() => setRating(value)}
                    >
                      <Star className="h-7 w-7 fill-current" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="review-comment">Feedback</Label>
              <Input
                id="review-comment"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Tell us about your experience"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setReviewOrder(null)}>
                Cancel
              </Button>
              <Button className="rounded-full bg-brand-orange text-brand-navy" onClick={() => void sendReview()}>
                Submit Review
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

const progressSteps = [
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "out_for_delivery", label: "Delivery" },
  { key: "delivered", label: "Received" },
];

function progressIndex(status: string) {
  if (status === "paid" || status === "paid_demo") return 0;
  if (status === "processing") return 1;
  if (status === "out_for_delivery") return 2;
  if (status === "delivered") return 3;
  return -1;
}

function OrderProgress({ status }: { status: string }) {
  const active = progressIndex(status);
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {progressSteps.map((step, index) => (
        <div key={step.key} className="text-center">
          <div
            className={[
              "mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black",
              index <= active ? "border-brand-orange bg-orange-50 text-brand-orange" : "border-slate-200 text-slate-300",
            ].join(" ")}
          >
            {step.key === "out_for_delivery" ? <Truck className="h-4 w-4" /> : index + 1}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{step.label}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#f97316] shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}
