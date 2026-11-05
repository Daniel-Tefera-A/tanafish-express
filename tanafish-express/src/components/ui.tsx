import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

/* Shadcn-style primitives, kept dependency-light for fast loads on 3G/4G.
   You can swap these for `npx shadcn@latest add button card badge input` — the class API is the same. */

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
  {
    variants: {
      variant: {
        primary: "bg-lime-500 text-lake-950 hover:bg-lime-400 shadow-glass",
        dark: "bg-lake-800 text-white hover:bg-lake-700",
        outline: "border border-lake-200 bg-white/70 text-lake-800 hover:bg-white",
        ghost: "text-lake-700 hover:bg-lake-50",
        glass: "bg-white/15 text-white backdrop-blur border border-white/30 hover:bg-white/25",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-5", lg: "h-12 px-6 text-lg" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>) {
  return <button className={cn(button({ variant, size }), className)} {...p} />;
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-lake-100 bg-white shadow-sm overflow-hidden", className)}
      {...p}
    />
  );
}

export function GlassCard({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-glass", className)}
      {...p}
    />
  );
}

export function Badge({
  className,
  tone = "lake",
  ...p
}: HTMLAttributes<HTMLSpanElement> & { tone?: "lake" | "lime" | "amber" | "red" }) {
  const tones = {
    lake: "bg-lake-50 text-lake-700",
    lime: "bg-lime-400/25 text-lime-600",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...p}
    />
  );
}

const field =
  "w-full h-11 rounded-xl border border-lake-200 bg-white px-3 text-lake-900 placeholder:text-lake-300 focus:outline-none focus:ring-2 focus:ring-lime-400";

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...p} />;
}
export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, className)} {...p} />;
}
export function Label({ className, ...p }: HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-sm font-medium text-lake-700", className)} {...p} />;
}
