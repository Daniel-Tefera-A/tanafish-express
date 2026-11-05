"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Banknote, Fish, MapPin, PackageCheck, Store } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useOrders, type Order } from "@/lib/store";
import { etb } from "@/lib/utils";

/** What the driver sees for each job: where to collect and where to drop. */
function route(o: Order) {
  if (o.type === "COOKED") return { from: o.hotelName ?? "Partner hotel", kind: "Hotel → Customer" };
  if (o.type === "BULK_B2B") return { from: "Fishermen Hub (Gende Wuha port)", kind: "Hub → Hotel" };
  return { from: "Fishermen Hub (Gende Wuha port)", kind: "Hub → Customer" };
}

export default function DriverPortal() {
  const { t } = useI18n();
  const { orders, setStatus } = useOrders();
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<string>("");
  const [earned, setEarned] = useState(0);

  // Pickup-ready jobs: raw/bulk once paid, cooked once the kitchen marks them ready.
  const toPickup = orders.filter(
    (o) => (o.type !== "COOKED" && o.status === "PAID") || (o.type === "COOKED" && o.status === "READY_FOR_PICKUP")
  );
  const inTransit = orders.filter((o) => o.status === "IN_TRANSIT");

  const deliver = (o: Order) => {
    if ((otpInput[o.id] ?? "") !== o.deliveryOtp) {
      setOtpError(o.id);
      return;
    }
    setOtpError("");
    setStatus(o.id, "DELIVERED");
    setEarned((e) => e + o.driverPayout);
  };

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-xl space-y-6 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">{t("driverFeed")}</h1>
          <Badge tone="lime"><Banknote size={12} className="mr-1" />{etb(earned)}</Badge>
        </div>

        <section className="space-y-3">
          {toPickup.length === 0 && inTransit.length === 0 && (
            <Card className="p-10 text-center text-lake-400">{t("noOrders")}</Card>
          )}

          {toPickup.map((o) => {
            const r = route(o);
            return (
              <Card key={o.id} className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold">#{o.id}</span>
                  <Badge>{r.kind}</Badge>
                </div>
                <p className="flex items-center gap-2 text-sm text-lake-700"><Store size={15} />{r.from}</p>
                <p className="flex items-center gap-2 text-sm text-lake-700"><MapPin size={15} />{o.address}</p>
                <p className="flex items-center gap-2 text-sm text-lake-500"><Fish size={15} />{o.lines.map((l) => `${l.label} ${l.weightKg}kg`).join(", ")}</p>

                {/* Verified pickup token — supplier / hotel scans the QR or reads the OTP */}
                <div className="flex items-center gap-4 rounded-xl bg-lake-50 p-3">
                  <QRCodeSVG value={`TF|${o.id}|${o.pickupToken}`} size={84} />
                  <div>
                    <p className="text-xs text-lake-500">{t("pickupToken")}</p>
                    <p className="font-mono text-3xl font-bold tracking-widest text-lake-900">{o.pickupToken}</p>
                    <p className="mt-1 text-xs text-lake-500">{t("payout")}: {etb(o.driverPayout)}</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setStatus(o.id, "IN_TRANSIT")}>{t("confirmPickup")}</Button>
              </Card>
            );
          })}

          {inTransit.map((o) => (
            <Card key={o.id} className="space-y-3 border-2 border-lime-500 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">#{o.id}</span>
                <Badge tone="lime">{t("enRoute")}</Badge>
              </div>
              <p className="flex items-center gap-2 text-sm text-lake-700"><MapPin size={15} />{o.address}</p>
              {o.lat && o.lng && (
                <a
                  className="text-sm font-semibold text-lake-600 underline"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps ↗
                </a>
              )}
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={t("enterOtp")}
                  value={otpInput[o.id] ?? ""}
                  onChange={(e) => setOtpInput((s) => ({ ...s, [o.id]: e.target.value }))}
                />
                <Button onClick={() => deliver(o)}><PackageCheck size={16} />{t("confirmDelivery")}</Button>
              </div>
              {otpError === o.id && <p className="text-sm text-red-600">Wrong OTP — ask the customer to check their order page.</p>}
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
