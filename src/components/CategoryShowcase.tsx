"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { categories, t as pick } from "@/lib/menu";
import { categoryPhoto } from "@/lib/photos";
import { SplitHeading, GoldRule, Reveal, TiltCard } from "./motion/primitives";
import ScrollImage from "./motion/ScrollImage";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CategoryShowcase() {
  const t = useTranslations("categories");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
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
          <Reveal delay={0.18}>
            <p className="text-ink-500 mt-5 text-base leading-relaxed">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const photo = categoryPhoto(category.id);

            return (
              <motion.div
                key={category.id}
                initial={reduced ? false : { opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.75, delay: (index % 3) * 0.09, ease: EASE }}
              >
                <TiltCard className="h-full">
                  <Link
                    href={`/menu#${category.id}`}
                    className="group border-paper-300 hover:border-pks-300 relative block h-full overflow-hidden rounded-2xl border bg-white transition-colors duration-500 hover:shadow-[0_28px_70px_-30px_rgba(207,46,40,0.45)]"
                  >
                    <div className="relative aspect-4/3 overflow-hidden">
                      {photo && (
                        <ScrollImage
                          photo={photo}
                          alt=""
                          effect="full"
                          intensity={0.65}
                          rounded={false}
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                          className="absolute inset-0"
                          imageClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                        />
                      )}
                      {/* Red wash that lifts on hover, so type stays legible either way. */}
                      <div className="from-pks-950/85 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />

                      <span className="text-pks-700 absolute top-4 end-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold tracking-wide">
                        {t("itemCount", { count: category.items.length })}
                      </span>

                      {/* Name and the way in, on one line over the photograph.
                          The old footer carried the section's cheapest item as
                          a price, which read as the price of the section — a
                          drumstick made the whole BBQ card say "Rs 200". */}
                      <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3">
                        <h3 className="font-display text-2xl leading-tight text-white">
                          {pick(category.name, locale)}
                        </h3>
                        <span className="text-gold-300 inline-flex shrink-0 items-center gap-1.5 pb-1 text-xs font-semibold tracking-wide">
                          {t("explore")}
                          <span
                            className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                            aria-hidden
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
