import { useTranslations, useLocale } from "next-intl";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { restaurant, tax, t as pick } from "@/lib/menu";
import PksCrest from "./PksCrest";
import { Reveal, GoldRule } from "./motion/primitives";

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/Pakkhybershinwari/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "TikTok", href: "https://www.tiktok.com/@pakkhybershinwari" },
  { label: "YouTube", href: "https://www.youtube.com/@pakkhybershinwarirestauran8765" },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const info = useTranslations("info");
  const taxT = useTranslations("tax");
  const locale = useLocale() as Locale;

  return (
    <footer className="bg-pks-900 relative overflow-hidden text-white">
      <div
        aria-hidden
        className="bg-pks-500/18 pointer-events-none absolute -top-40 left-1/3 h-[30rem] w-[30rem] rounded-full blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <div className="flex items-center gap-3">
              <PksCrest className="h-14 w-14" />
              <span className="font-display text-base leading-tight font-bold text-white">
                {pick(restaurant.name, locale)}
              </span>
            </div>
            <GoldRule className="mt-6 w-20 origin-left" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">{t("tagline")}</p>
            <p className="text-gold-300 mt-5 text-xs tracking-wide">{t("parcel")}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="space-y-5 text-sm">
              <div className="flex gap-3">
                <MapPin className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    {info("address")}
                  </p>
                  <p className="mt-1.5 text-white/85">{pick(restaurant.address, locale)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    {info("hours")}
                  </p>
                  <p className="mt-1.5 text-white/85">{info("hoursValue")}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="space-y-5 text-sm">
              <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="group flex gap-3">
                <Phone className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    {info("phone")}
                  </p>
                  <p
                    className="group-hover:text-gold-300 mt-1.5 text-white/85 transition-colors"
                    dir="ltr"
                  >
                    {restaurant.phone}
                  </p>
                </div>
              </a>
              <a href={`mailto:${restaurant.email}`} className="group flex gap-3">
                <Mail className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    Email
                  </p>
                  <p
                    className="group-hover:text-gold-300 mt-1.5 break-all text-white/85 transition-colors"
                    dir="ltr"
                  >
                    {restaurant.email}
                  </p>
                </div>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
              {t("followUs")}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group hover:text-gold-300 inline-flex items-center gap-2 text-white/70 transition-colors"
                  >
                    <span className="bg-gold-500/50 group-hover:bg-gold-300 h-px w-4 transition-all duration-300 group-hover:w-7" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-8 space-y-3 text-sm">
              <li>
                <Link href="/menu" className="hover:text-gold-300 text-white/70 transition-colors">
                  {nav("menu")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300 text-white/70 transition-colors">
                  {nav("about")}
                </Link>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="mt-16 border-t border-white/12 pt-8">
          <p className="text-xs leading-relaxed text-white/45">
            {taxT("notice")}{" "}
            <span className="text-white/30">
              (FBR · {tax.card_payment_percent}% / {tax.cash_payment_percent}%)
            </span>
          </p>
          <p className="mt-3 text-xs text-white/35">
            © {new Date().getFullYear()} {pick(restaurant.name, locale)}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
