"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Flame, Croissant, Armchair, PackageCheck, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { scenePhoto, photoUrl } from "@/lib/photos";
import { signatureItems, t as pick } from "@/lib/menu";
import { SplitHeading, Marquee, GoldRule } from "./motion/primitives";
import AnimatedLede from "./motion/AnimatedLede";
import FeastPlanner from "./FeastPlanner";

const BADGES = [
  { key: "coals", Icon: Flame },
  { key: "tandoor", Icon: Croissant },
  { key: "majlis", Icon: Armchair },
  { key: "parcel", Icon: PackageCheck },
] as const;

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 25,
    mass: 0.35,
  });

  // The photograph pushes in and drifts down while the type lifts away —
  // the two moving apart is what gives the opening its depth.
  const photoScale = useTransform(progress, [0, 1], [1.12, 1.34]);
  const photoY = useTransform(progress, [0, 1], ["0%", "16%"]);
  const photoBlur = useTransform(progress, [0, 1], ["blur(0px)", "blur(5px)"]);
  const contentY = useTransform(progress, [0, 1], ["0%", "-24%"]);
  const contentFade = useTransform(progress, [0, 0.7], [1, 0]);

  const hero = scenePhoto("hero");
  const ribbon = signatureItems.map((item) => pick(item.name, locale));

  return (
    <section
      ref={section}
      className="bg-pks-950 relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      {/* --- The photograph, full bleed behind everything --- */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={
          reduced
            ? undefined
            : { scale: photoScale, y: photoY, filter: photoBlur }
        }
      >
        <Image
          src={photoUrl(hero, 2000)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Scrims. Heavier at the bottom on mobile, where the type sits lower
          and the photograph is busiest. */}
      <div
        aria-hidden
        className="from-pks-950 via-pks-950/72 absolute inset-0 bg-gradient-to-t to-transparent sm:via-pks-950/55"
      />
      <div
        aria-hidden
        className="from-pks-950/92 absolute inset-0 bg-gradient-to-r via-transparent to-transparent lg:via-pks-950/25"
      />
      <div aria-hidden className="bg-pks-950/25 absolute inset-0" />

      {/* Ember glow, drifting. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float bg-pks-500/25 absolute -bottom-32 -left-24 h-[30rem] w-[30rem] rounded-full blur-[140px]" />
        <div
          className="animate-float bg-gold-500/10 absolute -top-24 -right-20 h-[26rem] w-[26rem] rounded-full blur-[130px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* --- Type, over the photograph --- */}
      <motion.div
        className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-10 sm:px-8 sm:pb-14"
        style={reduced ? undefined : { y: contentY, opacity: contentFade }}
      >
        <motion.p
          className="text-gold-300 text-[10px] tracking-[0.3em] uppercase sm:text-[11px] sm:tracking-[0.34em]"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t("eyebrow")}
        </motion.p>

        <GoldRule className="mt-4 w-24 origin-left sm:mt-5 sm:w-28" />

        <SplitHeading
          immediate
          as="h1"
          text={t("title")}
          delay={0.3}
          className="font-display mt-5 text-[2.6rem] leading-[1.03] text-white sm:mt-7 sm:text-6xl xl:text-7xl"
        />
        <SplitHeading
          immediate
          as="h2"
          text={t("titleAccent")}
          delay={0.5}
          className="font-display text-pks-200 mt-1 text-[2.6rem] leading-[1.03] italic sm:text-6xl xl:text-7xl"
        />

        <AnimatedLede
          text={t("subtitle")}
          delay={0.8}
          stagger={0.042}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:mt-8 sm:text-lg sm:leading-relaxed"
        />

        <motion.div
          className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.45 }}
        >
          <Link
            href="/menu"
            className="group text-pks-700 relative overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold tracking-wide sm:px-9 sm:py-4"
          >
            <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            <span className="relative">{t("cta")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setPlannerOpen(true)}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/10 sm:px-9 sm:py-4"
          >
            <Users className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            {t("ctaFeast")}
          </button>
        </motion.div>

        {/* Four things worth knowing. Two columns on a phone, four on a desk. */}
        <motion.ul
          className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-7 sm:mt-12 sm:gap-x-8 sm:gap-y-5 lg:max-w-4xl lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 1.75, staggerChildren: 0.09 } },
          }}
        >
          {BADGES.map(({ key, Icon }) => (
            <motion.li
              key={key}
              className="flex items-start gap-2.5"
              variants={
                reduced
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                    }
              }
            >
              <Icon className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-xs leading-snug text-white/65 sm:text-sm">
                {t(`badges.${key}`)}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Signature dishes running past like a ticker. */}
      <div className="relative border-t border-white/12 bg-black/25 py-3.5 backdrop-blur-sm sm:py-4">
        <Marquee
          items={ribbon}
          className="font-display text-base text-white/50 sm:text-xl"
        />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-20 hidden justify-center lg:flex"
        animate={reduced ? undefined : { y: [0, 9, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px] tracking-[0.38em] text-white/45 uppercase">
          {t("scroll")}
        </span>
      </motion.div>

      <FeastPlanner open={plannerOpen} onClose={() => setPlannerOpen(false)} />
    </section>
  );
}

export default Hero;
