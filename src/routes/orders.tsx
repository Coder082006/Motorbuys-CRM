import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerRoute } from "../context/AuthContext";
import { getMyOrders, type ShopOrder } from "../lib/api/shop";
import { formatCurrency } from "../lib/utils/formatters";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "My Orders - Motorbuy" }] }),
});

function money(value: string | number) {
  return formatCurrency(value);
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Motorbike</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3">
                        {order.motorbike_detail?.model_detail
                          ? `${order.motorbike_detail.model_detail.brand} ${order.motorbike_detail.model_detail.model_name}`
                          : `Motorbike #${order.motorbike}`}
                      </td>
                      <td className="px-4 py-3">{money(order.total_amount)}</td>
                      <td className="px-4 py-3 capitalize">
                        {order.payment_method.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 capitalize">{order.status.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
