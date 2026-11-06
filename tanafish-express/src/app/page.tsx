"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  PlayCircle, 
  CheckCircle, 
  Anchor, 
  Store, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  ChevronRight 
} from "lucide-react";
import { TopNav } from "@/components/nav";
import { fetchAllItems } from "@/lib/store";
import { ProductItem } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllItems().then((res) => {
      setItems(res.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <TopNav />

      {/* Hero Section styled after AgriBridge with Lake Tana boat background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-50/40 via-white to-slate-50 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full">
              <Anchor size={14} className="text-emerald-700" />
              <span>Digital Lake Tana Fish Market & Logistics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Connecting Lake Tana Catch to Verified Demand
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              FishLink helps coordinate fresh morning catch, verified lakeside restaurant kitchens, and direct Bahir Dar doorstep delivery — from landing harbor to your table.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-emerald-800 transition transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <PlusCircle size={18} className="text-emerald-700" />
                <span>Upload Produces & Dishes</span>
              </Link>
            </div>

            {/* Value Checkmarks */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap gap-6 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Zero Middlemen Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Landed at Dawn, Delivered by Noon</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Doorstep OTP Verification</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual with authentic Lake Tana boat scenery */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&q=80"
                alt="Lake Tana Fishing Boat and Green Shoreline"
                className="h-[380px] sm:h-[460px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Gende Wuha & Shimbit Ports
                </span>
                <h3 className="text-xl font-bold mt-1">Direct from Lake Tana Fishermen</h3>
                <p className="text-xs text-slate-200 mt-1">
                  Tilapia (Qurso), Catfish (Ambaza), and hot lakeside dishes delivered daily.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Fresh Available Items Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Live Listings
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Fresh Today on FishLink
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View All Catches & Menus</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading today's landings...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.item_type === "FISH"
                          ? "bg-emerald-700 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {item.item_type === "FISH" ? "Raw Catch" : "Cooked Food"}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-600" />
                      {item.location} · {item.seller_name}
                    </p>
                    <div className="mt-3 inline-block rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      Style: {item.preparation}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-5 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="text-xl font-black text-slate-900">
                      {item.price} ETB
                      <span className="text-xs font-normal text-slate-500"> / {item.unit}</span>
                    </span>
                  </div>
                  <Link
                    href="/marketplace"
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}