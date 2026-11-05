"use client";
import Link from "next/link";
import { Fish, ShoppingBasket } from "lucide-react";
import { LangToggle } from "./lang-toggle";
import { useI18n } from "@/lib/i18n";

export function TopNav({ right }: { right?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-lake-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-lake-800">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-lake-800 text-lime-400">
            <Fish size={18} />
          </span>
          {t("brand")}
        </Link>
        <div className="flex items-center gap-2">
          {right}
          <LangToggle />
        </div>
      </div>
    </header>
  );
}

export function CartLink({ count }: { count: number }) {
  return (
    <Link
      href="/checkout"
      className="relative grid h-9 w-9 place-items-center rounded-full bg-lake-50 text-lake-700 hover:bg-lake-100"
      aria-label="Cart"
    >
      <ShoppingBasket size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-lime-500 px-1 text-[10px] font-bold text-lake-950">
          {count}
        </span>
      )}
    </Link>
  );
}
