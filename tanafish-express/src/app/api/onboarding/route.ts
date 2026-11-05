import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Persists the role-selection result.
 * - INDIVIDUAL → users row
 * - HOTEL      → users row + hotels row (verified=false until admin approves TIN/licence)
 * - DRIVER     → users row + drivers row (ID image goes to Supabase Storage in production)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const db = supabaseAdmin();

  if (!db || !session?.user?.email) {
    // Demo mode: nothing to persist server-side; the client keeps the profile locally.
    return NextResponse.json({ ok: true, demo: true });
  }

  const { data: user, error } = await db
    .from("users")
    .upsert(
      {
        email: session.user.email,
        full_name: body.fullName,
        role: body.role,
        phone: body.phone,
        address: body.address,
        kebele: body.kebele,
      },
      { onConflict: "email" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.role === "HOTEL") {
    await db.from("hotels").insert({
      user_id: user.id,
      business_name: body.businessName,
      tin_number: body.tin,
      contact_person: body.contact,
      address_kebele: body.kebele,
      kitchen_capacity: body.capacity,
    });
  }
  if (body.role === "DRIVER") {
    await db.from("drivers").upsert({ user_id: user.id, vehicle: body.vehicle }, { onConflict: "user_id" });
  }
  return NextResponse.json({ ok: true });
}
