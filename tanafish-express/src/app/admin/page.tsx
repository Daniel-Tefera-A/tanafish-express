"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, X, FileText, Trash2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TopNav } from "@/components/nav";
import { Card, Button } from "@/components/ui";

export default function AdminPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingHotels, setPendingHotels] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await loadQueue();
    setLoading(false);
  };

  const loadQueue = async () => {
    const { data: sellers } = await supabase
      .from("profiles")
      .select("*, seller_profiles(*)")
      .eq("role", "SELLER")
      .eq("status", "PENDING");
    setPendingSellers(sellers || []);

    const { data: hotels } = await supabase
      .from("profiles")
      .select("*, hotel_profiles(*)")
      .eq("role", "HOTEL")
      .eq("status", "PENDING");
    setPendingHotels(hotels || []);

    const { data: products } = await supabase
      .from("products")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    setAllProducts(products || []);
  };

  const setVerification = async (userId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (!error) {
      await loadQueue();
    }
    setActionLoading(null);
  };

  const deleteListing = async (productId: string) => {
    await supabase.from("products").delete().eq("id", productId);
    loadQueue();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-lake-800" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
        <h2 className="text-xl font-bold text-lake-950">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">This portal requires FishLink Administrator privileges.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-lake-950 flex items-center gap-2">
            <ShieldCheck className="text-lime-600" /> FishLink Admin Oversight
          </h1>
          <p className="text-sm text-slate-500">Review commercial licenses, approve cooperatives, and moderate listings.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-lake-950">Pending Fishermen / Cooperatives ({pendingSellers.length})</h2>
          {pendingSellers.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-sm">No pending seller registrations.</Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="p-4">Cooperative / Business</th>
                    <th className="p-4">Landing Site</th>
                    <th className="p-4">Phone / TIN</th>
                    <th className="p-4">Proof Document</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingSellers.map((s) => {
                    const sp = Array.isArray(s.seller_profiles) ? s.seller_profiles[0] : s.seller_profiles;
                    return (
                      <tr key={s.id}>
                        <td className="p-4 font-semibold text-lake-950">{sp?.business_name || s.full_name}</td>
                        <td className="p-4 text-slate-600">{sp?.landing_site || s.kebele}</td>
                        <td className="p-4 text-slate-600">{s.phone} | TIN: {sp?.tin_id}</td>
                        <td className="p-4">
                          {sp?.document_url ? (
                            <a
                              href={sp.document_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-lake-700 underline hover:text-lime-600"
                            >
                              <FileText size={14} /> View File
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">No doc</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={actionLoading === s.id}
                              onClick={() => setVerification(s.id, "APPROVED")}
                            >
                              <Check size={14} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={actionLoading === s.id}
                              onClick={() => setVerification(s.id, "REJECTED")}
                            >
                              <X size={14} /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-lake-950">Pending Hotels & Restaurants ({pendingHotels.length})</h2>
          {pendingHotels.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-sm">No pending hotel applications.</Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="p-4">Hotel Name</th>
                    <th className="p-4">Kebele</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">TIN</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingHotels.map((h) => {
                    const hp = Array.isArray(h.hotel_profiles) ? h.hotel_profiles[0] : h.hotel_profiles;
                    return (
                      <tr key={h.id}>
                        <td className="p-4 font-semibold text-lake-950">{hp?.business_name || h.full_name}</td>
                        <td className="p-4 text-slate-600">{h.kebele}</td>
                        <td className="p-4 text-slate-600">{hp?.contact_person} ({h.phone})</td>
                        <td className="p-4 text-slate-600">{hp?.tin_number}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={actionLoading === h.id}
                              onClick={() => setVerification(h.id, "APPROVED")}
                            >
                              <Check size={14} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={actionLoading === h.id}
                              onClick={() => setVerification(h.id, "REJECTED")}
                            >
                              <X size={14} /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-lake-950">Live Catch Moderation ({allProducts.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((p) => (
              <Card key={p.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lake-950">{p.species}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{p.preparation}</span>
                  </div>
                  <p className="text-xs text-slate-500">Seller: {p.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">Landing: {p.landing_site}</p>
                  <p className="text-sm font-semibold text-lake-950 mt-2">{p.quantity_kg} kg · {p.price_per_kg} ETB/kg</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-red-600 border-red-200 hover:bg-red-50 w-full"
                  onClick={() => deleteListing(p.id)}
                >
                  <Trash2 size={14} /> Remove Listing
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}