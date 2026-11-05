import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const etb = (n: number) =>
  new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(n) + " ETB";

export const otp = () => String(Math.floor(1000 + Math.random() * 9000));
export const orderId = () => "TF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
