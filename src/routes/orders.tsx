import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRoute } from "../context/AuthContext";
import { completeDemoPayment, getMyOrders, type ShopOrder } from "../lib/api/shop";
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
  return value.replace("_", " ");
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

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track purchases you have placed with Motorbuy.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Shop motorbikes</Link>
          </Button>
        </div>

        <section className="rounded-lg border bg-card shadow-sm">
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
            <div className="overflow-x-auto">
              {successMessage ? (
                <div className="border-b bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              ) : null}
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Motorbike</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const canPay = order.status === "pending" || order.status === "confirmed";
                    return (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">#{order.customer_order_number}</td>
                        <td className="px-4 py-3">
                          {order.motorbike_detail?.model_detail
                            ? `${order.motorbike_detail.model_detail.brand} ${order.motorbike_detail.model_detail.model_name}`
                            : `Motorbike #${order.motorbike}`}
                        </td>
                        <td className="px-4 py-3">{money(order.amount ?? order.total_amount)}</td>
                        <td className="px-4 py-3 capitalize">{paymentText(order.payment_method)}</td>
                        <td className="px-4 py-3 capitalize">{statusText(order.status)}</td>
                        <td className="px-4 py-3">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {canPay ? (
                            <Button
                              size="sm"
                              className="rounded-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90"
                              onClick={() => openPayment(order)}
                            >
                              Complete Payment
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
    </main>
  );
}
