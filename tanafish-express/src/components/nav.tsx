"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fish, ShoppingBasket, LayoutDashboard, LogIn, LogOut, Store } from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b border-lake-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-lake-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lake-800 text-lime-400 shadow-sm">
            <Fish size={20} />
          </span>
          {t("brand")}
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold text-lake-700">
          <Link href="/marketplace" className="hover:text-lake-950 transition flex items-center gap-1.5">
            <Store size={16} /> {t("browse")}
          </Link>
          {user && (
            <Link href="/dashboard" className="hover:text-lake-950 transition flex items-center gap-1.5">
              <LayoutDashboard size={16} /> Workspace
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {right}

          {user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-lake-600 hover:bg-lake-100 transition"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lake-800 text-white px-3.5 text-xs font-semibold hover:bg-lake-700 transition shadow-sm"
            >
              <LogIn size={15} />
              <span>Sign In</span>
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
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-lime-500 px-1 text-[10px] font-bold text-lake-950">
          {count}
        </span>
      )}
    </Link>
  );
}