"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Waves, ChefHat, ShieldCheck, ArrowRight, User, ShoppingBag } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button, GlassCard } from "@/components/ui";
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
    { icon: Waves, title: t("v1"), body: t("v1d") },
    { icon: ChefHat, title: t("v2"), body: t("v2d") },
    { icon: ShieldCheck, title: t("v3"), body: t("v3d") },
  ];

  return (
    <main>
      <section className="hero-bg wave relative overflow-hidden pb-28 text-white">
        <div className="relative z-10">
          <div className="[&_header]:border-white/10 [&_header]:bg-transparent [&_a]:text-white">
            <TopNav />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-20">
          <p className="mb-3 inline-block rounded-full bg-lime-400/20 px-3 py-1 text-xs font-semibold tracking-wide text-lime-400">
            {t("tagline")}
          </p>

          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-5 max-w-xl text-lg text-lake-100 leading-relaxed">
            {t("heroSub")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace">
              <Button size="lg" className="bg-lime-500 text-lake-950 hover:bg-lime-400 flex items-center gap-2">
                <ShoppingBag size={18} />
                {t("browse")}
                <ArrowRight size={18} />
              </Button>
            </Link>

            {user ? (
              <Link href="/dashboard">
                <Button size="lg" variant="glass" className="flex items-center gap-2">
                  <User size={18} />
                  My Workspace
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="lg" variant="glass" className="flex items-center gap-2">
                  <User size={18} />
                  Sign In / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {values.map(({ icon: Icon, title, body }) => (
          <GlassCard key={title} className="relative z-10 p-5 bg-white/80 backdrop-blur border border-lake-100 shadow-md">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-lake-800 text-lime-400">
              <Icon size={22} />
            </span>
            <h3 className="font-display text-lg font-bold text-lake-900">{title}</h3>
            <p className="mt-1 text-sm text-lake-600">{body}</p>
          </GlassCard>
        ))}
      </section>
    </main>
  );
}