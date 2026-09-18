"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus, Users, X } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { findItem, formatPrice, t as pick } from "@/lib/menu";
import { planFeast } from "@/lib/feast";
import { useCart } from "@/lib/cart";

const EASE = [0.16, 1, 0.3, 1] as const;
const MIN_PEOPLE = 2;
const MAX_PEOPLE = 40;

/**
 * Turns "how many are coming" into a real order.
 *
 * Ordering Shinwari food for a group is genuinely awkward — everything is
 * priced by the kilo and a karahi is not a portion — so most people either
 * over-order the meat or run out of naan. This does the arithmetic and shows
 * its working, then drops the whole thing into the cart.
 */
export function FeastPlanner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("feast");
  const locale = useLocale() as Locale;
  const { add, paymentMethod, open: openCart } = useCart();
  const [people, setPeople] = useState(6);
  const [wholeLamb, setWholeLamb] = useState(false);
  const [added, setAdded] = useState(false);

  const plan = useMemo(
    () => planFeast(people, paymentMethod, wholeLamb),
    [people, paymentMethod, wholeLamb],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const addEverything = () => {
    plan.lines.forEach((line) => add(line.itemId, line.quantity));
    setAdded(true);
    window.setTimeout(() => {
      onClose();
      openCart();
    }, 900);
  };

  const perHead = Math.round(plan.total / plan.people);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="fixed inset-x-0 bottom-0 z-[81] max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[88svh] sm:max-w-3xl sm:rounded-3xl"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="bg-pks-700 relative overflow-hidden px-6 pt-8 pb-7 sm:px-9">
              <div
                aria-hidden
                className="bg-pks-500/40 absolute -top-24 -end-16 h-64 w-64 rounded-full blur-[90px]"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="absolute top-5 end-5 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <Users className="text-gold-300 h-6 w-6" />
                <h2 className="font-display mt-4 text-3xl text-white sm:text-4xl">
                  {t("title")}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                  {t("lede")}
                </p>
              </div>
            </div>

            {/* --- The dial --- */}
            <div className="border-paper-300 border-b px-6 py-7 sm:px-9">
              <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                {t("people")}
              </p>
              <div className="mt-4 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setPeople((n) => Math.max(MIN_PEOPLE, n - 1))}
                  disabled={people <= MIN_PEOPLE}
                  aria-label="-"
                  className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 rounded-full border p-3 transition-colors disabled:opacity-35"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex min-w-24 items-baseline justify-center gap-2">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={people}
                      initial={{ y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -16, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-display text-pks-500 text-5xl tabular-nums"
                    >
                      {people}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-ink-400 text-sm">
                    {people === 1 ? t("person") : t("peoplePlural")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPeople((n) => Math.min(MAX_PEOPLE, n + 1))}
                  disabled={people >= MAX_PEOPLE}
                  aria-label="+"
                  className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 rounded-full border p-3 transition-colors disabled:opacity-35"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <input
                  type="range"
                  min={MIN_PEOPLE}
                  max={MAX_PEOPLE}
                  value={people}
                  onChange={(event) => setPeople(Number(event.target.value))}
                  aria-label={t("people")}
                  className="accent-pks-500 ms-auto hidden h-1 flex-1 cursor-pointer sm:block"
                />
              </div>
            </div>

            {/* Whole-lamb upgrade. Offered, never assumed — it more than
                doubles the bill, so the guest has to ask for it. */}
            <AnimatePresence initial={false}>
              {plan.canOfferLamb && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="border-paper-300 overflow-hidden border-b"
                >
                  <label className="hover:bg-paper-100 flex cursor-pointer items-start gap-4 px-6 py-5 transition-colors sm:px-9">
                    <input
                      type="checkbox"
                      checked={wholeLamb}
                      onChange={(event) => setWholeLamb(event.target.checked)}
                      className="accent-pks-500 mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer"
                    />
                    <span>
                      <span className="text-ink-800 block text-sm font-semibold">
                        {t("lambUpgrade")}
                      </span>
                      <span className="text-ink-400 mt-1 block text-xs leading-relaxed">
                        {t("lambUpgradeNote")}
                      </span>
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- The order it built --- */}
            <div className="px-6 py-7 sm:px-9">
              <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                {t("yourOrder")}
              </p>

              <ul className="mt-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {plan.lines.map((line) => {
                    const item = findItem(line.itemId);
                    if (!item) return null;
                    return (
                      <motion.li
                        key={line.itemId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="border-paper-300 flex items-start gap-4 border-b py-3.5"
                      >
                        <span className="bg-pks-50 text-pks-600 mt-0.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums">
                          ×{line.quantity}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-ink-800 text-sm font-semibold">
                            {pick(item.name, locale)}
                            {item.variant && (
                              <span className="text-ink-400 font-normal">
                                {" "}
                                · {pick(item.variant, locale)}
                              </span>
                            )}
                          </p>
                          {/* Saying why each line is here is the whole trick —
                              it turns a black box into advice. */}
                          <p className="text-ink-400 mt-1 text-xs leading-snug">
                            {t(`reasons.${line.reasonKey}`)}
                          </p>
                        </div>
                        <span className="text-ink-700 text-sm tabular-nums">
                          {formatPrice(item.price * line.quantity, locale)}
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">{t("subtotal")}</dt>
                  <dd className="text-ink-800 tabular-nums">
                    {formatPrice(plan.subtotal, locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">
                    {t("tax")} · {plan.taxRate}%
                  </dt>
                  <dd className="text-ink-800 tabular-nums">
                    {formatPrice(plan.tax, locale)}
                  </dd>
                </div>
                <div className="border-paper-300 flex items-baseline justify-between border-t pt-3">
                  <dt className="text-ink-800 font-semibold">{t("total")}</dt>
                  <dd className="text-end">
                    <span className="font-display text-pks-600 text-2xl tabular-nums">
                      {formatPrice(plan.total, locale)}
                    </span>
                    <span className="text-ink-400 mt-0.5 block text-xs tabular-nums">
                      {formatPrice(perHead, locale)} {t("perHead")}
                    </span>
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={addEverything}
                className="group bg-pks-500 relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-4 text-sm font-semibold text-white"
              >
                <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                <span className="group-hover:text-ink-900 relative flex items-center gap-2 transition-colors">
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t("added")}
                    </>
                  ) : (
                    t("addAll")
                  )}
                </span>
              </button>

              <p className="text-ink-400 mt-4 text-center text-xs leading-relaxed">
                {t("note")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FeastPlanner;
