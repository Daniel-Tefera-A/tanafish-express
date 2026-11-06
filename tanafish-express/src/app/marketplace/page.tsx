"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Fish, 
  ChefHat, 
  MapPin, 
  Search, 
  ShoppingCart, 
  Check, 
  PlusCircle, 
  Loader2 
} from "lucide-react";
import { TopNav } from "@/components/nav";
import { fetchAllItems } from "@/lib/store";
import { ProductItem, ItemType } from "@/lib/types";

export default function MarketplacePage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | ItemType>("ALL");
  const [search, setSearch] = useState("");
  const [orderedItem, setOrderedItem] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllItems();
    setItems(data);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    const matchesType = filterType === "ALL" || item.item_type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.species_or_style.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOrder = (id: string) => {
    setOrderedItem(id);
    setTimeout(() => setOrderedItem(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Lake Tana Marketplace
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Order fresh whole catch directly from fishermen or hot meals from Bahir Dar kitchens.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition self-start md:self-auto"
          >
            <PlusCircle size={16} />
            <span>Post New Fish or Food</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tab Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                filterType === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterType("FISH")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                filterType === "FISH" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐟 Fresh Catches
            </button>
            <button
              onClick={() => setFilterType("FOOD")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                filterType === "FOOD" ? "bg-white text-amber-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🍳 Hot Dishes
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Tilapia, Tibz, port..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-emerald-700 mx-auto" size={32} />
            <p className="mt-2 text-sm text-slate-500">Updating live inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
            <Fish size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No items found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No matching listings for this search. Be the first to upload one!
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              <PlusCircle size={15} /> Upload Item Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.item_type === "FISH"
                            ? "bg-emerald-700 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {item.item_type === "FISH" ? "Raw Catch" : "Kitchen Prepared"}
                      </span>
                    </div>

                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[11px] font-bold text-slate-800">
                      {item.quantity} {item.unit} left
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-emerald-600" />
                      {item.location}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {item.species_or_style}
                      </span>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        {item.preparation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-5 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                      Price
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {item.price} ETB
                      <span className="text-xs font-normal text-slate-500"> / {item.unit}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOrder(item.id)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      orderedItem === item.id
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {orderedItem === item.id ? (
                      <>
                        <Check size={14} /> Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} /> Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}