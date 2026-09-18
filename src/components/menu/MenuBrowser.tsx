"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X, ArrowUp, Flame } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  categories,
  formatPrice,
  tax as taxInfo,
  packaging,
  t as pick,
  type MenuCategory,
  type MenuItem,
} from "@/lib/menu";
import { categoryPhoto } from "@/lib/photos";
import ScrollImage from "@/components/motion/ScrollImage";
import AddToCart from "@/components/cart/AddToCart";
import { GoldRule } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Case- and diacritic-insensitive contains, so "karahi" finds "Karahi". */
function matches(haystack: string, needle: string): boolean {
  return haystack
    .toLowerCase()
    .normalize("NFKD")
    .includes(needle.toLowerCase().normalize("NFKD"));
}

/** Searches both languages at once — people type "کڑاہی" or "karahi". */
function itemMatches(item: MenuItem, query: string): boolean {
  if (!query) return true;
  return (
    matches(item.name.en, query) ||
    matches(item.name.ur, query) ||
    (item.variant ? matches(item.variant.en, query) : false) ||
    (item.variant ? matches(item.variant.ur, query) : false)
  );
}

/* ------------------------------ one dish ------------------------------ */

function ItemRow({
  item,
  locale,
  index,
  soldOut,
}: {
  item: MenuItem;
  locale: Locale;
  index: number;
  soldOut: boolean;
}) {
  const reduced = useReducedMotion();
  const menu = useTranslations("menu");

  return (
    <motion.li
      layout
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.03, ease: EASE }}
      className="group border-paper-300/80 relative border-b"
    >
      {/* A pale wash slides in from the reading edge on hover, so the row the
          pointer is on is unmistakable in a list this long. */}
      <span
        aria-hidden
        className="from-pks-50 pointer-events-none absolute inset-y-0 -inset-x-4 origin-left scale-x-0 rounded-lg bg-gradient-to-r to-transparent transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />

      <div className="relative flex items-start gap-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3
              className={`text-[15px] leading-snug font-semibold transition-all duration-300 ${
                soldOut
                  ? "text-ink-400 line-through"
                  : "text-ink-800 group-hover:text-pks-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              }`}
            >
              {pick(item.name, locale)}
            </h3>
            {item.variant && (
              <span className="text-ink-400 text-xs">
                {pick(item.variant, locale)}
              </span>
            )}
            {soldOut && (
              <span className="bg-paper-300 text-ink-500 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                {menu("soldOut")}
              </span>
            )}
            {item.signature && !soldOut && (
              <span className="bg-pks-50 text-pks-600 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                <Flame className="h-2.5 w-2.5" />
                {menu("signature")}
              </span>
            )}
          </div>

          {item.includes && (
            <p className="text-ink-400 mt-1.5 text-xs leading-relaxed">
              {menu("includes")}: {item.includes[locale].join(" · ")}
            </p>
          )}
        </div>

        {/* Dotted leader between name and price, the way a printed card does it. */}
        <div
          aria-hidden
          className="border-paper-400 mt-3 hidden min-w-8 flex-1 border-b border-dotted sm:block"
        />

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`font-display text-base whitespace-nowrap tabular-nums transition-transform duration-300 ${
              soldOut
                ? "text-ink-400 line-through"
                : "text-ink-800 group-hover:text-pks-600 group-hover:scale-110"
            }`}
          >
            {formatPrice(item.price, locale)}
          </span>
          {/* No add button for a dish the kitchen has switched off — the
              server rejects it anyway, and offering it is a broken promise. */}
          {!soldOut && <AddToCart itemId={item.id} variant="icon" />}
        </div>
      </div>
    </motion.li>
  );
}

/* ---------------------------- one category ---------------------------- */

function CategoryBlock({
  category,
  locale,
  query,
  soldOut,
  index,
}: {
  category: MenuCategory;
  locale: Locale;
  query: string;
  soldOut: Set<string>;
  index: number;
}) {
  const menu = useTranslations("menu");
  const photo = categoryPhoto(category.id);
  const items = category.items.filter((item) => itemMatches(item, query));

  if (items.length === 0) return null;

  // Alternating grounds give a long single-column page a pulse.
  const tinted = index % 2 === 1;

  return (
    // scroll-mt clears the 96px header plus the sticky filter bar, so a
    // /menu#dum-pukht link does not land under them.
    <section
      id={category.id}
      data-category={category.id}
      className={`scroll-mt-56 ${tinted ? "bg-paper-200/60" : "bg-transparent"}`}
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-44 lg:self-start">
            <div className="relative">
              {photo && (
                <ScrollImage
                  photo={photo}
                  alt=""
                  effect="full"
                  intensity={0.7}
                  sizes="(max-width: 1024px) 92vw, 30vw"
                  className="aspect-16/10 shadow-[0_22px_60px_-28px_rgba(0,0,0,0.5)] lg:aspect-4/3"
                />
              )}
              {/* Section number, riding the corner of the photograph. */}
              <span className="bg-pks-500 font-display absolute -bottom-4 start-5 rounded-full px-4 py-1.5 text-sm text-white tabular-nums shadow-lg">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <h2 className="font-display text-ink-800 mt-9 text-3xl sm:text-4xl">
              {pick(category.name, locale)}
            </h2>
            <GoldRule className="mt-4 w-20 origin-left" />
            <p className="text-ink-400 mt-4 text-xs tracking-wide">
              {menu(items.length === 1 ? "resultsOne" : "resultsOther", {
                count: items.length,
              })}
            </p>
            {category.note && (
              <p className="text-pks-600 mt-3 text-sm italic">
                {pick(category.note, locale)}
              </p>
            )}
            {category.per_piece && (
              <div className="border-paper-300 mt-5 border-t pt-4">
                <p className="text-ink-400 text-[10px] tracking-[0.2em] uppercase">
                  {menu("perPieceLabel")}
                </p>
                <ul className="mt-2 space-y-1">
                  {category.per_piece.map((entry) => (
                    <li
                      key={entry.price}
                      className="text-ink-600 flex justify-between text-sm"
                    >
                      <span>{pick(entry.label, locale)}</span>
                      <span className="tabular-nums">
                        {formatPrice(entry.price, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <ul className="border-paper-300 border-t">
            {items.map((item, itemIndex) => (
              <ItemRow
                key={item.id}
                item={item}
                locale={locale}
                index={itemIndex}
                soldOut={soldOut.has(item.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- the browser ---------------------------- */

export function MenuBrowser({ soldOutIds = [] }: { soldOutIds?: string[] }) {
  const soldOut = useMemo(() => new Set(soldOutIds), [soldOutIds]);
  const menu = useTranslations("menu");
  const taxT = useTranslations("tax");
  const locale = useLocale() as Locale;

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  // Typing stays responsive while 116 rows re-filter behind it.
  const deferredQuery = useDeferredValue(query);
  const searchRef = useRef<HTMLInputElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = useMemo(() => {
    const byCategory = activeCategory
      ? categories.filter((category) => category.id === activeCategory)
      : categories;
    return byCategory.filter((category) =>
      category.items.some((item) => itemMatches(item, deferredQuery)),
    );
  }, [activeCategory, deferredQuery]);

  /* Scroll spy: highlight whichever section is under the filter bar. With
     eleven sections, knowing where you are is most of the navigation. */
  useEffect(() => {
    if (activeCategory) return;
    const sections = document.querySelectorAll("[data-category]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onScreen = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onScreen[0]) {
          setVisibleCategory(
            onScreen[0].target.getAttribute("data-category"),
          );
        }
      },
      // The band just under the sticky header, so the highlight matches
      // whatever the reader is actually looking at.
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeCategory, visible.length]);

  /* Keep the highlighted pill in view as the page scrolls past sections. */
  useEffect(() => {
    if (!visibleCategory || !railRef.current) return;
    const pill = railRef.current.querySelector(
      `[data-pill="${visibleCategory}"]`,
    );
    pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [visibleCategory]);

  const resultCount = useMemo(
    () =>
      visible.reduce(
        (sum, category) =>
          sum +
          category.items.filter((item) => itemMatches(item, deferredQuery)).length,
        0,
      ),
    [visible, deferredQuery],
  );


  return (
    <>
      {/* --- Sticky control bar --- */}
      <div className="bg-paper-100/94 border-paper-300 sticky top-24 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="group relative flex-1">
              <Search className="text-ink-400 group-focus-within:text-pks-500 pointer-events-none absolute top-1/2 start-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={menu("searchPlaceholder")}
                aria-label={menu("searchHint")}
                className="border-paper-400 text-ink-800 placeholder:text-ink-400 focus:border-pks-500 focus:ring-pks-500/15 w-full rounded-full border bg-white py-2.5 ps-11 pe-10 text-sm outline-none transition-all focus:ring-4"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label={menu("clearSearch")}
                  className="text-ink-400 hover:text-pks-600 absolute top-1/2 end-3.5 -translate-y-1/2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              <motion.span
                key={resultCount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-ink-400 hidden shrink-0 text-xs tabular-nums sm:block"
              >
                {menu(resultCount === 1 ? "resultsOne" : "resultsOther", {
                  count: resultCount,
                })}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Category rail. Horizontal scroll on a phone rather than wrapping
              into four rows and eating the screen. */}
          <div
            ref={railRef}
            className="-mx-5 mt-3 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max gap-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                aria-pressed={activeCategory === null}
                className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === null
                    ? "border-pks-500 text-white"
                    : "border-paper-400 text-ink-500 hover:border-pks-300 hover:text-pks-600"
                }`}
              >
                {activeCategory === null && (
                  <motion.span
                    layoutId="menu-pill"
                    className="bg-pks-500 absolute inset-0"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  />
                )}
                <span className="relative">{menu("all")}</span>
              </button>

              {categories.map((category) => {
                const selected = activeCategory === category.id;
                const current = !activeCategory && visibleCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    data-pill={category.id}
                    onClick={() =>
                      setActiveCategory(selected ? null : category.id)
                    }
                    aria-pressed={selected}
                    aria-current={current ? "true" : undefined}
                    className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      selected
                        ? "border-pks-500 text-white"
                        : current
                          ? "border-pks-400 text-pks-600 bg-pks-50"
                          : "border-paper-400 text-ink-500 hover:border-pks-300 hover:text-pks-600"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="menu-pill"
                        className="bg-pks-500 absolute inset-0"
                        transition={{ type: "spring", stiffness: 340, damping: 32 }}
                      />
                    )}
                    <span className="relative">{pick(category.name, locale)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* A hairline that fills as you read down the card. */}
        <MenuProgress />
      </div>

      {/* --- The card itself --- */}
      <AnimatePresence mode="wait">
        {visible.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-28 text-center"
          >
            <p className="text-ink-500">{menu("noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory(null);
              }}
              className="bg-pks-500 mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              {menu("clearSearch")}
            </button>
          </motion.div>
        ) : (
          <motion.div key="list" layout>
            {visible.map((category, index) => (
              <CategoryBlock
                key={category.id}
                category={category}
                locale={locale}
                query={deferredQuery}
                soldOut={soldOut}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two things printed on the real menu card that customers ask about. */}
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="border-paper-300 grid gap-6 border-t pt-10 sm:grid-cols-2">
          <div>
            <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
              {menu("packagingTitle")}
            </p>
            <p className="text-ink-600 mt-2.5 text-sm leading-relaxed">
              {menu("packagingBody")}
            </p>
            <p className="text-ink-400 mt-2 text-xs tabular-nums">
              {packaging.disposable_box
                .map((box) => `${box.size} · ${formatPrice(box.price, locale)}`)
                .join("   ")}
            </p>
          </div>
          <div>
            <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
              {taxT("cardLabel").split("·")[0].trim()}
            </p>
            <p className="text-ink-600 mt-2.5 text-sm leading-relaxed">
              {taxT("notice")}
            </p>
            <p className="text-ink-400 mt-2 text-xs">
              FBR · {taxInfo.card_payment_percent}% /{" "}
              {taxInfo.cash_payment_percent}%
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={menu("backToTop")}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ y: -3 }}
            className="bg-pks-500 fixed bottom-6 end-6 z-40 rounded-full p-3.5 text-white shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

/** Hairline under the filter bar showing how far down the card you are. */
function MenuProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="h-px w-full overflow-hidden">
      <div
        className="from-pks-500 to-gold-500 h-full origin-left bg-gradient-to-r"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export default MenuBrowser;
