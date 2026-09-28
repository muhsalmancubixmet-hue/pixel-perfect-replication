/* ------------------------------------------------------------------ */
/* Global configuration: currencies, languages, location levels.       */
/* Nothing here is region-specific — Kerala is only one demo market.   */
/* ------------------------------------------------------------------ */

export interface CurrencyConfig {
  code: string;
  name: string;
  locale: string;
}

/** Centralized currency registry — add new currencies here only. */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", name: "Euro", locale: "de-DE" },
  GBP: { code: "GBP", name: "British Pound", locale: "en-GB" },
  AED: { code: "AED", name: "UAE Dirham", locale: "en-AE" },
  INR: { code: "INR", name: "Indian Rupee", locale: "en-IN" },
  CAD: { code: "CAD", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", name: "Australian Dollar", locale: "en-AU" },
  SAR: { code: "SAR", name: "Saudi Riyal", locale: "en-SA" },
  SGD: { code: "SGD", name: "Singapore Dollar", locale: "en-SG" },
};

/** Platform reporting currency (configurable in Settings). Demo figures are stored in this unit. */
export const BASE_CURRENCY = "INR";

export function money(amount: number, currency: string = BASE_CURRENCY) {
  const cfg = CURRENCIES[currency] ?? CURRENCIES[BASE_CURRENCY]!;
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currencySymbol(currency: string = BASE_CURRENCY) {
  const cfg = CURRENCIES[currency] ?? CURRENCIES[BASE_CURRENCY]!;
  return (
    new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.code })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? cfg.code
  );
}

/** Data-driven language registry (localization-ready). */
export const LANGUAGES_CONFIG = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ml", name: "Malayalam", dir: "ltr" },
  { code: "hi", name: "Hindi", dir: "ltr" },
  { code: "ta", name: "Tamil", dir: "ltr" },
  { code: "ar", name: "Arabic", dir: "rtl" },
  { code: "es", name: "Spanish", dir: "ltr" },
  { code: "fr", name: "French", dir: "ltr" },
  { code: "de", name: "German", dir: "ltr" },
] as const;

/** Administrative levels. Countries use whichever subset applies. */
export const LOCATION_LEVELS = ["country", "region", "district", "city", "area"] as const;
export type LocationLevel = (typeof LOCATION_LEVELS)[number];
export const LEVEL_LABEL: Record<LocationLevel, string> = {
  country: "Country",
  region: "Region / State / Province",
  district: "District / County",
  city: "City",
  area: "Local area",
};

export interface GeoPlace {
  country: string;
  countryCode: string;
  region: string;
  district?: string | undefined;
  city: string;
  lat: number;
  lng: number;
  currency: string;
  languages: string[];
}

export const placeLabel = (p: Pick<GeoPlace, "city" | "country">) => `${p.city}, ${p.country}`;

/* ------------------------------------------------------------------ */
/* Demo places. Kerala is one sample market among several.             */
/* ------------------------------------------------------------------ */

const kl = (district: string, city: string, lat: number, lng: number): GeoPlace => ({
  country: "India",
  countryCode: "IN",
  region: "Kerala",
  district,
  city,
  lat,
  lng,
  currency: "INR",
  languages: ["Malayalam", "English"],
});

export const DEMO_KERALA_PLACES: GeoPlace[] = [
  kl("Ernakulam", "Kochi", 9.9312, 76.2673),
  kl("Ernakulam", "Kakkanad", 10.0159, 76.3419),
  kl("Ernakulam", "Aluva", 10.1004, 76.3570),
  kl("Thiruvananthapuram", "Thiruvananthapuram", 8.5241, 76.9366),
  kl("Thiruvananthapuram", "Varkala", 8.7379, 76.7163),
  kl("Kozhikode", "Kozhikode", 11.2588, 75.7804),
  kl("Thrissur", "Thrissur", 10.5276, 76.2144),
  kl("Kottayam", "Kottayam", 9.5916, 76.5222),
  kl("Alappuzha", "Alappuzha", 9.4981, 76.3388),
  kl("Idukki", "Munnar", 10.0889, 77.0595),
  kl("Kannur", "Kannur", 11.8745, 75.3704),
  kl("Malappuram", "Manjeri", 11.1203, 76.1199),
  kl("Wayanad", "Kalpetta", 11.6085, 76.0830),
  kl("Kollam", "Kollam", 8.8932, 76.6141),
];

const g = (
  country: string,
  countryCode: string,
  region: string,
  city: string,
  lat: number,
  lng: number,
  currency: string,
  languages: string[],
  district?: string,
): GeoPlace => ({ country, countryCode, region, city, lat, lng, currency, languages, district });

export const DEMO_GLOBAL_PLACES: GeoPlace[] = [
  g("United Arab Emirates", "AE", "Dubai", "Dubai", 25.2048, 55.2708, "AED", ["English", "Arabic"]),
  g("United Arab Emirates", "AE", "Abu Dhabi", "Abu Dhabi", 24.4539, 54.3773, "AED", ["Arabic", "English"]),
  g("United Kingdom", "GB", "England", "London", 51.5072, -0.1276, "GBP", ["English"], "Greater London"),
  g("United States", "US", "New York", "New York", 40.7128, -74.006, "USD", ["English", "Spanish"], "New York County"),
  g("United States", "US", "California", "Los Angeles", 34.0522, -118.2437, "USD", ["English", "Spanish"], "Los Angeles County"),
  g("Canada", "CA", "Ontario", "Toronto", 43.6532, -79.3832, "CAD", ["English", "French"]),
  g("Singapore", "SG", "Central Region", "Singapore", 1.3521, 103.8198, "SGD", ["English"]),
  g("France", "FR", "Île-de-France", "Paris", 48.8566, 2.3522, "EUR", ["French", "English"]),
  g("Germany", "DE", "Berlin", "Berlin", 52.52, 13.405, "EUR", ["German", "English"]),
  g("India", "IN", "Maharashtra", "Mumbai", 19.076, 72.8777, "INR", ["Hindi", "English"], "Mumbai City"),
  g("India", "IN", "Karnataka", "Bengaluru", 12.9716, 77.5946, "INR", ["English", "Hindi"], "Bengaluru Urban"),
  g("Saudi Arabia", "SA", "Riyadh Province", "Riyadh", 24.7136, 46.6753, "SAR", ["Arabic", "English"]),
  g("Australia", "AU", "New South Wales", "Sydney", -33.8688, 151.2093, "AUD", ["English"]),
];

export const DEMO_PLACES: GeoPlace[] = [...DEMO_KERALA_PLACES, ...DEMO_GLOBAL_PLACES];

/** Haversine distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
