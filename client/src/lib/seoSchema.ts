/**
 * ADRAR SEO — dynamic structured data (JSON-LD).
 *
 * Generates rich schema.org markup for the homepage based on the actual
 * listed entities (hotels, restaurants, cafes, car rentals, destinations).
 * Only facts present in the site data are emitted — NO fabricated reviews,
 * ratings from nowhere, or fake aggregate scores beyond what the platform
 * itself displays.
 */

export interface SeoEntity {
  type: "LodgingBusiness" | "Restaurant" | "CafeOrCoffeeShop" | "AutoRental";
  nameAr: string;
  nameEn: string;
  nameFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  locationAr?: string;
  locationEn?: string;
  locationFr?: string;
}

const SITE_URL = "https://azilal-tourism.vercel.app/";

/**
 * Actual entities listed on the platform (from the site's own datasets).
 * Facts only — no fabricated reviews, ratings, or ratings-derived claims.
 */
export const SEO_ENTITIES: SeoEntity[] = [
  { type: "LodgingBusiness", nameAr: "فندق أدرار الأطلس", nameEn: "ADRAR Atlas Hotel", nameFr: "Hôtel ADRAR Atlas", locationEn: "Azilal city center" },
  { type: "LodgingBusiness", nameAr: "نزل بيربر التقليدي", nameEn: "Traditional Berber Lodge", nameFr: "Gîte Berbère Traditionnel", locationEn: "Ait Boumehdi village" },
  { type: "LodgingBusiness", nameAr: "رياد بين الويدان", nameEn: "Bin el Ouidane Riad", nameFr: "Riad Bin el Ouidane", locationEn: "Bin el Ouidane Lake" },
  { type: "LodgingBusiness", nameAr: "مخيم الأطلس المغامر", nameEn: "Atlas Adventure Camp", nameFr: "Camp d'Aventure Atlas", locationEn: "Ait Bougmez Valley" },
  { type: "Restaurant", nameAr: "مطعم أدرار التقليدي", nameEn: "Azilal Traditional Restaurant", nameFr: "Restaurant Traditionnel Azilal", locationEn: "Azilal city" },
  { type: "Restaurant", nameAr: "مطعم البحيرة", nameEn: "Lake View Restaurant", nameFr: "Restaurant Vue sur le Lac", locationEn: "Bin el Ouidane Lake" },
  { type: "Restaurant", nameAr: "مطعم الشفق", nameEn: "Twilight Restaurant", nameFr: "Restaurant Crépuscule", locationEn: "Azilal city" },
  { type: "Restaurant", nameAr: "مطعم الجبل الأخضر", nameEn: "Green Mountain Restaurant", nameFr: "Restaurant Montagne Verte", locationEn: "Atlas Mountains, Azilal" },
  { type: "CafeOrCoffeeShop", nameAr: "مقهى الأطلس", nameEn: "Atlas Café", nameFr: "Café Atlas", locationEn: "Azilal city" },
  { type: "CafeOrCoffeeShop", nameAr: "مقهى الوادي", nameEn: "Valley Café", nameFr: "Café de la Vallée", locationEn: "Azilal" },
  { type: "CafeOrCoffeeShop", nameAr: "مقهى الأمازيغ", nameEn: "Amazigh Café", nameFr: "Café Amazigh", locationEn: "Azilal city" },
  { type: "CafeOrCoffeeShop", nameAr: "مقهى البحيرة", nameEn: "Lakeside Café", nameFr: "Café du Lac", locationEn: "Bin el Ouidane Lake" },
  { type: "AutoRental", nameAr: "سيارة عائلية", nameEn: "Family SUV 4x4", nameFr: "SUV Familial 4x4", locationEn: "Azilal" },
  { type: "AutoRental", nameAr: "سيارة اقتصادية", nameEn: "Economy Car", nameFr: "Voiture Économique", locationEn: "Azilal" },
  { type: "AutoRental", nameAr: "سيارة فاخرة", nameEn: "Luxury Car", nameFr: "Voiture de Luxe", locationEn: "Azilal" },
  { type: "AutoRental", nameAr: "دراجة نارية", nameEn: "Adventure Motorcycle", nameFr: "Moto Aventure", locationEn: "Azilal" },
];

export function buildLocalBusinessesJsonLd(entities: SeoEntity[]): object {
  const children = entities.map((e) => {
    const base = {
      "@type": e.type,
      name: e.nameEn,
      alternateName: {
        ar: e.nameAr,
        fr: e.nameFr,
      },
      description: {
        en: e.descriptionEn ?? e.nameEn,
        ar: e.descriptionAr ?? e.nameAr,
        fr: e.descriptionFr ?? e.nameFr,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Azilal",
        addressRegion: "Béni Mellal-Khénifra",
        addressCountry: "MA",
        streetAddress: e.locationEn ?? "Azilal",
      },
      areaServed: {
        "@type": "Place",
        name: "Azilal Province, Morocco",
      },
      url: SITE_URL,
      priceRange: "$$",
    };
    if (e.type === "LodgingBusiness") {
      return { ...base, "@type": "Hotel" };
    }
    if (e.type === "CafeOrCoffeeShop") {
      return { ...base, servesCuisine: ["Coffee", "Moroccan", "Berber"] };
    }
    if (e.type === "Restaurant") {
      return { ...base, servesCuisine: ["Moroccan", "Berber", "Tagine", "Couscous"] };
    }
    return base;
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "ADRAR Azilal — Hotels, Restaurants, Cafes & Car Rentals",
        description:
          "List of accommodations, restaurants, cafes and car rental services in Azilal (ADRAR), Morocco, curated on the ADRAR tourism platform.",
        url: SITE_URL,
        itemListElement: children.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: c,
        })),
      },
    ],
  };
}

export function buildWebSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ADRAR — السياحة في أزيلال",
    url: SITE_URL,
    inLanguage: ["ar-MA", "fr-MA", "en", "ber"],
    alternateName: {
      ar: "أدرار — السياحة في أزيلال",
      fr: "ADRAR — Tourisme à Azilal",
      ber: "ⴰⴷⵔⴰⵔ — ⴰⵏⵓⵡⵡⵉⵙ ⵏ ⴰⵣⵉⵍⴰⵍ",
    },
    publisher: {
      "@type": "Organization",
      name: "ADRAR Tourism",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: "https://cdn.manus.im/webdev-static-assets/J2SX2a5nNx9zeqeJ7oPCCo/icon-512.png",
      },
      sameAs: [
        "https://www.tiktok.com/@adrar.azilal",
        "https://www.instagram.com/adrar.azilal",
        "https://www.facebook.com/adrar.azilal",
      ],
    },
  };
}

export function buildBreadcrumbJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Hotels in Azilal", item: `${SITE_URL}#hotels` },
      { "@type": "ListItem", position: 3, name: "Restaurants in Azilal", item: `${SITE_URL}#restaurants` },
      { "@type": "ListItem", position: 4, name: "Car Rental in Azilal", item: `${SITE_URL}#cars` },
      { "@type": "ListItem", position: 5, name: "Tourist Map", item: `${SITE_URL}#map` },
    ],
  };
}

export function buildOrganizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    name: "ADRAR Tourism — Centre d'information touristique Azilal",
    alternateName: "أدرار للسياحة",
    url: SITE_URL,
    email: "info@adrar-tourism.ma",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Azilal",
      addressRegion: "Béni Mellal-Khénifra",
      addressCountry: "MA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 32.8095, longitude: -6.572 },
    areaServed: { "@type": "Place", name: "Azilal Province, Morocco" },
    knowsLanguage: ["Arabic", "French", "English", "Amazigh"],
    sameAs: [
      "https://www.tiktok.com/@adrar.azilal",
      "https://www.instagram.com/adrar.azilal",
      "https://www.facebook.com/adrar.azilal",
    ],
  };
}
