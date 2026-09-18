import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Flame, UtensilsCrossed, PackageCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { allItems, categories } from "@/lib/menu";
import { scenePhoto, photoAlt } from "@/lib/photos";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MenuBrowser from "@/components/menu/MenuBrowser";
import ScrollImage from "@/components/motion/ScrollImage";
import {
  Reveal,
  GoldRule,
  HoverHeading,
  ScrollProgress,
} from "@/components/motion/primitives";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menu" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("menu");
  const hero = scenePhoto("menuHero");
  const plate = scenePhoto("menuPlate");

  // What the kitchen has switched off today.
  //
  // The printed menu lives in data/menu.json, so if the database is briefly
  // unreachable the card still renders in full — everything simply shows as
  // available. A menu that 500s is far worse than one that is a little
  // optimistic for a minute.
  let soldOutIds: string[] = [];
  try {
    soldOutIds = (
      await db.itemAvailability.findMany({
        where: { soldOut: true },
        select: { itemId: true },
      })
    ).map((row) => row.itemId);
  } catch (error) {
    console.error("Could not read sold-out items; showing the full menu", error);
  }

  const stats = [
    { Icon: UtensilsCrossed, value: allItems.length, label: t("title") },
    { Icon: Flame, value: categories.length, label: t("eyebrow") },
  ];

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main className="bg-paper-100">
        {/* --- Opening band --- */}
        <section className="bg-pks-950 relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
          {/* The photograph carries the section; the wash sits light enough
              over it that you can still see what the kitchen sends out. */}
          <ScrollImage
            photo={hero}
            alt=""
            effect="drift"
            intensity={0.6}
            rounded={false}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10"
            imageClassName="opacity-60"
          />
          <div className="from-pks-950 via-pks-950/80 absolute inset-0 -z-10 bg-gradient-to-r to-transparent" />
          <div className="from-pks-950 absolute inset-0 -z-10 bg-gradient-to-t via-transparent to-transparent" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <p className="text-gold-300 text-[11px] tracking-[0.34em] uppercase">
                  {t("eyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />

              <HoverHeading
                as="h1"
                text={t("title")}
                delay={0.25}
                className="font-display mt-6 text-5xl leading-[1.02] text-white sm:text-6xl xl:text-7xl"
              />

              <Reveal delay={0.35}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {t("subtitle")}
                </p>
              </Reveal>

              {/* Two numbers instead of the bare "116 · 11" that read as a
                  stray line of debug output. */}
              <Reveal delay={0.45}>
                <dl className="mt-9 flex flex-wrap gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 backdrop-blur-sm"
                    >
                      <stat.Icon className="text-gold-300 h-5 w-5" />
                      <div>
                        <dt className="font-display text-2xl text-white tabular-nums">
                          {stat.value}
                        </dt>
                        <dd className="text-[10px] tracking-[0.18em] text-white/50 uppercase">
                          {stat.label}
                        </dd>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 backdrop-blur-sm">
                    <PackageCheck className="text-gold-300 h-5 w-5" />
                    <span className="text-sm text-white/70">
                      {t("packagingTitle")}
                    </span>
                  </div>
                </dl>
              </Reveal>
            </div>

            {/* A real plate, framed — the section was carrying no photograph
                a visitor could actually see. */}
            {plate && (
              <Reveal y={40} delay={0.2}>
                <div className="relative mx-auto w-full max-w-[30rem] lg:ms-auto">
                  <div
                    aria-hidden
                    className="border-gold-500/40 absolute -inset-3 rounded-[2rem] border sm:-inset-5"
                  />
                  <ScrollImage
                    photo={plate}
                    alt={photoAlt(plate, locale)}
                    effect="full"
                    intensity={0.9}
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="aspect-4/5 rounded-[1.6rem] shadow-[0_34px_90px_-30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <MenuBrowser soldOutIds={soldOutIds} />
      </main>

      <SiteFooter />
    </>
  );
}
