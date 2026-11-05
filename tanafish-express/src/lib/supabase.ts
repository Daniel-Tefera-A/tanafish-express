import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Browser/client Supabase instance (RLS enforced). Returns null when env is not configured (demo mode). */
export const supabase = url && anon ? createClient(url, anon) : null;

/** Server-only admin client — never import from a client component. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
