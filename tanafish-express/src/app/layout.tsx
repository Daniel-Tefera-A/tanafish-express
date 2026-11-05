import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "FishLink — Lake Tana Fish Marketplace & Distribution",
  description: "Bahir Dar's direct fish marketplace. Order raw lake catch or hotel-cooked dishes. Pay with Telebirr or CBE Birr.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#0b2540", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}