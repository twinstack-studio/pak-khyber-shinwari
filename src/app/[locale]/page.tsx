import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MapPin, Phone, Clock } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { restaurant, t as pick } from "@/lib/menu";
import { scenePhoto, photoUrl } from "@/lib/photos";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/Hero";
import SignatureDishes from "@/components/SignatureDishes";
import StoryBlock from "@/components/StoryBlock";
import CategoryShowcase from "@/components/CategoryShowcase";
import {
  Reveal,
  SplitHeading,
  ScrollProgress,
  GoldRule,
} from "@/components/motion/primitives";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const info = await getTranslations("info");
  const nav = await getTranslations("nav");
  const spread = scenePhoto("spread");

  const rows = [
    { icon: MapPin, label: info("address"), value: pick(restaurant.address, locale) },
    { icon: Phone, label: info("phone"), value: restaurant.phone, ltr: true },
    { icon: Clock, label: info("hours"), value: info("hoursValue") },
  ];

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main>
        <Hero />
        <SignatureDishes />
        <StoryBlock />
        <CategoryShowcase />

        {/* Full-bleed photograph with the reservation call sitting over it. */}
        <section className="relative isolate overflow-hidden">
          <Image
            src={photoUrl(spread, 1920)}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div className="from-pks-950/95 via-pks-900/85 to-pks-800/80 absolute inset-0 -z-10 bg-gradient-to-r" />

          <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
            <div className="max-w-xl">
              <Reveal>
                <p className="text-gold-300 text-[11px] tracking-[0.34em] uppercase">
                  {restaurant.short_name}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <Reveal delay={0.12}>
                <SplitHeading
                  text={pick(restaurant.name, locale)}
                  className="font-display mt-6 text-4xl text-white sm:text-5xl"
                />
              </Reveal>
              <Reveal delay={0.22}>
                <p className="mt-5 text-base leading-relaxed text-white/70">
                  {pick(restaurant.address, locale)}
                </p>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <a
                    href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                    className="group text-pks-700 relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold"
                  >
                    <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                    <span className="relative" dir="ltr">
                      {info("callUs")} · {restaurant.phone}
                    </span>
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-paper-100 py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-3 sm:px-8">
            {rows.map((row, index) => (
              <Reveal key={row.label} delay={index * 0.09}>
                <div className="group border-paper-300 hover:border-pks-300 h-full rounded-2xl border bg-white p-7 transition-colors duration-500">
                  <row.icon className="text-pks-500 h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
                  <p className="text-ink-400 mt-5 text-[10px] tracking-[0.22em] uppercase">
                    {row.label}
                  </p>
                  <p
                    className="text-ink-800 mt-2.5 text-base leading-relaxed"
                    dir={row.ltr ? "ltr" : undefined}
                  >
                    {row.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-7xl px-5 sm:px-8">
            <Reveal delay={0.2}>
              <a
                href="https://maps.google.com/?q=Pak+Khyber+Shinwari+GT+Road+Sangjani+Islamabad"
                target="_blank"
                rel="noreferrer"
                className="group text-pks-600 inline-flex items-center gap-2.5 text-sm font-semibold"
              >
                {info("getDirections")}
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5"
                  aria-hidden
                >
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      <span className="sr-only">{nav("home")}</span>
    </>
  );
}
