"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  animate,
  type Variants,
} from "motion/react";

/* ---------------------------------------------------------------
   Shared motion vocabulary.

   Everything animates on the same curve and the same distance, so the
   site reads as one piece rather than a pile of separate effects. All
   of it is decoration, so all of it disappears under prefers-reduced-motion.
   --------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade and rise into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Children rise one after another rather than all together. */
export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} variants={reduced ? undefined : childVariants}>
      {children}
    </motion.div>
  );
}

/**
 * A heading whose words swing up from behind a clipped line — the effect
 * that makes a page feel authored rather than assembled.
 */
export function SplitHeading({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3";
  /**
   * Play on mount instead of waiting to be scrolled into view.
   *
   * Use this for anything above the fold. A heading already on screen has
   * nothing to scroll into, and if the observer misses it the words stay at
   * opacity 0 — the heading is then simply never there, which is the worst
   * way for an animation to fail.
   */
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <Tag className={className}>{text}</Tag>;

  // Above the fold, animate in CSS. Motion only paints its `initial` state
  // during SSR, so a JS-driven reveal leaves the heading invisible until
  // hydration finishes — and permanently invisible if the script never runs.
  if (immediate) {
    return (
      <Tag className={className}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="animate-rise inline-block"
            style={{ animationDelay: `${delay + index * 0.075}s` }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    );
  }

  /**
   * The scroll trigger lives on the heading itself, never on the word spans.
   *
   * Each word starts 108% below its own `overflow-hidden` wrapper — entirely
   * outside it. An IntersectionObserver's rectangle is clipped by ancestor
   * overflow, so those spans report zero intersection for ever and a
   * `whileInView` placed on them can never fire: the heading simply never
   * appears. The heading element itself is not clipped, so it observes
   * correctly and passes the reveal down through variants.
   */
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, visible: {} }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "108%", opacity: 0 },
                visible: {
                  y: "0%",
                  opacity: 1,
                  transition: {
                    duration: 0.9,
                    delay: delay + index * 0.075,
                    ease: EASE,
                  },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
          {/* The gap lives outside the clipped box, as a non-breaking space.
              An ordinary space inside an inline-block is trimmed by the
              browser, and the words end up touching. */}
          {index < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * A heading that reveals itself on mount and then answers the pointer:
 * each letter lifts and warms to gold as the cursor crosses it.
 */
export function HoverHeading({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3";
}) {
  const reduced = useReducedMotion();

  if (reduced) return <Tag className={className}>{text}</Tag>;

  const words = text.split(" ");
  let letterIndex = -1;

  return (
    <Tag className={`${className ?? ""} cursor-default`}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
          {[...word].map((letter, i) => {
            letterIndex += 1;
            return (
              // The entrance is CSS so the heading is never waiting on
              // hydration to exist; only the hover lift needs JavaScript.
              <motion.span
                key={`${letter}-${i}`}
                className="hover:text-gold-300 animate-rise inline-block transition-colors duration-200"
                style={{ animationDelay: `${delay + letterIndex * 0.028}s` }}
                whileHover={{
                  y: -9,
                  transition: { type: "spring", stiffness: 420, damping: 13 },
                }}
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </Tag>
  );
}

/** Moves at a different rate to the page as it scrolls past. */
export function Parallax({
  children,
  distance = 70,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/** Counts up when it comes into view. Used for the menu figures. */
export function CountUp({
  to,
  duration = 1.6,
  className,
  suffix = "",
}: {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {reduced ? to : value}
      {suffix}
    </span>
  );
}

/**
 * Lifts and tilts very slightly toward the pointer. Kept subtle — a card
 * that leaps around undermines the premium read rather than building it.
 */
export function TiltCard({
  children,
  className,
  intensity = 7,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 190, damping: 18 }}
      onPointerMove={(event) => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        const px = (event.clientX - box.left) / box.width - 0.5;
        const py = (event.clientY - box.top) / box.height - 0.5;
        setTilt({ x: -py * intensity, y: px * intensity });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
}

/** Endless horizontal ribbon of text. Pure CSS animation, so it costs nothing. */
export function Marquee({
  items,
  className,
  separator = "◆",
}: {
  items: string[];
  className?: string;
  separator?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            {item}
            <span className="text-gold-500 text-[0.6em]" aria-hidden>
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** A thin gold rule that draws itself outward when it enters the frame. */
export function GoldRule({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`rule-gold ${className ?? ""}`}
      initial={reduced ? false : { scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: EASE }}
    />
  );
}

/** Progress bar pinned to the top of the window. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="from-pks-500 via-gold-500 to-pks-500 fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r"
    />
  );
}
