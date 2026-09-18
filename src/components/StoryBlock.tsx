"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { allItems, categories } from "@/lib/menu";
import { scenePhoto, photoAlt } from "@/lib/photos";
import {
  SplitHeading,
  GoldRule,
  Reveal,
  Parallax,
  CountUp,
} from "./motion/primitives";
import ScrollImage from "./motion/ScrollImage";
import ScrollVideo from "./motion/ScrollVideo";

export function StoryBlock() {
  const t = useTranslations("story");
  const stats = useTranslations("stats");
  const locale = useLocale() as Locale;

  // The restaurant's own outdoor majlis, full on a weekend night.
  const outdoor = scenePhoto("outdoor");

  return (
    <section className="bg-paper-200 relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Two photographs, offset and moving at different rates. */}
          <div className="relative">
            {/* PKS's own footage of the qahwa going into the pot. It carries
                this section far better than a stock photograph could. */}
            <Parallax distance={40}>
              <ScrollVideo
                src="/videos/tandoor-qahwa.mp4"
                poster="/videos/tandoor-qahwa-poster.jpg"
                label={t("title")}
                intensity={1.1}
                className="aspect-4/5 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.5)]"
              />
            </Parallax>

            <Parallax
              distance={-55}
              className="absolute -bottom-10 end-0 w-[46%] max-w-56 sm:-bottom-14"
            >
              {/* 4:5, matching what is left of the frame after the logo and
                  the caption were cropped away. */}
              <ScrollImage
                photo={outdoor}
                alt={photoAlt(outdoor, locale)}
                effect="full"
                intensity={0.55}
                sizes="(max-width: 640px) 48vw, 260px"
                className="aspect-4/5 border-4 border-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]"
              />
            </Parallax>
          </div>

          <div className="mt-14 lg:mt-0">
            <Reveal>
              <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                {t("eyebrow")}
              </p>
            </Reveal>
            <GoldRule className="mt-5 w-24 origin-left" />
            <SplitHeading
              text={t("title")}
              className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
            />

            <Reveal delay={0.15}>
              <p className="text-ink-600 mt-7 text-base leading-relaxed">{t("body")}</p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-ink-600 mt-5 text-base leading-relaxed">{t("body2")}</p>
            </Reveal>

            <Reveal delay={0.35}>
              <dl className="border-paper-400 mt-12 grid grid-cols-3 gap-6 border-t pt-9">
                {[
                  { value: allItems.length, label: stats("dishes") },
                  { value: categories.length, label: stats("sections") },
                  { value: 7, label: stats("days") },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-pks-500 text-4xl sm:text-5xl">
                      <CountUp to={stat.value} />
                    </dt>
                    <dd className="text-ink-400 mt-2 text-xs leading-snug tracking-wide">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StoryBlock;
