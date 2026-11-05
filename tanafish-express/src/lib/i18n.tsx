"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am";

const dict = {
  en: {
    // Brand & Hero
    brand: "FishLink",
    tagline: "Lake Tana's Freshest Catch, Delivered to Your Door",
    heroBadge: "🌊 Direct from Lake Tana Landing Ports",
    heroTitle: "Landed at Dawn on Lake Tana. On Your Table by Lunch.",
    heroSub:
      "Order pristine fresh-water fish straight from Bahir Dar's local fishing cooperatives, or enjoy sizzling Asa Tibz and Asa Gulash prepared by top-rated lakeside kitchens.",
    signInGoogle: "Continue with Google",
    browse: "Explore Today's Catch",
    orderNow: "Order Now",
    workspace: "My Workspace",
    signIn: "Sign In / Register",
    signOut: "Sign Out",
    liveTicker: "Fresh Landings: 140kg Tilapia (Qurso) just docked at Gende Wuha Port",

    // Value Props
    v1: "Caught at First Light",
    v1d: "Harvested sustainably by local fishermen at dawn and packed on lake ice within hours.",
    v2: "Cooked by Renowned Kitchens",
    v2d: "Crispy Asa Tibz, fragrant Asa Gulash, and tender Lebleb made to order by top Bahir Dar chefs.",
    v3: "Honest, Transparent Delivery",
    v3d: "Pay securely via Telebirr or CBE Birr. Hand over your secret 4-digit code only when your fish arrives.",

    // Marketplace & Preparations
    rawTab: "Raw & Fresh Catch",
    cookedTab: "Hotel-Cooked Specialties",
    weight: "Select Weight",
    prep: "Preparation Style",
    whole: "Whole (Fresh & Intact)",
    gutted: "Cleaned & Gutted",
    filleted: "Boneless Fillet",
    addToCart: "Add to Basket",
    deliverTo: "Delivery Destination",
    chooseKebele: "Select Kebele / Sub-city",
    dishStyle: "Culinary Style",
    preparedBy: "Crafted by",
    prepTime: "mins",
    cart: "Your Basket",
    checkout: "Proceed to Checkout",
    total: "Total Amount",
    payNow: "Confirm & Pay",
    payUpfront: "Guaranteed escrow: Paid securely upfront, verified at your doorstep.",
    paymentMethod: "Payment Method",
    pinOnMap: "Pin Delivery Landmark",
    deliveryAddress: "Specific House / Landmark Description",

    // Tracking Milestones
    placed: "Order Received",
    kitchen: "Preparing & Packing",
    enRoute: "Rider on the Way",
    delivered: "Safely Handed Over",
    deliveryOtp: "Your 4-Digit Delivery Code (Give to Driver)",

    // Driver Portal
    driverFeed: "Driver Delivery Feed",
    pickupToken: "Pickup Verification Token",
    confirmPickup: "Confirm Catch Handover",
    confirmDelivery: "Verify & Complete Delivery",
    enterOtp: "Enter Customer's 4-Digit Code",
    payout: "Delivery Earning",

    // Hotel & Kitchen Portal
    hotelDash: "Hotel Kitchen Workspace",
    kds: "Kitchen Orders (KDS)",
    noOrders: "No active orders right now. New requests will appear here.",
    accept: "Accept & Start Cooking",
    ready: "Mark Order Ready for Pickup",
    menuMgmt: "Kitchen Menu & Pricing",
    prepFee: "Cooking / Prep Fee (ETB)",
    available: "Available Today",
    outOfStock: "Sold Out Today",
    bulkOrder: "Order Raw Fish in Bulk",

    // Onboarding & Registration
    onboardingTitle: "Welcome to FishLink! Tell us your role",
    individual: "Customer / Household",
    hotel: "Hotel or Restaurant Kitchen",
    driver: "Bajaj / Motorbike Delivery Partner",
    continue: "Continue",
    fullName: "Full Name",
    phone: "Phone Number",
    businessName: "Business / Hotel Name",
    tin: "TIN or Trade License No.",
    contact: "Contact Person",
    capacity: "Kitchen Capacity (orders/hour)",
    vehicle: "Vehicle Type",
    idUpload: "Upload ID or Driving License",

    // Community Story
    coopTitle: "Empowering Lake Tana's Fishing Families",
    coopQuote:
      "FishLink bridges Bahir Dar's traditional boatmen directly with households and restaurants, ensuring fair earnings for fishermen and freshest fish for families.",
    coopAuthor: "Lake Tana Fishermen Cooperative Union",

    // Audio & Feedback
    soundOn: "Alert Sound On",
    soundOff: "Mute Sound",
  },
  am: {
    // Brand & Hero
    brand: "ፊሽሊንክ",
    tagline: "ከጣና ማዕበል... በቀጥታ ወደ ማዕድዎ!",
    heroBadge: "🌊 ከጣና ሐይቅ ወደቦች በቀጥታ የቀረበ",
    heroTitle: "ንጋት ላይ ከጣና የተጠመደ፣ ለምሳ ማዕድዎ ትኩስ ሆኖ የሚደርስ።",
    heroSub:
      "የዕለቱን ምርጥ የጣና ዓሣ (ቁርሶ፣ አምባዛ) በቀጥታ ከአጥማጆች ማህበር ይዘዙ፤ ወይም በባሕር ዳር ምርጥ ሼፎች የተዘጋጀ አሳ ጥብስ፣ ጉላሽና ለብለብ በደቂቃዎች ውስጥ ቤትዎ ድረስ እንልካለን።",
    signInGoogle: "በጉግል ይቀጥሉ",
    browse: "የዕለቱን ዓሣ ይመልከቱ",
    orderNow: "አሁን ይዘዙ",
    workspace: "የሥራ ገበታ",
    signIn: "ይግቡ / ይመዝገቡ",
    signOut: "ውጣ",
    liveTicker: "የዕለቱ ዜና፡ 140 ኪ.ግ ቁርሶ (ቲላፒያ) አሁን በገንደ-ውሃ ወደብ ደርሷል",

    // Value Props
    v1: "የንጋት ትኩስ ዓሣ",
    v1d: "ንጋት ላይ ከጣና ሐይቅ ተመርጦ በበረዶ ተጠብቆ ለምሳዎ የሚደርስ ምርጥ የተፈጥሮ ዓሣ።",
    v2: "በታወቁ ሆቴሎች የተዘጋጀ",
    v2d: "በባሕር ዳር አንጋፋ ሼፎች በጥንቃቄ የተጠበሰ አሳ ጥብስ፣ ለስላሳ ጉላሽ፣ ለብለብና የጣና ዱለት።",
    v3: "አስተማማኝ ርክክብ በኮድ",
    v3d: "በቴሌብር ወይም በሲቢኢ ብር በሰላም ከፍለው፤ ዓሣው ደጃፍዎ ሲደርስ በሚስጥር ኮድ የሚረከቡበት።",

    // Marketplace & Preparations
    rawTab: "ትኩስ ያልበሰለ ዓሣ",
    cookedTab: "የተዘጋጁ ጣፋጭ ምግቦች (ሆቴሎች)",
    weight: "ክብደት ይምረጡ",
    prep: "የአዘገጃጀት ሁኔታ",
    whole: "ሙሉ (ያልተነካ)",
    gutted: "ሆዱ የተጸዳና የታጠበ",
    filleted: "የተፈለፈለ ሙልጭ ሙላት (ፊሌ)",
    addToCart: "ወደ ቅርጫት ጨምር",
    deliverTo: "የሚደርስበት ቀበሌ",
    chooseKebele: "ቀበሌ / ክፍለ ከተማ ይምረጡ",
    dishStyle: "የምግብ ዓይነት",
    preparedBy: "የሚያዘጋጀው ሆቴል",
    prepTime: "ደቂቃ",
    cart: "የመረጡት ቅርጫት",
    checkout: "ወደ ክፍያ ሂድ",
    total: "ጠቅላላ ዋጋ",
    payNow: "ክፍያ ፈጽም",
    payUpfront: "ደህንነቱ የተጠበቀ ክፍያ: በቅድሚያ ተከፍሎ እጅዎ ሲደርስ በኮድ የሚረጋገጥ።",
    paymentMethod: "የክፍያ አማራጭ",
    pinOnMap: "አድራሻዎን በካርታ ያመልክቱ",
    deliveryAddress: "ልዩ የመኖሪያ ቤት ወይም የመንገድ ምልክት",

    // Tracking Milestones
    placed: "ትዕዛዙ ተመዝግቧል",
    kitchen: "እየተዘጋጀ / እየታሸገ ነው",
    enRoute: "አጓጓዡ በመንገድ ላይ ነው",
    delivered: "በሰላም ደርሷል",
    deliveryOtp: "የ4-አሃዝ ሚስጥር ቁጥርዎ (ለአጓጓዡ የሚሰጥ)",

    // Driver Portal
    driverFeed: "የአጓጓዥ የሥራ ዝርዝር",
    pickupToken: "የመረከቢያ ሚስጥር ቁጥር (Token)",
    confirmPickup: "መረከቤን አረጋግጥ",
    confirmDelivery: "ርክክብ አረጋግጥ",
    enterOtp: "የደንበኛውን 4-አሃዝ ኮድ ያስገቡ",
    payout: "የማድረሻ ክፍያ",

    // Hotel & Kitchen Portal
    hotelDash: "የሆቴል ኩሽና ገበታ",
    kds: "የኩሽና ትዕዛዞች",
    noOrders: "በአሁኑ ሰዓት ንቁ ትዕዛዝ የለም። አዳዲስ ትዕዛዞች እዚህ ይደርሳሉ።",
    accept: "ትዕዛዝ ተቀብለህ ዝግጅት ጀምር",
    ready: "ምግቡ ተጠናቆ ዝግጁ ሆኗል",
    menuMgmt: "የምግብ ዝርዝር እና ዋጋ",
    prepFee: "የማብሰያ ክፍያ (ብር)",
    available: "ዛሬ ይገኛል",
    outOfStock: "ለዛሬ አልቋል",
    bulkOrder: "ጥሬ ዓሣ በጅምላ እዘዝ",

    // Onboarding & Registration
    onboardingTitle: "እንኳን ወደ ፊሽሊንክ በደህና መጡ! ማንነትዎን ይምረጡ",
    individual: "የቤት ደንበኛ (ግለሰብ)",
    hotel: "ሆቴል / ሬስቶራንት",
    driver: "የባጃጅ / ሞተር አጓጓዥ",
    continue: "ቀጥል",
    fullName: "ሙሉ ስም",
    phone: "ስልክ ቁጥር",
    businessName: "የንግድ / የሆቴል ስም",
    tin: "የንግድ ፈቃድ / ቲን (TIN) ቁጥር",
    contact: "ተጠሪ ሰው",
    capacity: "የኩሽና አቅም (ትዕዛዝ/ሰዓት)",
    vehicle: "የተሽከርካሪ ዓይነት",
    idUpload: "መታወቂያ ወይም መንጃ ፈቃድ ይጫኑ",

    // Community Story
    coopTitle: "የጣና አጥማጆችን በቀጥታ የሚያገናኝ",
    coopQuote:
      "ፊሽሊንክ የባሕር ዳር ዓሣ አጥማጆችን ያለ ደላላ በቀጥታ ከማዕድዎ ጋር በማገናኘት ለአጥማጆች ተገቢውን ዋጋ፣ ለተጠቃሚው ደግሞ ፍጹም ትኩስ ዓሣ ያቀርባል።",
    coopAuthor: "የጣና ሐይቅ ዓሣ አጥማጆች ህብረት ሥራ ማህበር",

    // Audio & Feedback
    soundOn: "የድምፅ ማስጠንቀቂያ በርቷል",
    soundOff: "ድምፅ አጥፋ",
  },
} as const;

export type Key = keyof (typeof dict)["en"] | (string & {});

const Ctx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}>({
  lang: "am",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("am");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fl_lang") as Lang | null;
      if (saved === "en" || saved === "am") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("fl_lang", l);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  };

  const t = (k: Key): string => {
    const langDict = dict[lang] as Record<string, string>;
    const enDict = dict.en as Record<string, string>;
    return langDict[k] ?? enDict[k] ?? k;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);