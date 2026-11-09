"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Fish, 
  ChefHat, 
  PlusCircle, 
  Trash2, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import { TopNav } from "@/components/nav";
import { fetchAllItems, createProductItem, deleteProductItem } from "@/lib/store";
import { ProductItem, ItemType } from "@/lib/types";

// Photo presets so user never gets stuck searching for image URLs
const PHOTO_PRESETS = [
  {
    name: "Fresh Tilapia",
    url: "/images/tilapia.jpg",
  },
  {
    name: "Catfish (Ambaza)",
    url: "/images/catfish.jpg",
  },
  {
    name: "Crispy Asa Tibz",
    url: "/images/tibz.jpg",
  },
  {
    name: "Asa Gulash Stew",
    url: "/images/gulash.jpg",
  },
];

export default function DashboardUploadPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Form State
  const [itemType, setItemType] = useState<ItemType>("FISH");
  const [title, setTitle] = useState("");
  const [speciesOrStyle, setSpeciesOrStyle] = useState("Tilapia (Qurso)");
  const [preparation, setPreparation] = useState("Whole / Cleaned");
  const [price, setPrice] = useState<number>(350);
  const [quantity, setQuantity] = useState<number>(25);
  const [unit, setUnit] = useState<"kg" | "plate">("kg");
  const [location, setLocation] = useState("Marine Port (Gende Wuha)");
  const [sellerName, setSellerName] = useState("Lake Tana Fishermen Union");
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);

  useEffect(() => {
    loadMyItems();
  }, []);

  const loadMyItems = async () => {
    const data = await fetchAllItems();
    setItems(data);
  };

  const handleTypeChange = (type: ItemType) => {
    setItemType(type);
    if (type === "FISH") {
      setTitle("Fresh Tilapia (Qurso)");
      setSpeciesOrStyle("Tilapia (Qurso)");
      setPreparation("Whole / Fresh Catch");
      setUnit("kg");
      setImageUrl(PHOTO_PRESETS[0].url);
      setLocation("Marine Port (Gende Wuha)");
    } else {
      setTitle("Special Asa Tibz (Fried Fish)");
      setSpeciesOrStyle("Asa Tibz");
      setPreparation("Pan Fried with Spices & Rosemary");
      setUnit("plate");
      setImageUrl(PHOTO_PRESETS[2].url);
      setLocation("Lake View Fish Restaurant · Kebele 11");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await createProductItem({
      title: title || (itemType === "FISH" ? "Lake Tana Catch" : "Lakeside Special Dish"),
      item_type: itemType,
      species_or_style: speciesOrStyle,
      preparation,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      location,
      seller_name: sellerName,
      image_url: imageUrl,
      is_available: true,
    });

    setSubmitting(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);

    await loadMyItems();
  };

  const handleDelete = async (id: string) => {
    await deleteProductItem(id);
    await loadMyItems();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <TopNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Publish Fish & Food Listings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add raw catches from Lake Tana ports or cooked dishes from Bahir Dar restaurant kitchens.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Upload Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PlusCircle className="text-emerald-700" size={20} />
              <span>New Listing Form</span>
            </h2>

            {successNotice && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Listing published successfully! It is now live in the marketplace.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Listing Category
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("FISH")}
                    className={`py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                      itemType === "FISH"
                        ? "bg-white text-emerald-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Fish size={16} /> Raw Fish Catch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("FOOD")}
                    className={`py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                      itemType === "FOOD"
                        ? "bg-white text-amber-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ChefHat size={16} /> Cooked / Hotel Food
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={itemType === "FISH" ? "e.g., Lake Tana Tilapia (Qurso)" : "e.g., Crispy Asa Tibz"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              {/* Species and Preparation */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {itemType === "FISH" ? "Species" : "Culinary Style"}
                  </label>
                  <input
                    type="text"
                    required
                    value={speciesOrStyle}
                    onChange={(e) => setSpeciesOrStyle(e.target.value)}
                    placeholder={itemType === "FISH" ? "Tilapia / Catfish" : "Asa Tibz / Gulash"}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Preparation / Condition
                  </label>
                  <input
                    type="text"
                    required
                    value={preparation}
                    onChange={(e) => setPreparation(e.target.value)}
                    placeholder="Whole / Gutted / Fried / Stew"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Pricing, Quantity & Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Price (ETB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as "kg" | "plate")}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  >
                    <option value="kg">kg (weight)</option>
                    <option value="plate">plate (dish)</option>
                  </select>
                </div>
              </div>

              {/* Location & Seller Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Landing Site / Restaurant Address
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Marine Port (Gende Wuha)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cooperative / Hotel Name
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="e.g. Tana Fishermen Union"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Photo Presets & Custom URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Visual Photo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-left p-1.5 rounded-xl border transition ${
                        imageUrl === preset.url
                          ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-16 w-full object-cover rounded-lg mb-1"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or enter any custom Image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow hover:bg-emerald-800 transition disabled:opacity-50"
              >
                {submitting ? "Publishing to FishLink..." : "Publish Item to Marketplace"}
              </button>
            </form>
          </div>

          {/* Right Column: Live Inventory List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">
                  Current Active Listings ({items.length})
                </h3>
                <Link
                  href="/marketplace"
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                >
                  <span>Preview Store</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No active listings yet. Add your first item on the left.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={it.image_url}
                          alt={it.title}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {it.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {it.price} ETB / {it.unit} · {it.quantity} {it.unit}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(it.id)}
                        className="text-slate-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}