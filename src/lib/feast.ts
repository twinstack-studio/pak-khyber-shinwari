import { findItem, priceBreakdown, type PaymentMethod } from "@/lib/menu";

/* ---------------------------------------------------------------
   "Feed my table" — turn a number of guests into an actual order.

   Ordering Shinwari food for a big group is genuinely hard: everything is
   sold by the kilo, a karahi is not a portion, and people routinely
   under-order the naan and over-order the meat. This does the arithmetic.

   Every ratio below is stated openly in RATIONALE so the suggestion can be
   argued with rather than trusted blindly — and so PKS can correct any of
   them from one place once they tell us their real serving sizes.
   --------------------------------------------------------------- */

export const SERVING = {
  /** One kilo of karahi or BBQ comfortably feeds this many people. */
  peoplePerKgMeat: 3,
  /** Plates of Kabuli pulao per person. */
  pulaoPlatesPerPerson: 0.5,
  /** Afghani naan per person. */
  naanPerPerson: 1.5,
  /** One salad / one raita covers this many people. */
  peoplePerSalad: 4,
  /** One qahwa thermos covers this many people. */
  peoplePerThermos: 4,
  /**
   * From this many guests up we offer the whole dum pukht lamb — but never
   * select it for them. At Rs 42,500 it more than doubles the bill, and a
   * planner that silently does that to somebody is not helping them.
   */
  wholeLambSuggestFrom: 12,
} as const;

export type FeastLine = {
  itemId: string;
  quantity: number;
  /** Why this line is here, in the guest's language. */
  reasonKey: string;
};

export type FeastPlan = {
  people: number;
  lines: FeastLine[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  usesWholeLamb: boolean;
  /** Whether the whole-lamb upgrade is worth offering at this table size. */
  canOfferLamb: boolean;
};

/** Round up, but never below one. */
function atLeastOne(value: number): number {
  return Math.max(1, Math.ceil(value));
}

export function planFeast(
  people: number,
  paymentMethod: PaymentMethod = "cod",
  wholeLamb = false,
): FeastPlan {
  const guests = Math.max(1, Math.min(60, Math.round(people)));
  const lines: FeastLine[] = [];

  const canOfferLamb = guests >= SERVING.wholeLambSuggestFrom;
  const usesWholeLamb = wholeLamb && canOfferLamb;

  if (usesWholeLamb) {
    lines.push({
      itemId: "full-dum-pukht-lamb",
      quantity: 1,
      reasonKey: "wholeLamb",
    });
  } else {
    const kilos = atLeastOne(guests / SERVING.peoplePerKgMeat);
    // Split the meat across two dishes once there is enough to be worth it,
    // so a table is not eating the same thing all evening.
    if (kilos >= 2) {
      lines.push({
        itemId: "chicken-karahi-1kg",
        quantity: Math.ceil(kilos / 2),
        reasonKey: "karahi",
      });
      lines.push({
        itemId: "beef-chapli-1kg",
        quantity: Math.floor(kilos / 2),
        reasonKey: "chapli",
      });
    } else {
      lines.push({
        itemId: "chicken-karahi-half",
        quantity: guests <= 2 ? 1 : 2,
        reasonKey: "karahi",
      });
    }

    // A few seekh kababs to start, once the table is big enough to share.
    if (guests >= 4) {
      lines.push({
        itemId: guests >= 8 ? "chicken-seekh-12" : "chicken-seekh-06",
        quantity: 1,
        reasonKey: "seekh",
      });
    }
  }

  lines.push({
    itemId: "kabli-beef-pullao",
    quantity: atLeastOne(guests * SERVING.pulaoPlatesPerPerson),
    reasonKey: "pulao",
  });

  lines.push({
    itemId: "afghani-naan",
    quantity: atLeastOne(guests * SERVING.naanPerPerson),
    reasonKey: "naan",
  });

  lines.push({
    itemId: "salad",
    quantity: atLeastOne(guests / SERVING.peoplePerSalad),
    reasonKey: "salad",
  });

  lines.push({
    itemId: "raita",
    quantity: atLeastOne(guests / SERVING.peoplePerSalad),
    reasonKey: "raita",
  });

  lines.push({
    itemId: "qahwa-thermos",
    quantity: atLeastOne(guests / SERVING.peoplePerThermos),
    reasonKey: "qahwa",
  });

  // Drop anything the menu no longer carries rather than pricing a ghost.
  const valid = lines.filter((line) => findItem(line.itemId));

  const subtotal = valid.reduce((sum, line) => {
    const item = findItem(line.itemId);
    return sum + (item ? item.price * line.quantity : 0);
  }, 0);

  const breakdown = priceBreakdown(subtotal, paymentMethod);

  return {
    people: guests,
    lines: valid,
    subtotal,
    tax: breakdown.tax,
    total: breakdown.total,
    taxRate: breakdown.rate,
    usesWholeLamb,
    canOfferLamb,
  };
}
