"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartButton({ solid }: { solid: boolean }) {
  const t = useTranslations("cart");
  const { count, open, hydrated } = useCart();

  return (
    /**
     * The badge lives on this wrapper, not on the button.
     *
     * The button needs `overflow-hidden` to clip the gold wash that sweeps
     * across it on hover — but that also clipped the count, which sits proud
     * of the top corner. Half the number was being cut off.
     */
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={open}
        aria-label={`${t("title")}${count ? ` (${count})` : ""}`}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
          solid ? "bg-pks-500 text-white" : "text-pks-700 bg-white"
        }`}
      >
        <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        <ShoppingBag className="relative h-4 w-4" />
        <span className="relative hidden sm:inline">{t("viewCart")}</span>
      </button>

      {/* The badge pops on every change, so an add is felt as well as seen.
          pointer-events-none keeps the click going through to the button. */}
      <AnimatePresence>
        {hydrated && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 20 }}
            aria-hidden
            className="bg-gold-500 text-ink-900 pointer-events-none absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums shadow-sm ring-2 ring-white"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default CartButton;
