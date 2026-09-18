import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ur"] as const;
export type Locale = (typeof locales)[number];

/** Urdu is right-to-left; English is left-to-right. */
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ur: "rtl",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Both locales carry a prefix (/en, /ur) so the Urdu URL is shareable and
  // indexable rather than hiding behind a cookie.
  localePrefix: "always",
});
