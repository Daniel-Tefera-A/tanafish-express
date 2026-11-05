"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am";

const dict = {
  en: {
    brand: "TanaFish Express",
    tagline: "From Lake Tana to your table",
    heroTitle: "Fresh from Lake Tana, delivered across Bahir Dar",
    heroSub:
      "Order raw catch or hotel-cooked dishes. Paid upfront with Telebirr or CBE Birr, tracked all the way to your door.",
    signInGoogle: "Sign in with Google",
    browse: "Browse the catch",
    v1: "Same-day lake catch",
    v1d: "Landed at dawn, on your table by lunch.",
    v2: "Cooked by local hotels",
    v2d: "Asa Gulash, Lebleb, Tibz and Dulet from rated kitchens.",
    v3: "Pay upfront, track live",
    v3d: "Telebirr, CBE Birr or Chapa with OTP-verified delivery.",
    rawTab: "Raw & Fresh Catch",
    cookedTab: "Cooked Dishes",
    weight: "Weight (kg)",
    prep: "Preparation",
    whole: "Whole",
    gutted: "Gutted",
    filleted: "Filleted",
    addToCart: "Add to cart",
    deliverTo: "Deliver to",
    chooseKebele: "Choose kebele / sub-city",
    dishStyle: "Dish style",
    preparedBy: "Prepared by",
    prepTime: "min",
    cart: "Cart",
    checkout: "Checkout",
    total: "Total",
    payNow: "Pay now",
    payUpfront: "All orders are paid upfront.",
    paymentMethod: "Payment method",
    pinOnMap: "Pin your location on the map",
    deliveryAddress: "Delivery address / landmark",
    placed: "Placed",
    kitchen: "Kitchen preparing",
    enRoute: "Driver en route",
    delivered: "Delivered",
    deliveryOtp: "Delivery OTP — give this to your driver",
    onboardingTitle: "Welcome! Tell us who you are",
    individual: "Individual Customer",
    hotel: "Hotel / Restaurant",
    driver: "Delivery Partner",
    continue: "Continue",
    fullName: "Full name",
    phone: "Phone number",
    businessName: "Business name",
    tin: "TIN / license number",
    contact: "Contact person",
    capacity: "Kitchen capacity (covers/hour)",
    vehicle: "Vehicle type",
    idUpload: "Upload ID (photo)",
    hotelDash: "Hotel dashboard",
    kds: "Kitchen display",
    noOrders: "No active orders. New orders will ring here.",
    accept: "Start cooking",
    ready: "Mark ready",
    menuMgmt: "Menu management",
    prepFee: "Prep fee",
    available: "Available",
    outOfStock: "Out of stock",
    bulkOrder: "Order fresh fish in bulk",
    driverFeed: "Driver feed",
    pickupToken: "Pickup token",
    confirmPickup: "Confirm pickup",
    confirmDelivery: "Confirm delivery",
    enterOtp: "Enter customer OTP",
    payout: "Payout",
    soundOn: "Sound alerts on",
    soundOff: "Enable sound alerts",
  },
  am: {
    brand: "ጣና ፊሽ ኤክስፕረስ",
    tagline: "ከጣና ሐይቅ እስከ ማዕድዎ",
    heroTitle: "ትኩስ ከጣና ሐይቅ፣ በባሕር ዳር ሁሉ ይደርሳል",
    heroSub:
      "ጥሬ ዓሣ ወይም በሆቴሎች የተዘጋጀ ምግብ ይዘዙ። በቴሌብር ወይም በሲቢኢ ብር ቅድሚያ ይክፈሉ፣ እስከ በርዎ ድረስ ይከታተሉ።",
    signInGoogle: "በጉግል ይግቡ",
    browse: "ዓሣዎችን ይመልከቱ",
    v1: "የዕለቱ ትኩስ ዓሣ",
    v1d: "ጠዋት ተይዞ ለምሳ ማዕድዎ ላይ።",
    v2: "በአካባቢ ሆቴሎች የተሰራ",
    v2d: "አሳ ጉላሽ፣ ለብለብ፣ ጥብስ እና ዱለት ከተመዘኑ ኩሽናዎች።",
    v3: "ቅድሚያ ክፈሉ፣ በቀጥታ ይከታተሉ",
    v3d: "ቴሌብር፣ ሲቢኢ ብር ወይም ቻፓ በኦቲፒ የተረጋገጠ ርክክብ።",
    rawTab: "ጥሬ እና ትኩስ ዓሣ",
    cookedTab: "የበሰሉ ምግቦች",
    weight: "ክብደት (ኪ.ግ)",
    prep: "አዘገጃጀት",
    whole: "ሙሉ",
    gutted: "ሆድ የወጣለት",
    filleted: "የተፈለፈለ",
    addToCart: "ወደ ቅርጫት ጨምር",
    deliverTo: "የሚደርስበት",
    chooseKebele: "ቀበሌ / ክፍለ ከተማ ይምረጡ",
    dishStyle: "የምግብ ዓይነት",
    preparedBy: "የሚያዘጋጀው",
    prepTime: "ደቂቃ",
    cart: "ቅርጫት",
    checkout: "ክፍያ",
    total: "ጠቅላላ",
    payNow: "አሁን ይክፈሉ",
    payUpfront: "ሁሉም ትዕዛዞች በቅድሚያ ይከፈላሉ።",
    paymentMethod: "የክፍያ ዘዴ",
    pinOnMap: "አድራሻዎን በካርታ ላይ ያመልክቱ",
    deliveryAddress: "የማድረሻ አድራሻ / ምልክት",
    placed: "ተመዝግቧል",
    kitchen: "ኩሽና እያዘጋጀ ነው",
    enRoute: "ሹፌር በመንገድ ላይ",
    delivered: "ደርሷል",
    deliveryOtp: "የርክክብ ኦቲፒ — ለሹፌሩ ይስጡ",
    onboardingTitle: "እንኳን ደህና መጡ! ማን እንደሆኑ ይንገሩን",
    individual: "ግለሰብ ደንበኛ",
    hotel: "ሆቴል / ምግብ ቤት",
    driver: "አስረካቢ አጋር",
    continue: "ቀጥል",
    fullName: "ሙሉ ስም",
    phone: "ስልክ ቁጥር",
    businessName: "የንግድ ስም",
    tin: "የቲን / ፈቃድ ቁጥር",
    contact: "ተጠሪ ሰው",
    capacity: "የኩሽና አቅም (ሰው/ሰዓት)",
    vehicle: "የተሽከርካሪ ዓይነት",
    idUpload: "መታወቂያ ይጫኑ (ፎቶ)",
    hotelDash: "የሆቴል ዳሽቦርድ",
    kds: "የኩሽና ማሳያ",
    noOrders: "ንቁ ትዕዛዝ የለም። አዲስ ትዕዛዝ እዚህ ይጮኻል።",
    accept: "ማብሰል ጀምር",
    ready: "ዝግጁ ነው",
    menuMgmt: "የምግብ ዝርዝር አስተዳደር",
    prepFee: "የዝግጅት ክፍያ",
    available: "ይገኛል",
    outOfStock: "አልቋል",
    bulkOrder: "ትኩስ ዓሣ በጅምላ ይዘዙ",
    driverFeed: "የሹፌር ዝርዝር",
    pickupToken: "የመረከቢያ ቶከን",
    confirmPickup: "መረከብን አረጋግጥ",
    confirmDelivery: "ርክክብን አረጋግጥ",
    enterOtp: "የደንበኛውን ኦቲፒ ያስገቡ",
    payout: "ክፍያ",
    soundOn: "የድምፅ ማስጠንቀቂያ በርቷል",
    soundOff: "የድምፅ ማስጠንቀቂያ አብራ",
  },
} as const;

export type Key = keyof (typeof dict)["en"];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tf_lang") as Lang | null;
      if (saved === "en" || saved === "am") setLangState(saved);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("tf_lang", l);
    } catch {}
    document.documentElement.lang = l;
  };
  const t = (k: Key) => dict[lang][k] ?? dict.en[k];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
