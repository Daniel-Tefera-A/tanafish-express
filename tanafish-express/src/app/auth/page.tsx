"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fish, Upload, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, Label, Select } from "@/components/ui";

type RoleOption = "CUSTOMER" | "HOTEL" | "SELLER";

const BAHIR_DAR_KEBELES = [
  "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05",
  "Kebele 06", "Kebele 07", "Kebele 08", "Kebele 09", "Kebele 10",
  "Kebele 11", "Kebele 12", "Kebele 13", "Kebele 14", "Kebele 15", "Kebele 16",
  "Shimbit", "Poly", "Ginbot 20", "Belay Zeleke", "Gish Abay", "Fasilo"
];

const LANDING_SITES = [
  "Marine Port (Gende Wuha)",
  "Mangie Landing",
  "Shimbit Fisher Port",
  "Gorgora Landing Harbor",
  "Abay Mado Shore"
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [role, setRole] = useState<RoleOption>("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [kebele, setKebele] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [tin, setTin] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [landingSite, setLandingSite] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Registration failed");
      }

      const userId = authData.user.id;
      const initialStatus = role === "CUSTOMER" ? "APPROVED" : "PENDING";

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        role,
        full_name: role === "CUSTOMER" ? fullName : businessName,
        phone,
        kebele: role === "SELLER" ? landingSite : kebele,
        status: initialStatus,
      });

      if (profileError) throw profileError;

      if (role === "SELLER") {
        if (!docFile) throw new Error("Please upload proof of commercial fisherman status (License/ID)");

        const fileExt = docFile.name.split(".").pop();
        const filePath = `${userId}-verification.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("seller-documents")
          .upload(filePath, docFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("seller-documents")
          .getPublicUrl(filePath);

        const { error: sellerError } = await supabase.from("seller_profiles").upsert({
          user_id: userId,
          business_name: businessName,
          landing_site: landingSite,
          tin_id: tin,
          document_url: publicUrlData.publicUrl,
        });

        if (sellerError) throw sellerError;
      }

      if (role === "HOTEL") {
        const { error: hotelError } = await supabase.from("hotel_profiles").upsert({
          user_id: userId,
          business_name: businessName,
          tin_number: tin,
          contact_person: contactPerson,
        });

        if (hotelError) throw hotelError;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during account registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <main className="min-h-screen bg-lake-50/50 py-10 px-4 flex flex-col justify-center items-center">
      <Link href="/" className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-lake-900">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-lake-800 text-lime-400">
          <Fish size={22} />
        </span>
        FishLink
      </Link>

      <Card className="w-full max-w-lg p-6 sm:p-8 bg-white shadow-xl border-lake-100">
        <div className="flex border-b border-lake-100 mb-6">
          <button
            onClick={() => { setMode("signin"); setErrorMsg(""); }}
            className={`flex-1 pb-3 text-center text-sm font-semibold transition ${
              mode === "signin" ? "border-b-2 border-lake-800 text-lake-900" : "text-lake-400"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("register"); setErrorMsg(""); }}
            className={`flex-1 pb-3 text-center text-sm font-semibold transition ${
              mode === "register" ? "border-b-2 border-lake-800 text-lake-900" : "text-lake-400"
            }`}
          >
            Register Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to FishLink"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Account Type</Label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-lake-100/50 rounded-xl">
                {(["CUSTOMER", "HOTEL", "SELLER"] as RoleOption[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      role === r ? "bg-white text-lake-900 shadow-sm" : "text-lake-600 hover:text-lake-900"
                    }`}
                  >
                    {r === "CUSTOMER" ? "Customer" : r === "HOTEL" ? "Hotel" : "Fish Seller"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {role === "CUSTOMER" && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input required placeholder="Abebe Balcha" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone Number</Label>
                    <Input required placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label>Bahir Dar Kebele</Label>
                    <Select required value={kebele} onChange={(e) => setKebele(e.target.value)}>
                      <option value="">Select Kebele</option>
                      {BAHIR_DAR_KEBELES.map((k) => <option key={k} value={k}>{k}</option>)}
                    </Select>
                  </div>
                </div>
              </>
            )}

            {role === "HOTEL" && (
              <>
                <div>
                  <Label>Business / Hotel Name</Label>
                  <Input required placeholder="e.g., Lake View Fish Restaurant" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Contact Person</Label>
                    <Input required placeholder="Manager Name" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input required placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>TIN Number</Label>
                    <Input required placeholder="TIN Number" value={tin} onChange={(e) => setTin(e.target.value)} />
                  </div>
                  <div>
                    <Label>Kebele</Label>
                    <Select required value={kebele} onChange={(e) => setKebele(e.target.value)}>
                      <option value="">Select Kebele</option>
                      {BAHIR_DAR_KEBELES.map((k) => <option key={k} value={k}>{k}</option>)}
                    </Select>
                  </div>
                </div>
              </>
            )}

            {role === "SELLER" && (
              <>
                <div>
                  <Label>Cooperative / Seller Name</Label>
                  <Input required placeholder="e.g., Tana Fishermen Association" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Primary Landing Site</Label>
                    <Select required value={landingSite} onChange={(e) => setLandingSite(e.target.value)}>
                      <option value="">Select Site</option>
                      {LANDING_SITES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input required placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>TIN or Fisher ID</Label>
                  <Input required placeholder="Fisher ID / Commercial TIN" value={tin} onChange={(e) => setTin(e.target.value)} />
                </div>
                <div>
                  <Label>Commercial Verification Document (PDF/JPG)</Label>
                  <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-lake-200 text-xs text-lake-500 hover:bg-lake-50">
                    <Upload size={18} className="mb-1 text-lake-400" />
                    <span>{docFile ? docFile.name : "Upload License / Cooperative ID"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      required
                      className="hidden"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </>
            )}

            <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Create FishLink Account"}
            </Button>
          </form>
        )}

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-lake-100" /></div>
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-lake-400 font-semibold">Or</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border-lake-200"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.5v5.4h7.1c4.1-3.8 6.5-9.4 6.5-15.9z" />
            <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.6C8.1 41.1 15.5 46 24 46z" />
            <path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3 .7-4.4v-5.6H4.5C3 17 2 20.400 2 24s1 7 2.500 10l7.300-5.600z" />
            <path fill="#EA4335" d="M24 10.700c3.200 0 6.100 1.100 8.400 3.300l6.300-6.300C34.900 4.100 29.900 2 24 2 15.500 2 8.100 6.900 4.500 14l7.300 5.600c1.700-5.200 6.500-8.900 12.200-8.900z" />
          </svg>
          Continue with Google
        </Button>
      </Card>
    </main>
  );
}