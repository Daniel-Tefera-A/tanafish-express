"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fish, ShoppingBasket, LayoutDashboard, LogIn, LogOut, Store, Sparkles } from "lucide-react";
import { LangToggle } from "./lang-toggle";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export function TopNav({ right }: { right?: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-lake-100/70 bg-white/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand identity with natural ripple glow */}
        <Link href="/" className="group flex items-center gap-2.5 transition">
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-lake-800 to-lake-950 text-lime-400 shadow-md transition-transform group-hover:scale-105">
            <Fish size={22} className="transition-transform group-hover:rotate-6" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 ring-2 ring-white" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-lake-950 group-hover:text-lake-700">
              {t("brand")}
            </span>
            <span className="hidden text-[10px] font-medium tracking-wide text-lake-500 sm:block">
              Bahir Dar · Lake Tana
            </span>
          </div>
        </Link>

        {/* Center menu */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-lake-700 hover:bg-lake-50 hover:text-lake-950 transition"
          >
            <Store size={17} className="text-lake-500" />
            <span>{t("browse")}</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-lake-700 hover:bg-lake-50 hover:text-lake-950 transition"
            >
              <LayoutDashboard size={17} className="text-lime-600" />
              <span>{t("workspace")}</span>
            </Link>
          )}
        </nav>

        {/* Right side tools */}
        <div className="flex items-center gap-2.5">
          {right}

          {user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-lake-200/80 bg-white px-3 text-xs font-semibold text-lake-600 shadow-sm hover:bg-lake-50 hover:text-red-600 transition"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">{t("signOut")}</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-lake-900 to-lake-800 px-4 text-xs font-bold text-white shadow-md hover:from-lake-800 hover:to-lake-700 transition"
            >
              <LogIn size={14} className="text-lime-400" />
              <span>{t("signIn")}</span>
            </Link>
          )}

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
      className="relative grid h-9 w-9 place-items-center rounded-full bg-lake-50 text-lake-700 hover:bg-lake-100 transition"
      aria-label="Cart"
    >
      <ShoppingBasket size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-lime-500 px-1 text-[10px] font-bold text-lake-950 shadow-sm">
          {count}
        </span>
      )}
    </Link>
  );
}