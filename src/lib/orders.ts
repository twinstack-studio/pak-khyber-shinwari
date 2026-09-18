import { z } from "zod";
import { findItem, priceBreakdown, type PaymentMethod } from "@/lib/menu";

/* ---------------------------------------------------------------
   Order rules, shared by the checkout form and the API route.

   The single most important thing here: the server never accepts a price
   from the browser. The request carries item ids and quantities only, and
   every rupee is recomputed from the menu. Otherwise anyone with the
   developer console can order a whole lamb for one rupee.
   --------------------------------------------------------------- */

export const ORDER_TYPES = ["DELIVERY", "PICKUP"] as const;
export const PAYMENT_METHODS = ["COD", "CARD", "WALLET"] as const;

export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "ON_THE_WAY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Pakistani mobile numbers, in the shapes people actually type them:
 * 03153043333, 0315 304 3333, +923153043333, 92 315 3043333.
 */
const PHONE = /^(?:\+?92|0)?3\d{2}[\s-]?\d{7}$/;

export function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  // Reduce every accepted shape to a single stored form: 03XXXXXXXXX.
  if (digits.startsWith("92")) return `0${digits.slice(2)}`;
  if (digits.startsWith("3")) return `0${digits}`;
  return digits;
}

export const orderSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "nameTooShort")
      .max(80, "nameTooLong"),
    phone: z
      .string()
      .trim()
      .refine((value) => PHONE.test(value.replace(/[\s-]/g, "")), "phoneInvalid"),
    orderType: z.enum(ORDER_TYPES),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    paymentMethod: z.enum(PAYMENT_METHODS),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          quantity: z.number().int().min(1).max(50),
        }),
      )
      .min(1, "cartEmpty")
      .max(60),
  })
  // A delivery with no address is not an order, it is a guess.
  .refine(
    (order) =>
      order.orderType !== "DELIVERY" ||
      (order.address ?? "").trim().length >= 10,
    { message: "addressRequired", path: ["address"] },
  );

export type OrderInput = z.infer<typeof orderSchema>;

const PAYMENT_TO_TAX: Record<(typeof PAYMENT_METHODS)[number], PaymentMethod> = {
  COD: "cod",
  CARD: "card",
  WALLET: "wallet",
};

export type PricedLine = {
  itemId: string;
  nameEn: string;
  nameUr: string;
  variantEn: string | null;
  variantUr: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  /** Ids the browser sent that are not on the menu. */
  unknownItems: string[];
};

/** Rebuilds the order from the menu. The client's prices are ignored. */
export function priceOrder(
  items: { id: string; quantity: number }[],
  paymentMethod: (typeof PAYMENT_METHODS)[number],
): PricedOrder {
  const unknownItems: string[] = [];
  const lines: PricedLine[] = [];

  for (const entry of items) {
    const item = findItem(entry.id);
    if (!item) {
      unknownItems.push(entry.id);
      continue;
    }
    lines.push({
      itemId: item.id,
      nameEn: item.name.en,
      nameUr: item.name.ur,
      variantEn: item.variant?.en ?? null,
      variantUr: item.variant?.ur ?? null,
      unitPrice: item.price,
      quantity: entry.quantity,
      lineTotal: item.price * entry.quantity,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const breakdown = priceBreakdown(subtotal, PAYMENT_TO_TAX[paymentMethod]);

  return {
    lines,
    subtotal,
    taxRate: breakdown.rate,
    taxAmount: breakdown.tax,
    total: breakdown.total,
    unknownItems,
  };
}

/**
 * PKS-7QK2M — short enough to read down a phone line, and drawn from an
 * alphabet with no 0/O or 1/I so nobody mishears it.
 */
const ALPHABET = "23456789ACDEFGHJKLMNPQRSTUVWXYZ";

export function makeReference(): string {
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PKS-${code}`;
}
