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
  MapPin, 
  Anchor, 
  HeartHandshake, 
  CheckCircle2, 
  Clock, 
  Fish 
} from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function Landing() {
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
      tag: "Fresh Harvest",
      color: "from-cyan-500 to-blue-600" 
    },
    { 
      icon: ChefHat, 
      title: t("v2"), 
      body: t("v2d"), 
      tag: "Top Bahir Dar Chefs",
      color: "from-amber-500 to-orange-600" 
    },
    { 
      icon: ShieldCheck, 
      title: t("v3"), 
      body: t("v3d"), 
      tag: "Secure Escrow",
      color: "from-lime-500 to-emerald-600" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6fafc]">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-lake-950 via-lake-900 to-lake-950 px-4 py-2 text-center text-xs font-medium text-lake-100 border-b border-lake-800/80">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-ping" />
          <span>{t("liveTicker")}</span>
        </span>
      </div>

      {/* Hero Section */}
      <section className="hero-bg lake-water-texture wave-divider relative overflow-hidden pb-32 pt-4 text-white">
        <div className="relative z-20">
          <div className="[&_header]:border-white/10 [&_header]:bg-transparent [&_header_a]:text-white [&_header_span]:text-white">
            <TopNav />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 md:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lake-900/60 px-4 py-1.5 text-xs font-semibold text-lime-300 backdrop-blur-md shadow-sm">
            <Anchor size={14} className="text-lime-400" />
            <span>{t("heroBadge")}</span>
            <span className="rounded-full bg-lime-400/20 px-1.5 py-0.2 text-[10px] text-lime-300">Live</span>
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.18] tracking-tight sm:text-5xl md:text-6xl text-white">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-lake-100/90 sm:text-lg">
            {t("heroSub")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="h-13 bg-lime-500 px-7 text-lake-950 hover:bg-lime-400 font-bold shadow-lg shadow-lime-500/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag size={19} />
                <span>{t("browse")}</span>
                <ArrowRight size={18} />
              </Button>
            </Link>

            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="glass"
                  className="h-13 border-white/30 bg-white/10 px-6 font-semibold text-white backdrop-blur-md hover:bg-white/20 flex items-center gap-2"
                >
                  <User size={18} />
                  <span>{t("workspace")}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="glass"
                  className="h-13 border-white/30 bg-white/10 px-6 font-semibold text-white backdrop-blur-md hover:bg-white/20 flex items-center gap-2"
                >
                  <User size={18} />
                  <span>{t("signIn")}</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 sm:grid-cols-4 sm:gap-6">
            <div>
              <p className="font-display text-2xl font-black text-lime-400">100%</p>
              <p className="text-xs text-lake-200">Wild Lake Tana Catch</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-white">4 Ports</p>
              <p className="text-xs text-lake-200">Gende Wuha, Mangie, Shimbit, Gorgora</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-lime-400">{"< 45 min"}</p>
              <p className="text-xs text-lake-200">Average Delivery in Bahir Dar</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-white">Telebirr & CBE</p>
              <p className="text-xs text-lake-200">Verified Doorstep Handover</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="relative z-20 mx-auto -mt-14 max-w-6xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body, tag, color }) => (
            <div
              key={title}
              className="glass-effect rounded-3xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr ${color} text-white shadow-md`}>
                    <Icon size={24} />
                  </span>
                  <span className="rounded-full bg-lake-100/70 px-3 py-1 text-[11px] font-bold text-lake-700">
                    {tag}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-lake-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lake-600">{body}</p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-lake-800">
                <CheckCircle2 size={15} className="text-lime-600" />
                <span>Verified Quality Standards</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Dish & Catch Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lime-600">
              Bahir Dar Favorites
            </span>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-lake-950">
              Popular Catches & Hot Dishes
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-lake-800 hover:text-lime-600 transition"
          >
            <span>{t("browse")}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Qurso Tilapia */}
          <div className="group overflow-hidden rounded-3xl border border-lake-100 bg-white shadow-md hover:shadow-xl transition flex flex-col">
            <div className="relative h-48 bg-lake-200 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=700&q=70&auto=format"
                alt="Tilapia Qurso"
                className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
