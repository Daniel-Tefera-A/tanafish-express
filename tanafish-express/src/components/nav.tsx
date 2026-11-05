"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fish, Store, LayoutDashboard, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { LangToggle } from "./lang-toggle";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export function TopNav() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (data) setRole(data.role);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lake-900 text-lime-400">
            <Fish size={22} />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-lake-950">
              {t("brand")}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Bahir Dar
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            <Store size={16} className="text-slate-500" />
            <span>{t("browse")}</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
            >
              <LayoutDashboard size={16} className="text-lake-700" />
              <span>{t("workspace")}</span>
            </Link>
          )}

          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-lake-900 bg-lime-400/20 hover:bg-lime-400/30 transition"
            >
              <ShieldCheck size={16} className="text-lake-800" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-lake-900 px-3.5 text-xs font-bold text-white hover:bg-lake-800 transition"
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