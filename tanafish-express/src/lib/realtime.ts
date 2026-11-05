/**
 * Realtime bus. Demo: BroadcastChannel (works across tabs, so you can open the
 * customer view and the hotel KDS side by side).
 *
 * Production: replace with Supabase Realtime —
 *
 *   supabase.channel("kds")
 *     .on("postgres_changes",
 *         { event: "UPDATE", schema: "public", table: "orders", filter: `hotel_id=eq.${hotelId}` },
 *         (payload) => payload.new.status === "PAID" && ring())
 *     .subscribe();
 */
export type Msg = { type: "orders-changed"; newOrderId?: string };

const NAME = "tanafish";

export function broadcast(msg: Msg) {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(NAME);
  ch.postMessage(msg);
  ch.close();
}

export function subscribe(cb: (m: Msg) => void) {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const ch = new BroadcastChannel(NAME);
  ch.onmessage = (e) => cb(e.data as Msg);
  return () => ch.close();
}

/** Audible kitchen alert using Web Audio (no asset download — friendly to slow connections). */
export function ringBell() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [880, 660, 880].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = "sine";
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.28;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.start(t);
      o.stop(t + 0.26);
    });
  } catch {}
}
