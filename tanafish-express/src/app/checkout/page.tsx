"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Trash2, Lock } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { LocationPicker } from "@/components/location-picker";
import { useI18n } from "@/lib/i18n";
import { DELIVERY_FEE, KEBELES, PAYMENT_METHODS, type PaymentMethod } from "@/lib/data";
import { cartStore, profileStore, useOrders, type Cart } from "@/lib/store";
import { cn, etb } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { create, setStatus } = useOrders();

  const [cart, setCart] = useState<Cart | null>(null);
  const [kebele, setKebele] = useState(params.get("kebele") ?? "");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number }>();
  const [method, setMethod] = useState<PaymentMethod>("TELEBIRR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCart(cartStore.get());
    const p = profileStore.get();
    if (p) {
      setKebele((k) => k || p.kebele || "");
      setAddress(p.address ?? "");
    }
  }, []);

  if (!cart || cart.lines.length === 0) {
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-xl px-4 py-16 text-center text-lake-500">{t("cart")} — 0</main>
      </>
    );
  }

  const subtotal = cart.lines.reduce((s, l) => s + l.price, 0);
  const total = subtotal + DELIVERY_FEE;

  const removeLine = (i: number) => {
    const lines = cart.lines.filter((_, idx) => idx !== i);
    const next = lines.length ? { ...cart, lines } : null;
    cartStore.set(next);
    setCart(next);
  };

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // All orders are paid upfront: create as PENDING_PAYMENT, only advance to PAID on gateway success.
    const order = create({
      type: cart.type,
      hotelId: cart.hotelId,
      hotelName: cart.hotelName,
      lines: cart.lines,
      total,
      address: `${kebele}${address ? " — " + address : ""}`,
      lat: pin?.lat,
      lng: pin?.lng,
      paymentMethod: method,
    });
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: method, amount: total, orderId: order.id }),
      });
      const data = await res.json();
      if (data.status !== "SUCCESS") throw new Error(data.error ?? "Payment failed");
      // RAW orders go straight to dispatch; COOKED orders ring the hotel's KDS first.
      setStatus(order.id, "PAID", { txRef: data.transactionRef });
      cartStore.set(null);
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <TopNav />
      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-[1fr_340px]">
        <form id="pay" onSubmit={pay} className="space-y-5">
          <Card className="space-y-4 p-5">
            <div>
              <Label>{t("chooseKebele")}</Label>
              <Select required value={kebele} onChange={(e) => setKebele(e.target.value)}>
                <option value="" disabled>—</option>
                {KEBELES.map((k) => <option key={k}>{k}</option>)}
              </Select>
            </div>
            <div>
              <Label>{t("deliveryAddress")}</Label>
              <Input required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <LocationPicker value={pin} onChange={setPin} />
          </Card>

          <Card className="p-5">
            <Label>{t("paymentMethod")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "h-14 rounded-xl border-2 text-sm font-bold transition",
                    method === m.id ? "border-lime-500 bg-lime-400/15 text-lake-900" : "border-lake-100 text-lake-600"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-lake-500">
              <Lock size={12} /> {t("payUpfront")}
            </p>
          </Card>
        </form>

        <Card className="h-fit p-5 md:sticky md:top-20">
          <h2 className="mb-3 font-display text-lg font-bold">{t("cart")}</h2>
          <ul className="space-y-3">
            {cart.lines.map((l, i) => (
              <li key={i} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold text-lake-900">{l.label}</p>
                  <p className="text-xs text-lake-500">
                    {l.weightKg} kg{l.prep ? ` · ${l.prep.toLowerCase()}` : ""}
                    {cart.hotelName ? ` · ${cart.hotelName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{etb(l.price)}</span>
                  <button onClick={() => removeLine(i)} aria-label="Remove" className="text-lake-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-lake-100 pt-3 text-sm">
            <div className="flex justify-between text-lake-600"><span>Subtotal</span><span>{etb(subtotal)}</span></div>
            <div className="flex justify-between text-lake-600"><span>Delivery</span><span>{etb(DELIVERY_FEE)}</span></div>
            <div className="flex justify-between pt-1 text-base font-bold text-lake-900"><span>{t("total")}</span><span>{etb(total)}</span></div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button form="pay" type="submit" size="lg" className="mt-4 w-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : null}
            {t("payNow")} · {etb(total)}
          </Button>
        </Card>
      </main>
    </>
  );
}
