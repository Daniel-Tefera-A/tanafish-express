"use client";
import { useEffect, useRef, useState } from "react";
import { BellRing, ChefHat, Volume2, VolumeX, Package, UtensilsCrossed, Loader2 } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { DISH_STYLES, FISH, HOTELS, PAYMENT_METHODS, type FishType, type PaymentMethod } from "@/lib/data";
import { profileStore, useOrders } from "@/lib/store";
import { ringBell, subscribe } from "@/lib/realtime";
import { cn, etb } from "@/lib/utils";

type Tab = "kds" | "menu" | "bulk";
type MenuRow = { id: string; name: string; fish: string; fee: number; available: boolean };

const defaultMenu = (hotelId: string): MenuRow[] => {
  const h = HOTELS.find((x) => x.id === hotelId) ?? HOTELS[0];
  return DISH_STYLES.map((d) => ({ id: d.id, name: d.name, fish: "Tilapia", fee: h.fees[d.id], available: true }));
};

export default function HotelPortal() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("kds");
  // Demo: the signed-in hotel is picked here. In production this comes from hotels.user_id = session user.
  const [hotelId, setHotelId] = useState(HOTELS[0].id);
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  const profile = typeof window !== "undefined" ? profileStore.get() : null;

  const tabs: { id: Tab; icon: typeof ChefHat; label: string }[] = [
    { id: "kds", icon: ChefHat, label: t("kds") },
    { id: "menu", icon: UtensilsCrossed, label: t("menuMgmt") },
    { id: "bulk", icon: Package, label: t("bulkOrder") },
  ];

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-lake-900">{t("hotelDash")}</h1>
            <p className="text-sm text-lake-500">{profile?.businessName || hotel.name}</p>
          </div>
          <div className="w-56">
            <Label>Demo hotel</Label>
            <Select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
              {HOTELS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </Select>
          </div>
        </div>

        <div role="tablist" className="mb-5 grid grid-cols-3 rounded-2xl bg-lake-100/60 p-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition sm:text-sm",
                tab === id ? "bg-white text-lake-900 shadow" : "text-lake-600"
              )}
            >
              <Icon size={16} /> <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {tab === "kds" && <Kds hotelId={hotelId} />}
        {tab === "menu" && <MenuManager key={hotelId} hotelId={hotelId} />}
        {tab === "bulk" && <BulkOrder hotelId={hotelId} kebele={hotel.kebele} />}
      </main>
    </>
  );
}

/* ───────── Kitchen Display System ───────── */
function Kds({ hotelId }: { hotelId: string }) {
  const { t } = useI18n();
  const { orders, setStatus } = useOrders();
  const [sound, setSound] = useState(false);
  const [flash, setFlash] = useState(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  // Audio-visual alert whenever a new paid order arrives (cross-tab in the demo; Supabase Realtime in prod).
  useEffect(
    () =>
      subscribe((m) => {
        if (m.type !== "orders-changed" || !m.newOrderId) return;
        const incoming = JSON.parse(localStorage.getItem("tf_orders") || "[]").find(
          (o: { id: string; type: string; hotelId?: string }) =>
            o.id === m.newOrderId && o.type === "COOKED" && o.hotelId === hotelId
        );
        if (!incoming) return;
        setFlash(true);
        setTimeout(() => setFlash(false), 4000);
        if (soundRef.current) ringBell();
        navigator.vibrate?.([200, 100, 200]);
      }),
    [hotelId]
  );

  const tickets = orders
    .filter((o) => o.type === "COOKED" && o.hotelId === hotelId && ["PAID", "PREPARING"].includes(o.status))
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge tone={flash ? "red" : "lake"} className={cn(flash && "animate-pulse")}>
          <BellRing size={12} className="mr-1" /> {tickets.length}
        </Badge>
        <Button
          size="sm"
          variant={sound ? "dark" : "outline"}
          onClick={() => {
            setSound(!sound);
            if (!sound) ringBell(); // user gesture unlocks audio
          }}
        >
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {sound ? t("soundOn") : t("soundOff")}
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-10 text-center text-lake-400">{t("noOrders")}</Card>
      ) : (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", flash && "[&>*:first-child]:ring-4 [&>*:first-child]:ring-lime-400")}>
          {tickets.map((o) => {
            const mins = Math.max(0, Math.floor((Date.now() - o.createdAt) / 60000));
            return (
              <Card key={o.id} className={cn("flex flex-col border-2", o.status === "PAID" ? "border-amber-300" : "border-lime-500")}>
                <div className={cn("flex items-center justify-between px-4 py-2 text-sm font-bold", o.status === "PAID" ? "bg-amber-100 text-amber-800" : "bg-lime-400/30 text-lake-900")}>
                  <span>#{o.id}</span>
                  <span>{mins} min</span>
                </div>
                <ul className="flex-1 space-y-1 p-4">
                  {o.lines.map((l, i) => (
                    <li key={i} className="font-semibold text-lake-900">
                      {l.dish ?? l.label} <span className="font-normal text-lake-500">· {l.weightKg} kg</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 pt-0">
                  {o.status === "PAID" ? (
                    <Button className="w-full" onClick={() => setStatus(o.id, "PREPARING")}>{t("accept")}</Button>
                  ) : (
                    <Button className="w-full" variant="dark" onClick={() => setStatus(o.id, "READY_FOR_PICKUP")}>
                      {t("ready")}
                    </Button>
                  )}
                  {o.status === "PREPARING" && (
                    <p className="mt-2 text-center text-xs text-lake-500">{t("pickupToken")}: <b className="font-mono">{o.pickupToken}</b></p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────── Menu management ───────── */
function MenuManager({ hotelId }: { hotelId: string }) {
  const { t } = useI18n();
  const storageKey = `tf_menu_${hotelId}`;
  const [rows, setRows] = useState<MenuRow[]>(() => defaultMenu(hotelId));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setRows(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const update = (id: string, patch: Partial<MenuRow>) => {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setRows(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-lake-50 text-xs uppercase tracking-wide text-lake-500">
            <tr>
              <th className="px-4 py-3">{t("dishStyle")}</th>
              <th className="px-4 py-3">{t("prepFee")} (ETB)</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lake-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold text-lake-900">{r.fish} · {r.name}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={0}
                    className="h-9 w-28"
                    value={r.fee}
                    onChange={(e) => update(r.id, { fee: Number(e.target.value) })}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    role="switch"
                    aria-checked={r.available}
                    onClick={() => update(r.id, { available: !r.available })}
                    className="flex items-center gap-2"
                  >
                    <span className={cn("relative h-6 w-11 rounded-full transition", r.available ? "bg-lime-500" : "bg-lake-200")}>
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", r.available ? "left-[22px]" : "left-0.5")} />
                    </span>
                    <Badge tone={r.available ? "lime" : "red"}>{r.available ? t("available") : t("outOfStock")}</Badge>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────── B2B bulk raw-fish order ───────── */
function BulkOrder({ hotelId, kebele }: { hotelId: string; kebele: string }) {
  const { t } = useI18n();
  const { create, setStatus } = useOrders();
  const [fishId, setFishId] = useState(FISH[0].id);
  const [kg, setKg] = useState(20);
  const [method, setMethod] = useState<PaymentMethod>("CBE_BIRR");
  const [busy, setBusy] = useState(false);
  const [doneRef, setDoneRef] = useState("");
  const fish = FISH.find((f) => f.id === fishId)!;
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  // Bulk discount: 5% from 20 kg, 10% from 50 kg.
  const discount = kg >= 50 ? 0.1 : kg >= 20 ? 0.05 : 0;
  const total = Math.round(fish.pricePerKg * kg * (1 - discount));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const order = create({
      type: "BULK_B2B",
      hotelId,
      hotelName: hotel.name,
      lines: [{ label: fish.name, fishType: fish.type as FishType, weightKg: kg, prep: "WHOLE", price: total }],
      total,
      address: `${hotel.name}, ${kebele} (kitchen)`,
      paymentMethod: method,
    });
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: method, amount: total, orderId: order.id }),
    }).then((r) => r.json());
    if (res.status === "SUCCESS") {
      setStatus(order.id, "PAID", { txRef: res.transactionRef });
      setDoneRef(order.id);
    }
    setBusy(false);
  };

  return (
    <Card className="mx-auto max-w-lg p-5">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Fish</Label>
          <Select value={fishId} onChange={(e) => setFishId(e.target.value)}>
            {FISH.map((f) => <option key={f.id} value={f.id}>{f.name} — {etb(f.pricePerKg)}/kg</option>)}
          </Select>
        </div>
        <div>
          <Label>{t("weight")}</Label>
          <Input type="number" min={5} step={5} value={kg} onChange={(e) => setKg(Number(e.target.value))} />
          {discount > 0 && <p className="mt-1 text-xs text-lime-600">Bulk discount −{discount * 100}%</p>}
        </div>
        <div>
          <Label>{t("paymentMethod")}</Label>
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </Select>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" size={18} />} {t("payNow")} · {etb(total)}
        </Button>
        {doneRef && <p className="text-center text-sm font-semibold text-lime-600">✓ #{doneRef} — {t("placed")}</p>}
      </form>
    </Card>
  );
}
