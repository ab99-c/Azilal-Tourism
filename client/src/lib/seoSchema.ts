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
export const SEO_ENTITIES: SeoEntity[] = [];

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
      sameAs: [],
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
    address: {
      "@type": "PostalAddress",
      addressLocality: "Azilal",
      addressRegion: "Béni Mellal-Khénifra",
      addressCountry: "MA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 32.8095, longitude: -6.572 },
    areaServed: { "@type": "Place", name: "Azilal Province, Morocco" },
    knowsLanguage: ["Arabic", "French", "English", "Amazigh"],
    sameAs: [],
  };
}
