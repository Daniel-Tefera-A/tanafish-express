"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Waves, ChefHat, MapPin, Loader2, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TopNav } from "@/components/nav";
import { AuthModal } from "@/components/AuthModal";
import { Badge, Button, Card } from "@/components/ui";
import { etb } from "@/lib/utils";

type Tab = "raw" | "cooked";

export default function MarketplacePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("raw");
  const [rawCatches, setRawCatches] = useState<any[]>([]);
  const [hotelDishes, setHotelDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkSessionAndFetch();
  }, []);

  const checkSessionAndFetch = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    const { data: catches } = await supabase
      .from("products")
      .select("*, profiles(full_name)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    setRawCatches(catches || []);

    const { data: dishes } = await supabase
      .from("hotel_dishes")
      .select("*, hotel_profiles(business_name), profiles(kebele)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    setHotelDishes(dishes || []);

    setLoading(false);
  };

  const handleOrderClick = (item: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    router.push(`/checkout?itemId=${item.id}&type=${tab}`);
  };

  return (
    <>
      <TopNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-lake-900">Lake Tana Fish Market</h1>
            <p className="text-sm text-lake-500">Live landings across Bahir Dar ports and fresh culinary preparations.</p>
          </div>

          <div className="flex bg-lake-100/60 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setTab("raw")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                tab === "raw" ? "bg-white text-lake-900 shadow-sm" : "text-lake-600 hover:text-lake-900"
              }`}
            >
              Raw & Fresh Catch
            </button>
            <button
              onClick={() => setTab("cooked")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                tab === "cooked" ? "bg-white text-lake-900 shadow-sm" : "text-lake-600 hover:text-lake-900"
              }`}
            >
              Hotel-Cooked Dishes
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto animate-spin text-lake-800" size={32} />
          </div>
        ) : tab === "raw" ? (
          rawCatches.length === 0 ? (
            <Card className="p-16 text-center border-dashed border-2 border-lake-200">
              <Waves className="mx-auto mb-3 text-lake-300" size={40} />
              <h3 className="text-lg font-bold text-lake-800">No Fresh Catch Listed Yet Today</h3>
              <p className="mt-1 text-sm text-lake-500 max-w-md mx-auto">
                Check back shortly as fishermen arrive at the landing sites across Lake Tana (Gende Wuha, Shimbit, and Gorgora).
              </p>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rawCatches.map((item) => (
                <Card key={item.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg font-bold text-lake-900">{item.species}</h3>
                      <Badge tone="lime">{item.preparation}</Badge>
                    </div>
                    <p className="text-xs text-lake-500 flex items-center gap-1 mb-1">
                      <MapPin size={13} /> Landing: {item.landing_site}
                    </p>
                    <p className="text-xs text-lake-500 mb-4">
                      Cooperative: {item.profiles?.full_name}
                    </p>
                    <div className="bg-lake-50 rounded-xl p-3 flex justify-between items-center mb-4">
                      <span className="text-xs text-lake-600 font-medium">Available</span>
                      <span className="text-sm font-bold text-lake-900">{item.quantity_kg} Kg</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-lake-100 flex items-center justify-between">
                    <span className="font-display font-bold text-lg text-lake-900">{etb(item.price_per_kg)}/kg</span>
                    <Button onClick={() => handleOrderClick(item)}>
                      <ShoppingCart size={16} /> Order Catch
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          hotelDishes.length === 0 ? (
            <Card className="p-16 text-center border-dashed border-2 border-lake-200">
              <ChefHat className="mx-auto mb-3 text-lake-300" size={40} />
              <h3 className="text-lg font-bold text-lake-800">No Kitchen Menus Active</h3>
              <p className="mt-1 text-sm text-lake-500 max-w-md mx-auto">
                Bahir Dar partner restaurants are currently preparing their daily fish menus. Please check back soon.
              </p>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hotelDishes.map((dish) => (
                <Card key={dish.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg font-bold text-lake-900">{dish.dish_name}</h3>
                      <Badge tone="lake">Cooked</Badge>
                    </div>
                    <p className="text-xs text-lake-500 flex items-center gap-1 mb-1">
                      <MapPin size={13} /> {dish.hotel_profiles?.business_name || "Partner Restaurant"} ({dish.profiles?.kebele})
                    </p>
                    <p className="text-xs text-lake-400 mt-2">
                      Freshly prepared from today&apos;s Lake Tana catch upon order confirmation.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-lake-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-lake-400">Preparation Fee</p>
                      <span className="font-display font-bold text-lg text-lake-900">{etb(dish.prep_fee)}</span>
                    </div>
                    <Button onClick={() => handleOrderClick(dish)}>
                      Order Prepared
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </main>
    </>
  );
}