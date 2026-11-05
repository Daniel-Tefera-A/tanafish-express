"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Star, Flame } from "lucide-react";
import { CartLink, TopNav } from "@/components/nav";
import { Badge, Button, Card, Label, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { DISH_STYLES, FISH, HOTELS, KEBELES, PREP_FEE, type Prep } from "@/lib/data";
import { cartStore, type Cart, type OrderLine } from "@/lib/store";
import { cn, etb } from "@/lib/utils";

type Tab = "raw" | "cooked";

export default function Marketplace() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("raw");
  const [kebele, setKebele] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => setCartCount(cartStore.get()?.lines.length ?? 0), []);

  const addToCart = (cartType: Cart["type"], line: OrderLine, hotel?: { id: string; name: string }) => {
    const existing = cartStore.get();
    const sameKind = existing && existing.type === cartType && existing.hotelId === hotel?.id;
    const next: Cart = sameKind
      ? { ...existing!, lines: [...existing!.lines, line] }
      : { type: cartType, hotelId: hotel?.id, hotelName: hotel?.name, lines: [line] };
    cartStore.set(next);
    setCartCount(next.lines.length);
  };

  return (
    <>
      <TopNav right={<CartLink count={cartCount} />} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label>{t("deliverTo")}</Label>
            <Select value={kebele} onChange={(e) => setKebele(e.target.value)}>
              <option value="">{t("chooseKebele")}</option>
              {KEBELES.map((k) => <option key={k}>{k}</option>)}
            </Select>
          </div>
        </div>

        <div role="tablist" className="mb-5 grid grid-cols-2 rounded-2xl bg-lake-100/60 p-1">
          {(["raw", "cooked"] as Tab[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={cn(
                "h-11 rounded-xl text-sm font-semibold transition",
                tab === k ? "bg-white text-lake-900 shadow" : "text-lake-600"
              )}
            >
              {k === "raw" ? t("rawTab") : t("cookedTab")}
            </button>
          ))}
        </div>

        {tab === "raw" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FISH.map((fish) => (
              <RawCard key={fish.id} fish={fish} onAdd={(l) => addToCart("RAW", l)} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-lake-600">{t("preparedBy")}</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {HOTELS.map((h) => (
                <CookedCard
                  key={h.id}
                  hotel={h}
                  lang={lang}
                  onAdd={(l) => addToCart("COOKED", l, { id: h.id, name: h.name })}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-lake-100 bg-white/90 p-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <span className="text-sm font-semibold text-lake-700">
              {t("cart")} · {cartCount}
            </span>
            <Button onClick={() => router.push("/checkout" + (kebele ? `?kebele=${encodeURIComponent(kebele)}` : ""))}>
              {t("checkout")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function RawCard({ fish, onAdd }: { fish: (typeof FISH)[number]; onAdd: (l: OrderLine) => void }) {
  const { t, lang } = useI18n();
  const [kg, setKg] = useState(1);
  const [prep, setPrep] = useState<Prep>("WHOLE");
  const [added, setAdded] = useState(false);
  const price = useMemo(() => Math.round((fish.pricePerKg + PREP_FEE[prep]) * kg), [fish, prep, kg]);
  const prepLabel: Record<Prep, string> = { WHOLE: t("whole"), GUTTED: t("gutted"), FILLETED: t("filleted") };

  return (
    <Card className="flex flex-col">
      <div className="relative h-40 bg-lake-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fish.img} alt={fish.name} loading="lazy" className="h-full w-full object-cover" />
        <Badge tone="lime" className="absolute left-3 top-3 bg-white/90">{fish.stockKg} kg</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-bold text-lake-900">{lang === "am" ? fish.nameAm : fish.name}</h3>
          <p className="text-sm text-lake-500">{fish.local} · {etb(fish.pricePerKg)}/kg</p>
        </div>

        <div>
          <Label>{t("weight")}</Label>
          <div className="flex gap-1.5">
            {[0.5, 1, 2, 3, 5].map((w) => (
              <button
                key={w}
                onClick={() => setKg(w)}
                className={cn(
                  "h-9 flex-1 rounded-lg border text-sm font-semibold",
                  kg === w ? "border-lime-500 bg-lime-400/20 text-lake-900" : "border-lake-200 text-lake-600"
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>{t("prep")}</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(prepLabel) as Prep[]).map((p) => (
              <button
                key={p}
                onClick={() => setPrep(p)}
                className={cn(
                  "h-9 rounded-lg border text-xs font-semibold",
                  prep === p ? "border-lime-500 bg-lime-400/20 text-lake-900" : "border-lake-200 text-lake-600"
                )}
              >
                {prepLabel[p]}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="mt-auto"
          onClick={() => {
            onAdd({ label: fish.name, fishType: fish.type, weightKg: kg, prep, price });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
        >
          {added ? "✓" : `${t("addToCart")} · ${etb(price)}`}
        </Button>
      </div>
    </Card>
  );
}

function CookedCard({
  hotel,
  lang,
  onAdd,
}: {
  hotel: (typeof HOTELS)[number];
  lang: string;
  onAdd: (l: OrderLine) => void;
}) {
  const { t } = useI18n();
  const [dish, setDish] = useState(DISH_STYLES[0].id);
  const [added, setAdded] = useState(false);
  const fish = FISH[0];
  const kg = 1;
  const style = DISH_STYLES.find((d) => d.id === dish)!;
  const price = fish.pricePerKg * kg + hotel.fees[dish];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-lake-900">{hotel.name}</h3>
          <p className="flex items-center gap-1 text-sm text-lake-500"><MapPin size={13} /> {hotel.kebele}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone="amber"><Star size={12} className="mr-1 fill-current" />{hotel.rating}</Badge>
          <Badge><Clock size={12} className="mr-1" />{hotel.prepMinutes} {t("prepTime")}</Badge>
        </div>
      </div>

      <Label>{t("dishStyle")}</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {DISH_STYLES.map((d) => (
          <button
            key={d.id}
            onClick={() => setDish(d.id)}
            className={cn(
              "flex h-11 items-center justify-center gap-1 rounded-lg border px-2 text-center text-xs font-semibold leading-tight",
              dish === d.id ? "border-lime-500 bg-lime-400/20 text-lake-900" : "border-lake-200 text-lake-600"
            )}
          >
            {d.id === "dulet" && <Flame size={13} />}
            {lang === "am" ? d.nameAm : d.name}
          </button>
        ))}
      </div>

      <Button
        className="mt-4 w-full"
        onClick={() => {
          onAdd({ label: `${style.name} · ${fish.name}`, fishType: fish.type, weightKg: kg, dish: style.name, price });
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
      >
        {added ? "✓" : `${t("addToCart")} · ${etb(price)}`}
      </Button>
    </Card>
  );
}
