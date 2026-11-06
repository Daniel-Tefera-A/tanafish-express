export type ItemType = "FISH" | "FOOD";

export interface ProductItem {
  id: string;
  title: string;
  item_type: ItemType;
  species_or_style: string;
  preparation: string;
  price: number;
  quantity: number;
  unit: "kg" | "plate";
  location: string;
  seller_name: string;
  image_url: string;
  is_available: boolean;
  created_at?: string;
}