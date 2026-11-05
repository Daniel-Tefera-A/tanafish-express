"use client";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Waves, ChefHat, ShieldCheck, ArrowRight } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button, GlassCard } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { profileStore } from "@/lib/store";

export default function Landing() {
  const { t } = useI18n();
  const { status } = useSession();
  const router = useRouter();

  // First-time sign-in trigger: authenticated but no profile yet → role selection onboarding.
  useEffect(() => {
    if (status !== "authenticated") return;
    const p = profileStore.get();
    if (!p) router.replace("/onboarding");
    else router.replace(p.role === "HOTEL" ? "/hotel" : p.role === "DRIVER" ? "/driver" : "/marketplace");
  }, [status, router]);

  const values = [
    { icon: Waves, title: t("v1"), body: t("v1d") },
    { icon: ChefHat, title: t("v2"), body: t("v2d") },
    { icon: ShieldCheck, title: t("v3"), body: t("v3d") },
  ];

  return (
    <main>
      <section className="hero-bg wave relative overflow-hidden pb-24 text-white">
        <div className="relative z-10">
          <div className="[&_header]:border-white/10 [&_header]:bg-transparent [&_a]:text-white">
            <TopNav />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-14 md:pt-24">
          <p className="mb-3 inline-block rounded-full bg-lime-400/20 px-3 py-1 text-xs font-semibold tracking-wide text-lime-400">
            {t("tagline")}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-5 max-w-xl text-lg text-lake-100">{t("heroSub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => signIn("google")}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
                <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.5v5.4h7.1c4.1-3.8 6.5-9.4 6.5-15.9z" />
                <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.6C8.1 41.1 15.5 46 24 46z" />
                <path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3 .7-4.4v-5.6H4.5C3 17 2 20.400 2 24s1 7 2.500 10l7.300-5.600z" />
                <path fill="#EA4335" d="M24 10.700c3.200 0 6.100 1.100 8.400 3.300l6.300-6.300C34.900 4.100 29.900 2 24 2 15.500 2 8.100 6.900 4.500 14l7.300 5.600c1.700-5.200 6.500-8.900 12.200-8.900z" />
              </svg>
              {t("signInGoogle")}
            </Button>
            <Link href="/marketplace">
              <Button size="lg" variant="glass">
                {t("browse")} <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {values.map(({ icon: Icon, title, body }) => (
          <GlassCard key={title} className="relative z-10 p-5">
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
