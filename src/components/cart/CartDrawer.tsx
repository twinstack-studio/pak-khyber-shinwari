"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatPrice, tax as taxInfo, t as pick, type PaymentMethod } from "@/lib/menu";
import { useCart } from "@/lib/cart";

const EASE = [0.16, 1, 0.3, 1] as const;

const METHODS: { id: PaymentMethod; key: "methodCod" | "methodCard" | "methodWallet" }[] = [
  { id: "cod", key: "methodCod" },
  { id: "card", key: "methodCard" },
  { id: "wallet", key: "methodWallet" },
];

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const {
    lines,
    count,
    subtotal,
    taxRate,
    tax,
    total,
    paymentMethod,
    setPaymentMethod,
    setQuantity,
    remove,
    clear,
    isOpen,
    close,
  } = useCart();

  // Escape closes; body scroll locks while the panel is up.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="bg-paper-100 fixed inset-y-0 end-0 z-[71] flex w-full max-w-md flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <header className="border-paper-300 flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-display text-ink-800 text-xl">{t("title")}</h2>
                <p className="text-ink-400 mt-0.5 text-xs">
                  {count} {count === 1 ? t("item") : t("items")}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-ink-500 hover:bg-paper-200 hover:text-ink-800 rounded-full p-2 transition-colors"
                aria-label={t("remove")}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="bg-paper-200 rounded-full p-5">
                  <ShoppingBag className="text-ink-400 h-8 w-8" />
                </div>
                <p className="text-ink-500 text-sm">{t("empty")}</p>
                <Link
                  href="/menu"
                  onClick={close}
                  className="bg-pks-500 rounded-full px-6 py-3 text-sm font-semibold text-white"
                >
                  {t("emptyCta")}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[color:var(--color-paper-300)] overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-5">
                          <div className="min-w-0 flex-1">
                            <p className="text-ink-800 text-sm leading-snug font-semibold">
                              {pick(line.name, locale)}
                            </p>
                            {line.variant && (
                              <p className="text-ink-400 mt-0.5 text-xs">
                                {pick(line.variant, locale)}
                              </p>
                            )}
                            <p className="text-ink-400 mt-1.5 text-xs">
                              {formatPrice(line.price, locale)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2.5">
                            <p className="font-display text-ink-800 text-base whitespace-nowrap">
                              {formatPrice(line.lineTotal, locale)}
                            </p>
                            <div className="border-paper-400 flex items-center rounded-full border">
                              <button
                                type="button"
                                onClick={() => setQuantity(line.id, line.quantity - 1)}
                                className="text-ink-500 hover:text-pks-600 p-1.5 transition-colors"
                                aria-label={t("decrease")}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-ink-800 w-7 text-center text-sm font-semibold tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(line.id, line.quantity + 1)}
                                className="text-ink-500 hover:text-pks-600 p-1.5 transition-colors"
                                aria-label={t("increase")}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(line.id)}
                              className="text-ink-400 hover:text-pks-600 inline-flex items-center gap-1 text-[11px] transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              {t("remove")}
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-paper-300 bg-white border-t px-6 py-5">
                  {/* Payment method drives the tax rate, so it belongs next to
                      the total rather than three screens later at checkout. */}
                  <p className="text-ink-400 text-[10px] tracking-[0.2em] uppercase">
                    {t("paymentMethod")}
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    {METHODS.map((method) => {
                      const selected = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          aria-pressed={selected}
                          className={`relative flex-1 overflow-hidden rounded-full border px-2 py-2 text-xs font-semibold transition-colors ${
                            selected
                              ? "border-pks-500 text-white"
                              : "border-paper-400 text-ink-500 hover:border-pks-300"
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="cart-method"
                              className="bg-pks-500 absolute inset-0"
                              transition={{ type: "spring", stiffness: 340, damping: 32 }}
                            />
                          )}
                          <span className="relative">{t(method.key)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-500">{t("subtotal")}</dt>
                      <dd className="text-ink-800 tabular-nums">
                        {formatPrice(subtotal, locale)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">
                        {t("tax")} · {taxRate}%
                      </dt>
                      <dd className="text-ink-800 tabular-nums">
                        {formatPrice(tax, locale)}
                      </dd>
                    </div>
                    <div className="border-paper-300 flex justify-between border-t pt-3">
                      <dt className="text-ink-800 font-semibold">{t("total")}</dt>
                      <dd className="font-display text-pks-600 text-xl tabular-nums">
                        {formatPrice(total, locale)}
                      </dd>
                    </div>
                  </dl>

                  <p className="text-ink-400 mt-3 text-[11px] leading-relaxed">
                    {t("taxHint", {
                      cash: taxInfo.cash_payment_percent,
                      card: taxInfo.card_payment_percent,
                    })}
                  </p>

                  <Link
                    href="/checkout"
                    onClick={close}
                    className="group bg-pks-500 relative mt-4 block overflow-hidden rounded-full py-3.5 text-center text-sm font-semibold text-white"
                  >
                    <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                    <span className="group-hover:text-ink-900 relative transition-colors">
                      {t("checkout")}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={clear}
                    className="text-ink-400 hover:text-pks-600 mt-3 w-full text-center text-xs transition-colors"
                  >
                    {t("clear")}
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
