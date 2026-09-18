import { cookies } from "next/headers";
import { locales, localeDirection, type Locale } from "@/i18n/routing";

/* ---------------------------------------------------------------
   The staff panel picks its own language.

   The public site carries the locale in the URL (/en, /ur) because those
   pages are shared and indexed. The panel is a private tool used by the
   same few people every day, so its language belongs to the person, not
   the link — a cookie, set once, remembered.
   --------------------------------------------------------------- */

export const ADMIN_LOCALE_COOKIE = "pks-admin-locale";

export async function getAdminLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export async function getAdminDirection() {
  return localeDirection[await getAdminLocale()];
}

export async function getAdminMessages(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default;
}
