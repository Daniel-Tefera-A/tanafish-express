"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Fish, ChefHat, Clock, AlertTriangle, Package, Trash2, Loader2 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TopNav } from "@/components/nav";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui";
import { etb } from "@/lib/utils";

type Species = "Tilapia (Qurso)" | "Catfish (Ambaza)" | "Labeobarbus (Nech Asa)" | "Nile Perch";
type Prep = "WHOLE" | "GUTTED" | "FILLETED";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [species, setSpecies] = useState<Species>("Tilapia (Qurso)");
  const [prep, setPrep] = useState<Prep>("WHOLE");
  const [quantity, setQuantity] = useState<number>(20);
  const [pricePerKg, setPricePerKg] = useState<number>(350);
  const [landingSite, setLandingSite] = useState<string>("Marine Port (Gende Wuha)");
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);

  const [dishName, setDishName] = useState<string>("Asa Tibz (Fried)");
  const [prepFee, setPrepFee] = useState<number>(120);
  const [hotelDishes, setHotelDishes] = useState<any[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (prof) {
      setProfile(prof);
      if (prof.role === "SELLER") loadSellerProducts(prof.id);
      if (prof.role === "HOTEL") loadHotelDishes(prof.id);
      if (prof.role === "CUSTOMER") loadCustomerOrders(prof.id);
    }
    setLoading(false);
  };

  const loadSellerProducts = async (sellerId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    setSellerProducts(data || []);
  };

  const loadHotelDishes = async (hotelId: string) => {
    const { data } = await supabase
      .from("hotel_dishes")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });
    setHotelDishes(data || []);
  };

  const loadCustomerOrders = async (customerId: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const handlePostCatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("products").insert({
      seller_id: profile.id,
      species,
      preparation: prep,
      quantity_kg: quantity,
      price_per_kg: pricePerKg,
      landing_site: landingSite,
      is_available: true,
    });
    if (!error) {
      loadSellerProducts(profile.id);
      setQuantity(20);
    }
    setSubmitting(false);
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("hotel_dishes").insert({
      hotel_id: profile.id,
      dish_name: dishName,
      prep_fee: prepFee,
      is_available: true,
    });
    if (!error) {
      loadHotelDishes(profile.id);
    }
    setSubmitting(false);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    loadSellerProducts(profile.id);
  };

  const deleteDish = async (id: string) => {
    await supabase.from("hotel_dishes").delete().eq("id", id);
    loadHotelDishes(profile.id);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-lake-800" size={32} />
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-lake-950">Workspace</h1>
            <p className="text-sm text-slate-500">
              Welcome back, {profile?.full_name} ({profile?.role})
            </p>
          </div>
          <Badge tone={profile?.status === "APPROVED" ? "lime" : "amber"}>
            Status: {profile?.status}
          </Badge>
        </div>

        {profile?.status === "PENDING" && (
          <Card className="mb-8 border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <Clock className="text-amber-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Commercial Verification Pending</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Your credentials and landing registration are currently under review by FishLink Bahir Dar admins. You will be able to publish listings once approved.
              </p>
            </div>
          </Card>
        )}

        {profile?.status === "REJECTED" && (
          <Card className="mb-8 border-red-200 bg-red-50/60 p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-900 text-sm">Account Verification Declined</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Your submitted documents could not be validated. Please reach out to FishLink regional support at the Lake Tana Port Office.
              </p>
            </div>
          </Card>
        )}

        {profile?.role === "SELLER" && profile?.status === "APPROVED" && (
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div>
              <Card className="p-6">
                <h2 className="font-display text-xl font-bold text-lake-900 mb-4 flex items-center gap-2">
                  <Fish className="text-lime-600" /> Post Daily Catch to Marketplace
                </h2>
                <form onSubmit={handlePostCatch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fish Species</Label>
                      <Select value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
                        <option value="Tilapia (Qurso)">Tilapia (Qurso)</option>
                        <option value="Catfish (Ambaza)">Catfish (Ambaza)</option>
                        <option value="Labeobarbus (Nech Asa)">Labeobarbus (Nech Asa)</option>
                        <option value="Nile Perch">Nile Perch</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Preparation Offered</Label>
                      <Select value={prep} onChange={(e) => setPrep(e.target.value as Prep)}>
                        <option value="WHOLE">Whole Catch</option>
                        <option value="GUTTED">Cleaned / Gutted</option>
                        <option value="FILLETED">Filleted</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Available Qty (Kg)</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Price per Kg (ETB)</Label>
                      <Input
                        type="number"
                        min="50"
                        required
                        value={pricePerKg}
                        onChange={(e) => setPricePerKg(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Lake Landing Site</Label>
                    <Select value={landingSite} onChange={(e) => setLandingSite(e.target.value)}>
                      <option value="Marine Port (Gende Wuha)">Marine Port (Gende Wuha)</option>
                      <option value="Mangie Landing">Mangie Landing</option>
                      <option value="Shimbit Fisher Port">Shimbit Fisher Port</option>
                      <option value="Gorgora Landing Harbor">Gorgora Landing Harbor</option>
                    </Select>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Publish Daily Catch"}
                  </Button>
                </form>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="font-bold text-lake-900 mb-3">Active Listings</h3>
                {sellerProducts.length === 0 ? (
                  <p className="text-xs text-slate-400">No active catches listed right now.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 text-sm">
                    {sellerProducts.map((p) => (
                      <li key={p.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lake-950">{p.species}</p>
                          <p className="text-xs text-slate-500">{p.quantity_kg} kg · {etb(p.price_per_kg)}/kg</p>
                        </div>
                        <button onClick={() => deleteProduct(p.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {profile?.role === "HOTEL" && profile?.status === "APPROVED" && (
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div>
              <Card className="p-6">
                <h2 className="font-display text-xl font-bold text-lake-900 mb-4 flex items-center gap-2">
                  <ChefHat className="text-lake-700" /> Kitchen Menu Management
                </h2>
                <form onSubmit={handleAddDish} className="space-y-4">
                  <div>
                    <Label>Dish Name / Preparation Style</Label>
                    <Select value={dishName} onChange={(e) => setDishName(e.target.value)}>
                      <option value="Asa Tibz (Fried)">Asa Tibz (Fried)</option>
                      <option value="Asa Gulash">Asa Gulash</option>
                      <option value="Asa Lebleb">Asa Lebleb</option>
                      <option value="Fish Dulet">Fish Dulet</option>
                    </Select>
                  </div>

                  <div>
                    <Label>Kitchen Cooking & Prep Fee (ETB)</Label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={prepFee}
                      onChange={(e) => setPrepFee(Number(e.target.value))}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Add Menu Item"}
                  </Button>
                </form>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="font-bold text-lake-900 mb-3">Kitchen Menu</h3>
                {hotelDishes.length === 0 ? (
                  <p className="text-xs text-slate-400">No dishes on your kitchen menu yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 text-sm">
                    {hotelDishes.map((d) => (
                      <li key={d.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lake-950">{d.dish_name}</p>
                          <p className="text-xs text-slate-500">Prep Fee: {etb(d.prep_fee)}</p>
                        </div>
                        <button onClick={() => deleteDish(d.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {profile?.role === "CUSTOMER" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-lake-950">Your Recent Orders</h2>
            {orders.length === 0 ? (
              <Card className="p-12 text-center text-slate-400">
                <Package className="mx-auto mb-2 text-slate-300" size={32} />
                <p>You have no active orders with FishLink yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/marketplace")}>
                  Browse Fresh Lake Catches
                </Button>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-lake-950">Order #{order.id}</span>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge tone="lime">{order.status}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Delivery Address: {order.address}, {order.kebele}</span>
                    <span className="font-bold text-lake-950">{etb(order.total)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs text-slate-700">
                    <span>Delivery Verification OTP (Give to Driver):</span>
                    <span className="font-mono font-bold text-base tracking-widest text-lake-950">{order.delivery_otp}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}