"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu as MenuIcon, X, Phone } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { restaurant } from "@/lib/menu";
import PksCrest from "./PksCrest";
import CartButton from "./cart/CartButton";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/menu", key: "menu" },
  { href: "/about", key: "about" },
  { href: "/seating", key: "seating" },
  { href: "/reviews", key: "reviews" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu stays open only on the page it was opened on, so navigating closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the red hero the bar is transparent with white type; once the page
  // scrolls under it, it turns into white paper with red type.
  const solid = scrolled || open;
  const other: Locale = locale === "en" ? "ur" : "en";

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-paper-300 bg-paper-50/92 border-b shadow-[0_1px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <motion.div whileHover={{ rotate: -6, scale: 1.06 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <PksCrest className="h-14 w-14 sm:h-16 sm:w-16" />
          </motion.div>
          <span className="hidden leading-tight sm:block">
            <span
              className={`font-display block text-base tracking-normal transition-colors ${
                solid ? "text-ink-800" : "text-white"
              }`}
            >
              {brand("name")}
            </span>
            <span
              className={`block text-[10px] font-bold tracking-[0.22em] uppercase transition-colors ${
                solid ? "text-pks-500" : "text-gold-300"
              }`}
            >
              {brand("branch")}
            </span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-1 text-[13px] font-bold tracking-[0.06em] uppercase transition-colors ${
                  solid
                    ? active
                      ? "text-pks-600"
                      : "text-ink-600 hover:text-pks-600"
                    : active
                      ? "text-gold-300"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {t(link.key)}
                {/* Underline that grows from the leading edge. */}
                <span
                  className={`absolute -bottom-0.5 inset-x-0 h-px origin-left transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  } ${solid ? "bg-pks-500" : "bg-gold-300"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <Link
            href={pathname}
            locale={other}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide transition-colors ${
              solid
                ? "border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600"
                : "border-white/30 text-white/85 hover:border-white hover:text-white"
            }`}
          >
            {t("switchLanguage")}
          </Link>

          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            className={`hidden rounded-full border p-2 transition-colors sm:inline-flex ${
              solid
                ? "border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600"
                : "border-white/30 text-white/85 hover:border-white hover:text-white"
            }`}
            aria-label={restaurant.phone}
          >
            <Phone className="h-4 w-4" />
          </a>

          <CartButton solid={solid} />

          <button
            type="button"
            onClick={() => setOpenPath(open ? null : pathname)}
            className={`p-2 lg:hidden ${solid ? "text-ink-800" : "text-white"}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-paper-300 overflow-hidden border-t lg:hidden"
          >
            <div className="px-5 pb-6">
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index + 0.08, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="border-paper-300 text-ink-700 hover:text-pks-600 block border-b py-4 text-sm font-bold tracking-[0.06em] uppercase"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/menu"
                className="bg-pks-500 mt-5 block rounded-full py-3.5 text-center font-semibold text-white"
              >
                {t("order")}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default SiteHeader;
