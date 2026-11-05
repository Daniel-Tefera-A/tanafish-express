"use client";
import Link from "next/link";
import { KeyRound, MapPin, Receipt } from "lucide-react";
import { TopNav } from "@/components/nav";
import { OrderTracker } from "@/components/order-tracker";
import { Badge, Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useOrders } from "@/lib/store";
import { etb } from "@/lib/utils";

export default function OrderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useI18n();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === id);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-xl space-y-4 px-4 py-6">
        {!order ? (
          <p className="py-16 text-center text-lake-500">Order {id} not found on this device.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold">#{order.id}</h1>
              <Badge tone="lime">{order.status.replace(/_/g, " ")}</Badge>
            </div>

            <Card className="p-5">
              <OrderTracker status={order.status} />
            </Card>

            {order.status !== "DELIVERED" && order.status !== "PENDING_PAYMENT" && (
              <Card className="flex items-center gap-4 bg-lake-900 p-5 text-white">
                <KeyRound className="text-lime-400" />
                <div>
                  <p className="text-xs text-lake-200">{t("deliveryOtp")}</p>
                  <p className="font-mono text-3xl font-bold tracking-[0.3em]">{order.deliveryOtp}</p>
                </div>
              </Card>
            )}

            <Card className="space-y-3 p-5 text-sm">
              <p className="flex items-center gap-2 text-lake-600"><MapPin size={15} />{order.address}</p>
              <ul className="divide-y divide-lake-100">
                {order.lines.map((l, i) => (
                  <li key={i} className="flex justify-between py-2">
                    <span>{l.label} · {l.weightKg} kg</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-lake-100 pt-3 font-bold">
                <span className="flex items-center gap-2"><Receipt size={15} />{order.paymentMethod} · {order.txRef}</span>
                <span>{etb(order.total)}</span>
              </div>
            </Card>

            <Link href="/marketplace"><Button variant="outline" className="w-full">{t("browse")}</Button></Link>
          </>
        )}
      </main>
    </>
  );
}
