export type FishType = "TILAPIA" | "CATFISH" | "PERCH";
export type Prep = "WHOLE" | "GUTTED" | "FILLETED";

export const KEBELES = [
  ...Array.from({ length: 16 }, (_, i) => `Kebele ${String(i + 1).padStart(2, "0")}`),
  "Poly",
  "Shimbit",
  "Tana Sub-city",
  "Belay Zeleke",
  "Gish Abay",
  "Hidar 11",
  "Sefene Selam",
  "Fasilo",
];

export const FISH = [
  {
    id: "tilapia",
    type: "TILAPIA" as FishType,
    name: "Lake Tana Tilapia",
    nameAm: "ቁርሶ",
    local: "Qurso",
    pricePerKg: 320,
    stockKg: 120,
    img: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=60&auto=format",
  },
  {
    id: "catfish",
    type: "CATFISH" as FishType,
    name: "Catfish",
    nameAm: "አምባዛ",
    local: "Ambaza",
    pricePerKg: 280,
    stockKg: 60,
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=60&auto=format",
  },
  {
    id: "perch",
    type: "PERCH" as FishType,
    name: "Nile Perch",
    nameAm: "የናይል ፐርች",
    local: "Nile Perch",
    pricePerKg: 420,
    stockKg: 40,
    img: "https://images.unsplash.com/photo-1498654200943-1088dd4208ce?w=600&q=60&auto=format",
  },
];

export const PREP_FEE: Record<Prep, number> = { WHOLE: 0, GUTTED: 15, FILLETED: 40 };

export const DISH_STYLES = [
  { id: "gulash", name: "Asa Gulash", nameAm: "አሳ ጉላሽ" },
  { id: "lebleb", name: "Asa Lebleb", nameAm: "አሳ ለብለብ" },
  { id: "tibz", name: "Fried Fish (Asa Tibz)", nameAm: "አሳ ጥብስ" },
  { id: "dulet", name: "Roasted / Dulet", nameAm: "ዱለት" },
];

export type Hotel = {
  id: string;
  name: string;
  kebele: string;
  rating: number;
  prepMinutes: number;
  /** ETB preparation fee per dish style (excludes the fish itself) */
  fees: Record<string, number>;
};

export const HOTELS: Hotel[] = [
  { id: "h1", name: "Lake View Fish House", kebele: "Kebele 11", rating: 4.8, prepMinutes: 25, fees: { gulash: 120, lebleb: 110, tibz: 90, dulet: 140 } },
  { id: "h2", name: "Abay Shore Restaurant", kebele: "Tana Sub-city", rating: 4.6, prepMinutes: 30, fees: { gulash: 100, lebleb: 100, tibz: 80, dulet: 130 } },
  { id: "h3", name: "Papyrus Grill", kebele: "Poly", rating: 4.4, prepMinutes: 20, fees: { gulash: 110, lebleb: 95, tibz: 85, dulet: 120 } },
];

export const DELIVERY_FEE = 60;

export const PAYMENT_METHODS = [
  { id: "TELEBIRR", label: "Telebirr" },
  { id: "CBE_BIRR", label: "CBE Birr" },
  { id: "CHAPA", label: "Chapa" },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];
