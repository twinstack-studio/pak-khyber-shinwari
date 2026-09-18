import menuData from "../../data/menu.json";
import type { Locale } from "@/i18n/routing";

/* ---------------------------------------------------------------
   The printed menu card, transcribed. This file is the seed for the
   database and the fallback the site renders if the DB is unreachable,
   so the menu is never blank in front of a customer.
   --------------------------------------------------------------- */

export type Localized = { en: string; ur: string };
export type LocalizedList = { en: string[]; ur: string[] };

export type MenuItem = {
  id: string;
  name: Localized;
  variant?: Localized;
  price: number;
  includes?: LocalizedList;
  signature?: boolean;
  needs_verification?: string;
};

export type MenuCategory = {
  id: string;
  name: Localized;
  featured?: boolean;
  note?: Localized;
  source_note?: string;
  per_piece?: { label: Localized; price: number; needs_verification?: string }[];
  items: MenuItem[];
};

// Omit before intersecting: an intersection would leave the raw JSON's
// literal union for `categories` and TypeScript would keep picking that,
// so `item.variant` would appear not to exist on half the branches.
export type Menu = Omit<typeof menuData, "categories"> & {
  categories: MenuCategory[];
};

export const menu = menuData as Menu;
export const categories = menu.categories;
export const restaurant = menu.restaurant;
export const tax = menu.tax;
export const packaging = menu.packaging;

/** Pick the right half of a `{ en, ur }` pair. */
export function t(value: Localized, locale: Locale): string {
  return value[locale];
}

/** `Rs 4,250` / `4,250 روپے` — the currency word sits on the reading-end side. */
export function formatPrice(price: number, locale: Locale): string {
  const amount = new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    maximumFractionDigits: 0,
  }).format(price);
  return locale === "ur" ? `${amount} روپے` : `Rs ${amount}`;
}

export const allItems: (MenuItem & { categoryId: string })[] = categories.flatMap(
  (category) => category.items.map((item) => ({ ...item, categoryId: category.id })),
);

export function findItem(id: string) {
  return allItems.find((item) => item.id === id);
}

export const signatureItems = allItems.filter((item) => item.signature);

/**
 * Menu prices are pre-tax. FBR rates printed on the card: 5% by card, 16% by cash.
 * Every total the customer sees goes through here so the two never drift apart.
 */
export type PaymentMethod = "card" | "wallet" | "cod";

export function taxRateFor(method: PaymentMethod): number {
  // Wallets (JazzCash / Easypaisa) settle digitally, so they take the card rate.
  return method === "cod" ? tax.cash_payment_percent : tax.card_payment_percent;
}

export function priceBreakdown(subtotal: number, method: PaymentMethod) {
  const rate = taxRateFor(method);
  const taxAmount = Math.round((subtotal * rate) / 100);
  return { subtotal, rate, tax: taxAmount, total: subtotal + taxAmount };
}
