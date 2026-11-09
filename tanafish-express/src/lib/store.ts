"use client";
/**
 * Unified store for TanaFish Express.
 * Combines local product items catalog, orders, cart, and profile state with localStorage persistence.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { broadcast, subscribe } from "./realtime";
import type { Prep, FishType, PaymentMethod } from "./data";
import { orderId, otp } from "./utils";
import type { ProductItem } from "./types";

export type { ProductItem };

const LOCAL_STORAGE_KEY = "fishlink_custom_items";

// Built-in starter items with local assets
const SEED_ITEMS: ProductItem[] = [
  {
    id: "seed-1",
    title: "Lake Tana Fresh Tilapia (Qurso)",
    item_type: "FISH",
    species_or_style: "Tilapia (Qurso)",
    preparation: "Whole / Fresh Catch",
    price: 340,
    quantity: 45,
    unit: "kg",
    location: "Marine Port (Gende Wuha)",
    seller_name: "Lake Tana Fishermen Union",
    image_url: "/images/tilapia.jpg",
    is_available: true,
  },
  {
    id: "seed-2",
    title: "Sizzling Asa Tibz (Crispy Fried)",
    item_type: "FOOD",
    species_or_style: "Asa Tibz",
    preparation: "Fried with Mitmita & Rosemary",
    price: 380,
    quantity: 20,
    unit: "plate",
    location: "Lakeside Grill · Shimbit",
    seller_name: "Lake View Restaurant",
    image_url: "/images/tibz.jpg",
    is_available: true,
  },
  {
    id: "seed-3",
    title: "Lake Tana Catfish (Ambaza)",
    item_type: "FISH",
    species_or_style: "Catfish (Ambaza)",
    preparation: "Cleaned & Gutted",
    price: 290,
    quantity: 30,
    unit: "kg",
    location: "Mangie Landing Harbor",
    seller_name: "Bahir Dar Central Fishery",
    image_url: "/images/catfish.jpg",
    is_available: true,
  },
  {
    id: "seed-4",
    title: "Traditional Asa Gulash Stew",
    item_type: "FOOD",
    species_or_style: "Asa Gulash",
    preparation: "Spicy Fish Stew with Injera",
    price: 360,
    quantity: 15,
    unit: "plate",
    location: "Abay Shore Restaurant",
    seller_name: "Abay Shore Kitchen",
    image_url: "/images/gulash.jpg",
    is_available: true,
  },
];

export async function fetchAllItems(): Promise<ProductItem[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to local store:", err);
  }

  // Fallback to local storage or starter items
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_ITEMS));
  }
  return SEED_ITEMS;
}

export async function createProductItem(item: Omit<ProductItem, "id" | "created_at">): Promise<ProductItem> {
  const newItem: ProductItem = {
    ...item,
    id: "item-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([newItem])
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase insert failed, saving to local state:", err);
  }

  // Local storage write
  if (typeof window !== "undefined") {
    const current = await fetchAllItems();
    const updated = [newItem, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return newItem;
}

export async function deleteProductItem(id: string): Promise<boolean> {
  try {
    await supabase.from("products").delete().eq("id", id);
  } catch {}

  if (typeof window !== "undefined") {
    const current = await fetchAllItems();
    const updated = current.filter((x) => x.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return true;
}

/* ───── Orders store (localStorage with broadcast realtime sync) ───── */
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
