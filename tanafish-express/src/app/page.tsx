"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Waves, 
  ChefHat, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  ShoppingBag, 
  Anchor,
  CheckCircle2
} from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const { t } = useI18n();
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

  const values = [
    { 
      icon: Waves, 
      title: t("v1"), 
      body: t("v1d"), 
      tag: "Fresh Harvest"
    },
    { 
      icon: ChefHat, 
      title: t("v2"), 
      body: t("v2d"), 
      tag: "Top Bahir Dar Chefs"
    },
    { 
      icon: ShieldCheck, 
      title: t("v3"), 
      body: t("v3d"), 
      tag: "Escrow Code Handover"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav />

      {/* Hero Section */}
      <section className="bg-lake-900 text-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lake-800/80 px-3.5 py-1 text-xs font-semibold text-lime-300">
            <Anchor size={14} className="text-lime-400" />
            <span>{t("heroBadge")}</span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl text-white">
            {t("heroTitle")}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("heroSub")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="h-12 bg-lime-500 px-6 text-lake-950 hover:bg-lime-400 font-bold flex items-center gap-2 transition"
              >
                <ShoppingBag size={18} />
                <span>{t("browse")}</span>
                <ArrowRight size={16} />
              </Button>
            </Link>

            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-slate-700 bg-lake-800/60 px-6 font-semibold text-white hover:bg-lake-800 hover:text-white flex items-center gap-2"
                >
                  <User size={18} />
                  <span>{t("workspace")}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-slate-700 bg-lake-800/60 px-6 font-semibold text-white hover:bg-lake-800 hover:text-white flex items-center gap-2"
                >
                  <User size={18} />
                  <span>{t("signIn")}</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-800 pt-8 sm:grid-cols-4">
            <div>
              <p className="font-display text-xl font-bold text-lime-400">100%</p>
              <p className="text-xs text-slate-400">Lake Tana Fresh Catch</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">4 Landing Ports</p>
              <p className="text-xs text-slate-400">Gende Wuha, Mangie, Shimbit, Gorgora</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-lime-400">Direct</p>
              <p className="text-xs text-slate-400">Fair Fisherman Cooperative Pricing</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">Verified</p>
              <p className="text-xs text-slate-400">Doorstep OTP Handover</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body, tag }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-lake-900 text-lime-400">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {tag}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-lake-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-lake-900">
                <CheckCircle2 size={14} className="text-lime-600" />
                <span>Verified Quality Standards</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}