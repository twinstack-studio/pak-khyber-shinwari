"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { findItem, formatPrice, t as pick } from "@/lib/menu";
import { turntables } from "@/lib/turntables";
import { dishPhoto, photoAlt } from "@/lib/photos";
import { GoldRule, Reveal } from "./motion/primitives";
import AddToCart from "./cart/AddToCart";

const DishTurntable = dynamic(
  () => import("./DishTurntable").then((m) => m.DishTurntable),
  {
    ssr: false,
    loading: () => (
      <div className="bg-paper-200 flex aspect-4/5 w-full items-center justify-center">
        <div className="border-pks-500/25 border-t-pks-500 h-10 w-10 animate-spin rounded-full border-2" />
      </div>
    ),
  },
);

/** Each showcase dish points at a real menu item, so price never drifts. */
const SHOWCASE = [
  "ran-sajji",
  "chicken-sulemani-karahi-1kg",
  "beef-chapli-1kg",
  "kabli-beef-pullao",
  "full-platter",
];

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------
   Two layouts.

   On a wide screen the plate sits beside the writing, and a ruled list
   picks between dishes — everything is visible at once.

   On a phone that arrangement forced a scroll back up to the photograph on
   every tap, so the phone gets a swipeable carousel instead: one dish per
   card, photo and words and price together, nothing to hunt for.
   --------------------------------------------------------------- */

function DishPlate({
  dishId,
  locale,
  hint,
  priority,
}: {
  dishId: string;
  locale: Locale;
  hint?: string;
  priority?: boolean;
}) {
  const turntable = turntables[dishId];
  const item = findItem(dishId);
  const photo = dishPhoto(dishId);

  return (
    <DishTurntable
      turntable={turntable}
      photo={photo}
      label={
        photo ? photoAlt(photo, locale) : item ? pick(item.name, locale) : dishId
      }
      className="h-full w-full"
      dragHint={turntable?.ready ? hint : undefined}
      priority={priority}
    />
  );
}

function DishCopy({
  dishId,
  locale,
  index,
  total,
  tag,
  ofLabel,
  description,
}: {
  dishId: string;
  locale: Locale;
  index: number;
  total: number;
  tag: string;
  ofLabel: string;
  description: string;
}) {
  const item = findItem(dishId);
  if (!item) return null;

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="bg-pks-500 rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
          {tag}
        </span>
        <span className="text-ink-400 text-sm tabular-nums">
          {String(index + 1).padStart(2, "0")}{" "}
          <span className="text-ink-400/60">{ofLabel}</span>{" "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <GoldRule className="mt-6 w-24 origin-left" />

      <h2 className="font-display text-ink-800 mt-7 text-4xl leading-[1.08] sm:text-5xl xl:text-6xl">
        {pick(item.name, locale)}
      </h2>
      {item.variant && (
        <p className="text-pks-500 mt-3 text-sm tracking-[0.14em] uppercase">
          {pick(item.variant, locale)}
        </p>
      )}

      <p className="text-ink-600 mt-7 max-w-xl text-base leading-relaxed">
        {description}
      </p>

      {item.includes && (
        <ul className="text-ink-600 mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {item.includes[locale].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="bg-gold-500 mt-2 h-1 w-1 shrink-0 rounded-full" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function SignatureDishes() {
  const t = useTranslations("signature");
  const locale = useLocale() as Locale;
  const [active, setActive] = useState(0);

  const currentId = SHOWCASE[active];
  const item = findItem(currentId);

  /* ---- carousel plumbing (phones only) ---- */
  const track = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const onTrackScroll = useCallback(() => {
    const element = track.current;
    if (!element) return;
    // Which card is nearest the middle of the viewport?
    const index = Math.round(element.scrollLeft / element.clientWidth);
    setSlide(Math.abs(index));
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    element.addEventListener("scroll", onTrackScroll, { passive: true });
    return () => element.removeEventListener("scroll", onTrackScroll);
  }, [onTrackScroll]);

  function goToSlide(index: number) {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: index * element.clientWidth * (locale === "ur" ? -1 : 1),
      behavior: "smooth",
    });
  }

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      {/* Oversized index numeral behind everything. */}
      <AnimatePresence mode="wait">
        <motion.span
          key={active}
          aria-hidden
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-pks-500/5 pointer-events-none absolute top-4 end-0 hidden text-[20rem] leading-none select-none lg:block sm:text-[28rem]"
        >
          {String(active + 1).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>

      {/* ================= phones: one dish per card =================
          Full-bleed: the photograph fills the card and the words sit on it.
          Stacking a tall photo above a short block of copy left half the
          screen empty on the dishes that carry no "includes" list. =========== */}
      <div className="lg:hidden">
        <div
          ref={track}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SHOWCASE.map((dishId, index) => {
            const dish = findItem(dishId);
            return (
              <article
                key={dishId}
                className="w-full shrink-0 snap-center px-5 sm:px-8"
                aria-label={dish ? pick(dish.name, locale) : dishId}
              >
                <div className="relative h-[32rem] overflow-hidden rounded-[1.75rem] shadow-[0_28px_70px_-30px_rgba(207,46,40,0.55)] sm:h-[36rem]">
                  <DishPlate
                    dishId={dishId}
                    locale={locale}
                    hint={t("hint")}
                    priority={index === 0}
                  />

                  {/* Enough shadow under the type to read on any photograph. */}
                  <div
                    aria-hidden
                    className="from-pks-950 via-pks-950/70 absolute inset-0 bg-gradient-to-t via-45% to-transparent"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                    <span className="bg-pks-500 rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                      {t("tag")}
                    </span>
                    <span className="rounded-full bg-black/35 px-3 py-1.5 text-[11px] text-white/85 tabular-nums backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                      <span className="text-white/45"> / </span>
                      {String(SHOWCASE.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h2 className="font-display text-[2rem] leading-[1.08] text-white">
                      {dish ? pick(dish.name, locale) : dishId}
                    </h2>
                    {dish?.variant && (
                      <p className="text-gold-300 mt-1.5 text-[11px] tracking-[0.18em] uppercase">
                        {pick(dish.variant, locale)}
                      </p>
                    )}

                    <p className="mt-3.5 text-sm leading-relaxed text-white/75">
                      {t(`dishes.${dishId}`)}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="font-display text-2xl text-white tabular-nums">
                        {dish ? formatPrice(dish.price, locale) : ""}
                      </span>
                      <AddToCart itemId={dishId} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Dots. Wide enough to be a comfortable tap target, not just a dot. */}
        <div className="mt-7 flex items-center justify-center gap-2 px-5">
          {SHOWCASE.map((dishId, index) => {
            const dish = findItem(dishId);
            const current = index === slide;
            return (
              <button
                key={dishId}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={dish ? pick(dish.name, locale) : dishId}
                aria-current={current ? "true" : undefined}
                className="py-2"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-400 ${
                    current ? "bg-pks-500 w-8" : "bg-paper-400 w-4"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p className="text-ink-400 mt-4 px-5 text-center text-[11px] tracking-[0.2em] uppercase">
          {t("swipeHint")}
        </p>

        <div className="mt-8 px-5 text-center sm:px-8">
          <Link
            href="/menu"
            className="group text-pks-600 inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide"
          >
            {t("viewMenu")}
            <span
              className="transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>
      </div>

      {/* ================= wide screens: plate beside the writing ============ */}
      <div className="relative mx-auto hidden max-w-7xl px-5 sm:px-8 lg:block">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <Reveal y={44}>
            <div className="relative">
              <div
                aria-hidden
                className="border-gold-500/40 absolute -inset-4 rounded-[2rem] border sm:-inset-6"
              />
              <div className="bg-paper-200 relative aspect-4/5 overflow-hidden rounded-[1.6rem] shadow-[0_34px_90px_-32px_rgba(207,46,40,0.5)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentId}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <DishPlate dishId={currentId} locale={locale} hint={t("hint")} />
                  </motion.div>
                </AnimatePresence>

                {item && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentId}-price`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="bg-pks-500 absolute bottom-5 start-5 rounded-full px-5 py-2.5 shadow-lg"
                    >
                      <span className="font-display text-lg text-white tabular-nums">
                        {formatPrice(item.price, locale)}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </Reveal>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentId}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <DishCopy
                  dishId={currentId}
                  locale={locale}
                  index={active}
                  total={SHOWCASE.length}
                  tag={t("tag")}
                  ofLabel={t("ofLabel")}
                  description={t(`dishes.${currentId}`)}
                />
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <AddToCart itemId={currentId} />
                  <Link
                    href="/menu"
                    className="group text-pks-600 inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide"
                  >
                    {t("viewMenu")}
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Selector as a ruled list — reads like a chef's card, not tabs. */}
            <ul className="border-paper-300 mt-12 border-t">
              {SHOWCASE.map((dishId, index) => {
                const dishItem = findItem(dishId);
                const selected = index === active;
                return (
                  <li key={dishId} className="border-paper-300 border-b">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-pressed={selected}
                      className="group relative flex w-full items-center gap-4 py-3.5 text-start"
                    >
                      {selected && (
                        <motion.span
                          layoutId="signature-marker"
                          className="bg-pks-500 absolute start-0 h-6 w-[3px] rounded-full"
                          transition={{ type: "spring", stiffness: 340, damping: 30 }}
                        />
                      )}
                      <span
                        className={`ps-4 text-xs tabular-nums transition-colors ${
                          selected ? "text-pks-500" : "text-ink-400/70"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display flex-1 text-lg transition-colors duration-300 ${
                          selected
                            ? "text-ink-800"
                            : "text-ink-400 group-hover:text-pks-600"
                        }`}
                      >
                        {dishItem ? pick(dishItem.name, locale) : dishId}
                      </span>
                      {dishItem && (
                        <span
                          className={`text-sm tabular-nums transition-colors ${
                            selected ? "text-pks-500" : "text-ink-400/60"
                          }`}
                        >
                          {formatPrice(dishItem.price, locale)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignatureDishes;
