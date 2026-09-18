"use client";

import { useRef, useState, type ComponentType } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Users, Info, Trees, Armchair, DoorClosed, Flame, Car } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { scenePhotos } from "@/lib/photos";
import ScrollImage from "@/components/motion/ScrollImage";
import { GoldRule } from "@/components/motion/primitives";
import seating from "../../../data/seating.json";

const EASE = [0.16, 1, 0.3, 1] as const;

type Area = (typeof seating.areas)[number];
type MotifKind = "charpai" | "tables" | "cabins" | "fire" | "cars";

/**
 * Each area gets its own colour and its own motif, so the plan reads as five
 * different places rather than five identical rectangles with labels.
 *
 * Three states: resting (pale), hovered (the colour arrives), selected (full).
 */
const STYLE: Record<
  string,
  {
    Icon: ComponentType<{ className?: string }>;
    motif: MotifKind;
    /** Border + ground while resting. */
    rest: string;
    /** Where hover and selection take it. */
    lit: string;
    /** The wash that sweeps in on hover, behind everything else. */
    wash: string;
    label: string;
    labelLit: string;
    icon: string;
    iconLit: string;
    piece: string;
    pieceLit: string;
    glow: string;
  }
> = {
  majlis: {
    Icon: Trees,
    motif: "charpai",
    rest: "border-shinwari-400/45 border-dashed bg-white/60",
    lit: "border-shinwari-500 border-solid",
    wash: "from-shinwari-100 to-shinwari-100/40",
    label: "text-ink-600",
    labelLit: "text-shinwari-800",
    icon: "text-shinwari-400",
    iconLit: "text-shinwari-700",
    piece: "border-shinwari-500/35",
    pieceLit: "border-shinwari-700/70 bg-shinwari-400/25",
    glow: "shadow-[0_16px_40px_-16px_rgba(85,145,58,0.55)]",
  },
  "family-hall": {
    Icon: Armchair,
    motif: "tables",
    rest: "border-paper-400 bg-white/75",
    lit: "border-pks-500",
    wash: "from-pks-100 to-pks-50/40",
    label: "text-ink-600",
    labelLit: "text-pks-700",
    icon: "text-ink-400",
    iconLit: "text-pks-600",
    piece: "bg-pks-300/45",
    pieceLit: "bg-pks-500",
    glow: "shadow-[0_16px_40px_-16px_rgba(207,46,40,0.5)]",
  },
  cabins: {
    Icon: DoorClosed,
    motif: "cabins",
    rest: "border-gold-500/40 bg-white/70",
    lit: "border-gold-600",
    wash: "from-gold-300/45 to-gold-300/10",
    label: "text-ink-600",
    labelLit: "text-gold-600",
    icon: "text-gold-500/70",
    iconLit: "text-gold-600",
    piece: "border-gold-600/35 bg-white/50",
    pieceLit: "border-gold-600/80 bg-gold-300/60",
    glow: "shadow-[0_16px_40px_-16px_rgba(201,162,39,0.6)]",
  },
  tandoor: {
    Icon: Flame,
    motif: "fire",
    rest: "border-pks-300/50 bg-white/70",
    lit: "border-pks-600",
    wash: "from-pks-200 via-gold-300/50 to-pks-100/40",
    label: "text-ink-600",
    labelLit: "text-pks-700",
    icon: "text-pks-400",
    iconLit: "text-pks-600",
    piece: "text-pks-400/60",
    pieceLit: "text-pks-600",
    glow: "shadow-[0_16px_40px_-16px_rgba(179,30,26,0.6)]",
  },
  parking: {
    Icon: Car,
    motif: "cars",
    rest: "border-ink-400/25 bg-white/60",
    lit: "border-ink-600/70",
    wash: "from-ink-400/20 to-ink-400/5",
    label: "text-ink-600",
    labelLit: "text-ink-800",
    icon: "text-ink-400",
    iconLit: "text-ink-700",
    piece: "bg-ink-400/25",
    pieceLit: "bg-ink-600/60",
    glow: "shadow-[0_16px_40px_-16px_rgba(74,66,61,0.5)]",
  },
};

/** Motif pieces animate together with the box they sit in. */
const pieceVariants: Variants = {
  rest: { opacity: 0.45, y: 0, scale: 1 },
  hover: (i: number) => ({
    opacity: 1,
    y: -3,
    scale: 1.06,
    transition: { delay: i * 0.03, type: "spring", stiffness: 380, damping: 16 },
  }),
  active: { opacity: 0.95, y: 0, scale: 1 },
};

function Motif({ kind, lit }: { kind: MotifKind; lit: boolean }) {
  const style = Object.values(STYLE).find((entry) => entry.motif === kind)!;
  const tone = lit ? style.pieceLit : style.piece;

  const counts: Record<MotifKind, number> = {
    charpai: 6,
    tables: 8,
    cabins: 8,
    fire: 5,
    cars: 7,
  };

  const shape = (index: number) => {
    if (kind === "charpai") {
      return (
        <motion.span
          key={index}
          custom={index}
          variants={pieceVariants}
          className={`h-full min-h-3 rounded-sm border ${tone}`}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 4px)",
          }}
        />
      );
    }
    if (kind === "tables") {
      return (
        <motion.span
          key={index}
          custom={index}
          variants={pieceVariants}
          className={`h-3 w-3 shrink-0 rounded-full ${tone}`}
        />
      );
    }
    if (kind === "cabins") {
      return (
        <motion.span
          key={index}
          custom={index}
          variants={pieceVariants}
          className={`h-full min-h-3 rounded-sm border ${tone}`}
        />
      );
    }
    if (kind === "fire") {
      return (
        <motion.span key={index} custom={index} variants={pieceVariants} className={tone}>
          <Flame className="h-4 w-4" />
        </motion.span>
      );
    }
    return (
      <motion.span
        key={index}
        custom={index}
        variants={pieceVariants}
        className={`h-full min-h-2.5 w-2 shrink-0 rounded-[2px] ${tone}`}
      />
    );
  };

  const layout =
    kind === "cabins"
      ? "grid grid-cols-4 gap-1.5"
      : kind === "charpai"
        ? "grid grid-cols-3 gap-1.5"
        : "flex items-center gap-2";

  return (
    <div className={`pointer-events-none h-full w-full ${layout}`}>
      {Array.from({ length: counts[kind] }).map((_, index) => shape(index))}
    </div>
  );
}

/**
 * A schematic top-down plan, not a rendering.
 *
 * A photoreal 3D room would be a guess dressed up as a survey — we have no
 * measurements of this building. A flat plan reads honestly as a diagram, and
 * it is the thing a customer actually wants: which part is which, how many
 * people fit, and which one to ask for on the phone.
 */
export function FloorPlan() {
  const t = useTranslations("seating");
  const locale = useLocale() as Locale;
  const [activeId, setActiveId] = useState(seating.areas[0].id);
  const detail = useRef<HTMLDivElement>(null);

  /**
   * Picking an area on a phone should take you to what you picked.
   *
   * On a wide screen the detail sits alongside the plan and is already in
   * view, so nothing moves. Below that it is a screen further down, and
   * leaving the reader to find it themselves is the whole complaint.
   */
  function selectArea(id: string) {
    setActiveId(id);

    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Wait a frame so the panel has re-rendered with the new area first.
    requestAnimationFrame(() => {
      detail.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  const areas = seating.areas as Area[];
  const active = areas.find((area) => area.id === activeId) ?? areas[0];
  const anyUnconfirmed = areas.some((area) => !area.confirmed);
  const totalSeats = areas.reduce((sum, area) => sum + area.seats, 0);

  const activePhoto = active.photo
    ? scenePhotos[active.photo as keyof typeof scenePhotos]
    : undefined;
  const activeStyle = STYLE[active.id] ?? STYLE["family-hall"];

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* ---------------- the plan ---------------- */}
        <div>
          <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
            {t("planLabel")}
          </p>

          {/* On a phone the plan becomes a list.
              The schematic is sized in percentages of a 4:3 box; at phone
              width the shorter areas end up about seventy pixels tall, which
              is not enough for a name, a seat count and a motif — the labels
              were being clipped. A list cannot clip, and tapping a row is
              easier than tapping a small rectangle. */}
          <ul className="mt-4 space-y-2.5 lg:hidden">
            {areas.map((area) => {
              const selected = area.id === activeId;
              const style = STYLE[area.id] ?? STYLE["family-hall"];
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => selectArea(area.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-start transition-colors ${
                      selected ? `${style.lit} ${style.glow}` : style.rest
                    }`}
                  >
                    <span
                      className={`shrink-0 rounded-full p-2 ${
                        selected ? "bg-pks-500 text-white" : "bg-paper-200 " + style.icon
                      }`}
                    >
                      <style.Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-bold ${
                          selected ? style.labelLit : style.label
                        }`}
                      >
                        {area.name[locale]}
                      </span>
                      <span className="text-ink-400 mt-0.5 block text-xs tabular-nums">
                        {area.seats > 0
                          ? `${area.seats} ${t("seats")} · ${area.unitCount} ${area.units[locale]}`
                          : `${area.unitCount > 0 ? area.unitCount + " " : ""}${area.units[locale]}`}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`shrink-0 text-lg transition-transform ${
                        selected ? "text-pks-500" : "text-ink-400/40"
                      } rtl:rotate-180`}
                    >
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-paper-300 bg-paper-200 relative mt-4 hidden aspect-4/3 overflow-hidden rounded-2xl border lg:block">
            {/* Faint grid, so it reads as a drawing rather than a diagram of nothing. */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-paper-300) 1px, transparent 1px), linear-gradient(to bottom, var(--color-paper-300) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {areas.map((area) => {
              const selected = area.id === activeId;
              const style = STYLE[area.id] ?? STYLE["family-hall"];

              return (
                <motion.button
                  key={area.id}
                  type="button"
                  onClick={() => selectArea(area.id)}
                  aria-pressed={selected}
                  aria-label={area.name[locale]}
                  initial="rest"
                  animate={selected ? "active" : "rest"}
                  whileHover="hover"
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.025, zIndex: 2 },
                    active: { scale: 1, zIndex: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className={`absolute flex flex-col overflow-hidden rounded-xl border-2 p-2.5 text-start transition-colors duration-300 sm:p-3 ${
                    selected ? `${style.lit} ${style.glow}` : style.rest
                  }`}
                  style={{
                    left: `${area.plan.x}%`,
                    top: `${area.plan.y}%`,
                    width: `${area.plan.w}%`,
                    height: `${area.plan.h}%`,
                  }}
                >
                  {/* The colour arrives from the reading edge on hover. */}
                  <motion.span
                    aria-hidden
                    className={`absolute inset-0 origin-left bg-gradient-to-r ${style.wash}`}
                    variants={{
                      rest: { scaleX: 0, opacity: 0 },
                      hover: { scaleX: 1, opacity: 1 },
                      active: { scaleX: 1, opacity: 0.9 },
                    }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />

                  {/* Header. Kept in the flow so a motif can never sit on top
                      of the label the way an absolutely placed one did. */}
                  <span className="relative flex shrink-0 items-start gap-2">
                    <motion.span
                      variants={{
                        rest: { rotate: 0, scale: 1 },
                        hover: { rotate: -8, scale: 1.15 },
                        active: { rotate: 0, scale: 1.05 },
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className={`mt-0.5 shrink-0 ${selected ? style.iconLit : style.icon}`}
                    >
                      <style.Icon className="h-3.5 w-3.5" />
                    </motion.span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[11px] leading-tight font-bold sm:text-xs ${
                          selected ? style.labelLit : style.label
                        }`}
                      >
                        {area.name[locale]}
                      </span>
                      {area.seats > 0 && (
                        <span className="text-ink-400 mt-0.5 block text-[10px] tabular-nums">
                          {area.seats} {t("seats")}
                        </span>
                      )}
                    </span>
                  </span>

                  {/* Whatever room is left goes to the motif, and it clips. */}
                  <span className="relative mt-2 min-h-0 flex-1 overflow-hidden">
                    <Motif kind={style.motif} lit={selected} />
                  </span>
                </motion.button>
              );
            })}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="border-paper-300 rounded-xl border bg-white p-4">
              <dt className="text-ink-400 text-[10px] tracking-[0.2em] uppercase">
                {t("totalSeats")}
              </dt>
              <dd className="font-display text-pks-600 mt-1 text-3xl tabular-nums">
                {totalSeats}
              </dd>
            </div>
            <div className="border-paper-300 rounded-xl border bg-white p-4">
              <dt className="text-ink-400 text-[10px] tracking-[0.2em] uppercase">
                {t("areasCount")}
              </dt>
              <dd className="font-display text-pks-600 mt-1 text-3xl tabular-nums">
                {areas.filter((area) => area.seats > 0).length}
              </dd>
            </div>
          </dl>
        </div>

        {/* ---------------- the detail ---------------- */}
        {/* scroll-mt clears the 96px sticky header so the heading is not
            hidden underneath it when we jump here. */}
        <div ref={detail} className="scroll-mt-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {activePhoto && (
                <ScrollImage
                  photo={activePhoto}
                  alt=""
                  effect="full"
                  intensity={0.7}
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="aspect-16/10"
                />
              )}

              <div className="mt-7 flex items-center gap-3">
                <span className="bg-pks-500 rounded-full p-2">
                  <activeStyle.Icon className="h-4 w-4 text-white" />
                </span>
                <h2 className="font-display text-ink-800 text-3xl sm:text-4xl">
                  {active.name[locale]}
                </h2>
              </div>
              <GoldRule className="mt-4 w-20 origin-left" />

              <p className="text-ink-600 mt-5 text-base leading-relaxed">
                {active.blurb[locale]}
              </p>

              {active.unitCount > 0 && (
                <p className="text-ink-500 mt-5 inline-flex items-center gap-2 text-sm">
                  {active.seats > 0 ? (
                    <Users className="text-pks-500 h-4 w-4" />
                  ) : (
                    <activeStyle.Icon className="text-pks-500 h-4 w-4" />
                  )}
                  <span className="tabular-nums">
                    {active.seats > 0 ? `${active.seats} ${t("seats")} · ` : ""}
                    {active.unitCount} {active.units[locale]}
                  </span>
                </p>
              )}

              <ul className="mt-6 flex flex-wrap gap-2">
                {active.features[locale].map((feature) => (
                  <li
                    key={feature}
                    className="border-paper-400 text-ink-600 rounded-full border px-3.5 py-1.5 text-xs"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Never present a guess as a measurement. */}
      {anyUnconfirmed && (
        <div className="border-gold-500/40 bg-gold-300/10 mt-12 flex gap-3 rounded-xl border p-5">
          <Info className="text-gold-600 mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-ink-600 text-sm leading-relaxed">{t("unconfirmed")}</p>
        </div>
      )}
    </>
  );
}

export default FloorPlan;
