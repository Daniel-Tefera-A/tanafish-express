"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Hotel as HotelIcon, Bike, Upload } from "lucide-react";
import { TopNav } from "@/components/nav";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { KEBELES } from "@/lib/data";
import { profileStore, type Profile } from "@/lib/store";
import { cn } from "@/lib/utils";

type Role = Profile["role"];

export default function Onboarding() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [role, setRole] = useState<Role>("INDIVIDUAL");
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const roles: { id: Role; icon: typeof User; label: string }[] = [
    { id: "INDIVIDUAL", icon: User, label: t("individual") },
    { id: "HOTEL", icon: HotelIcon, label: t("hotel") },
    { id: "DRIVER", icon: Bike, label: t("driver") },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: Profile = {
      role,
      fullName: f.fullName || session?.user?.name || "",
      phone: f.phone,
      kebele: f.kebele,
      address: f.address,
      businessName: f.businessName,
      tin: f.tin,
      contact: f.contact,
      capacity: f.capacity ? Number(f.capacity) : undefined,
      vehicle: (f.vehicle as Profile["vehicle"]) || undefined,
    };
    profileStore.set(profile);
    await fetch("/api/onboarding", { method: "POST", body: JSON.stringify(profile) }).catch(() => {});
    await update?.({ role }).catch(() => {});
    router.replace(role === "HOTEL" ? "/hotel" : role === "DRIVER" ? "/driver" : "/marketplace");
  };

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-lake-900">{t("onboardingTitle")}</h1>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {roles.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center text-sm font-semibold transition",
                role === id ? "border-lime-500 bg-lime-400/15 text-lake-900" : "border-lake-100 bg-white text-lake-600"
              )}
            >
              <Icon size={24} />
              {label}
            </button>
          ))}
        </div>

        <Card className="mt-5 p-5">
          <form onSubmit={submit} className="space-y-4">
            {role === "INDIVIDUAL" && (
              <>
                <div><Label>{t("fullName")}</Label><Input required value={f.fullName ?? session?.user?.name ?? ""} onChange={set("fullName")} /></div>
                <div><Label>{t("phone")}</Label><Input required type="tel" placeholder="09XXXXXXXX" pattern="(09|07)\d{8}" onChange={set("phone")} /></div>
                <div>
                  <Label>{t("chooseKebele")}</Label>
                  <Select required value={f.kebele ?? ""} onChange={set("kebele")}>
                    <option value="" disabled>—</option>
                    {KEBELES.map((k) => <option key={k}>{k}</option>)}
                  </Select>
                </div>
                <div><Label>{t("deliveryAddress")}</Label><Input required onChange={set("address")} /></div>
              </>
            )}

            {role === "HOTEL" && (
              <>
                <div><Label>{t("businessName")}</Label><Input required onChange={set("businessName")} /></div>
                <div><Label>{t("tin")}</Label><Input required inputMode="numeric" onChange={set("tin")} /></div>
                <div>
                  <Label>{t("chooseKebele")}</Label>
                  <Select required value={f.kebele ?? ""} onChange={set("kebele")}>
                    <option value="" disabled>—</option>
                    {KEBELES.map((k) => <option key={k}>{k}</option>)}
                  </Select>
                </div>
                <div><Label>{t("capacity")}</Label><Input required type="number" min={1} onChange={set("capacity")} /></div>
                <div><Label>{t("contact")}</Label><Input required onChange={set("contact")} /></div>
                <div><Label>{t("phone")}</Label><Input required type="tel" onChange={set("phone")} /></div>
              </>
            )}

            {role === "DRIVER" && (
              <>
                <div><Label>{t("fullName")}</Label><Input required onChange={set("fullName")} /></div>
                <div><Label>{t("phone")}</Label><Input required type="tel" onChange={set("phone")} /></div>
                <div>
                  <Label>{t("vehicle")}</Label>
                  <Select required value={f.vehicle ?? ""} onChange={set("vehicle")}>
                    <option value="" disabled>—</option>
                    <option value="BAJAJ">Bajaj</option>
                    <option value="MOTORBIKE">Motorbike</option>
                  </Select>
                </div>
                <div>
                  <Label>{t("idUpload")}</Label>
                  <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-lake-200 text-sm text-lake-500 hover:bg-lake-50">
                    <Upload size={20} />
                    <span>{f.idFile || "JPG / PNG"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      required
                      className="hidden"
                      onChange={(e) => setF((s) => ({ ...s, idFile: e.target.files?.[0]?.name ?? "" }))}
                    />
                  </label>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg">{t("continue")}</Button>
          </form>
        </Card>
      </main>
    </>
  );
}
