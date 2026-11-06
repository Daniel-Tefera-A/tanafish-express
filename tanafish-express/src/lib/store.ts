"use client";
import { supabase } from "./supabase";
import { ProductItem } from "./types";

const LOCAL_STORAGE_KEY = "fishlink_custom_items";

// Built-in starter items in case the database is freshly initialized
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
    image_url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
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