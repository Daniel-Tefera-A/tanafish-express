"use client";
import { Check, ChefHat, ClipboardList, PackageCheck, Bike } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS: { key: Key; icon: typeof Check; reached: OrderStatus[] }[] = [
  { key: "placed", icon: ClipboardList, reached: ["PAID", "PREPARING", "READY_FOR_PICKUP", "IN_TRANSIT", "DELIVERED"] },
  { key: "kitchen", icon: ChefHat, reached: ["PREPARING", "READY_FOR_PICKUP", "IN_TRANSIT", "DELIVERED"] },
  { key: "enRoute", icon: Bike, reached: ["IN_TRANSIT", "DELIVERED"] },
  { key: "delivered", icon: PackageCheck, reached: ["DELIVERED"] },
];

/** Placed → Kitchen Preparing → Driver En Route → Delivered */
export function OrderTracker({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  const doneCount = STEPS.filter((s) => s.reached.includes(status)).length;
  return (
    <ol className="relative flex justify-between">
      <div className="absolute left-6 right-6 top-5 h-1 rounded bg-lake-100" aria-hidden />
      <div
        className="absolute left-6 top-5 h-1 rounded bg-lime-500 transition-all duration-700"
        style={{ width: `calc((100% - 3rem) * ${Math.max(0, doneCount - 1) / (STEPS.length - 1)})` }}
        aria-hidden
      />
      {STEPS.map((s, i) => {
        const done = s.reached.includes(status);
        const active = done && i === doneCount - 1 && status !== "DELIVERED";
        const Icon = done && !active ? Check : s.icon;
        return (
          <li key={s.key} className="relative z-10 flex w-20 flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border-2 transition",
                done ? "border-lime-500 bg-lime-500 text-lake-950" : "border-lake-200 bg-white text-lake-300",
                active && "animate-pulse-ring"
              )}
            >
              <Icon size={18} />
            </span>
            <span className={cn("text-xs font-semibold", done ? "text-lake-800" : "text-lake-300")}>{t(s.key)}</span>
          </li>
        );
      })}
    </ol>
  );
}
