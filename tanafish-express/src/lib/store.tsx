"use client";
/**
 * Lightweight client store (localStorage) so the whole demo flow works without a database.
 * Swap `useOrders` internals for Supabase queries + realtime channels in production
 * (see src/lib/realtime.ts and supabase/schema.sql).
 */
import { useCallback, useEffect, useState } from "react";
import { broadcast, subscribe } from "./realtime";
import type { Prep, FishType, PaymentMethod } from "./data";
import { orderId, otp } from "./utils";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "IN_TRANSIT"
  | "DELIVERED";

export type OrderType = "RAW" | "COOKED" | "BULK_B2B";

export type OrderLine = {
  label: string;
  fishType: FishType;
  weightKg: number;
  prep?: Prep;
  dish?: string;
  price: number;
};

export type Order = {
  id: string;
  type: OrderType;
  status: OrderStatus;
  hotelId?: string;
  hotelName?: string;
  lines: OrderLine[];
  total: number;
  address: string;
  lat?: number;
  lng?: number;
  paymentMethod?: PaymentMethod;
  txRef?: string;
  pickupToken: string;
  deliveryOtp: string;
  driverPayout: number;
  createdAt: number;
};

const KEY = "tf_orders";

function read(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(o: Order[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(read());
    return subscribe((msg) => {
      if (msg.type === "orders-changed") setOrders(read());
    });
  }, []);

  const mutate = useCallback((fn: (o: Order[]) => Order[], evt?: { newOrderId?: string }) => {
    const next = fn(read());
    write(next);
    setOrders(next);
    broadcast({ type: "orders-changed", ...evt });
  }, []);

  const create = useCallback(
    (input: Omit<Order, "id" | "status" | "pickupToken" | "deliveryOtp" | "createdAt" | "driverPayout">) => {
      const order: Order = {
        ...input,
        id: orderId(),
        status: "PENDING_PAYMENT",
        pickupToken: otp(),
        deliveryOtp: otp(),
        driverPayout: Math.round(40 + input.total * 0.05),
        createdAt: Date.now(),
      };
      mutate((o) => [order, ...o]);
      return order;
    },
    [mutate]
  );

  const setStatus = useCallback(
    (id: string, status: OrderStatus, patch: Partial<Order> = {}) =>
      mutate(
        (o) => o.map((x) => (x.id === id ? { ...x, ...patch, status } : x)),
        status === "PAID" ? { newOrderId: id } : undefined
      ),
    [mutate]
  );

  return { orders, create, setStatus };
}

/* ───── cart (single-order-at-a-time for the demo) ───── */
export type Cart = {
  type: OrderType;
  hotelId?: string;
  hotelName?: string;
  lines: OrderLine[];
};
const CART_KEY = "tf_cart";
export const cartStore = {
  get(): Cart | null {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "null");
    } catch {
      return null;
    }
  },
  set(c: Cart | null) {
    try {
      if (c) localStorage.setItem(CART_KEY, JSON.stringify(c));
      else localStorage.removeItem(CART_KEY);
    } catch {}
  },
};

/* ───── profile (onboarding result, mock of the `users` table) ───── */
export type Profile = {
  role: "INDIVIDUAL" | "HOTEL" | "DRIVER";
  fullName?: string;
  phone?: string;
  kebele?: string;
  address?: string;
  businessName?: string;
  tin?: string;
  contact?: string;
  capacity?: number;
  vehicle?: "BAJAJ" | "MOTORBIKE";
};
export const profileStore = {
  get(): Profile | null {
    try {
      return JSON.parse(localStorage.getItem("tf_profile") || "null");
    } catch {
      return null;
    }
  },
  set(p: Profile) {
    try {
      localStorage.setItem("tf_profile", JSON.stringify(p));
    } catch {}
  },
};
