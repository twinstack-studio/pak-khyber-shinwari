"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { useAddToCart, useCart } from "@/lib/cart";

/**
 * Add button that briefly confirms in place. The tick is the whole point —
 * without it people press twice and end up with two of everything.
 */
export function AddToCart({
  itemId,
  className,
  variant = "solid",
}: {
  itemId: string;
  className?: string;
  variant?: "solid" | "outline" | "icon";
}) {
  const t = useTranslations("cart");
  const addToCart = useAddToCart();
  const { quantityOf } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const inCart = quantityOf(itemId);

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-colors";
  const styles = {
    solid: "bg-pks-500 text-white px-6 py-3 text-sm",
    outline:
      "border border-paper-400 text-ink-700 hover:border-pks-500 hover:text-pks-600 px-5 py-2.5 text-sm",
    icon: "bg-pks-500 text-white h-9 w-9",
  } as const;

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(itemId);
        setJustAdded(true);
      }}
      aria-label={t("add")}
      className={`${base} ${styles[variant]} ${className ?? ""}`}
    >
      {variant === "solid" && (
        <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      )}

      <span className="relative flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {variant !== "icon" && t("added")}
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {variant !== "icon" && t("add")}
              {variant !== "icon" && inCart > 0 && (
                <span className="rounded-full bg-black/15 px-1.5 text-[11px] tabular-nums">
                  {inCart}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

export default AddToCart;
