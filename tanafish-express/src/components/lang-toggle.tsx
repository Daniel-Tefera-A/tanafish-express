"use client";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LangToggle({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "am" : "en")}
      aria-label="Toggle language"
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
        onDark
          ? "bg-white/15 text-white border border-white/30 hover:bg-white/25"
          : "bg-lake-50 text-lake-700 hover:bg-lake-100"
      }`}
    >
      <Languages size={16} />
      {lang === "en" ? "አማርኛ" : "EN"}
    </button>
  );
}
