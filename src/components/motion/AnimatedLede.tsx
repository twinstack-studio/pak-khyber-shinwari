"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ---------------------------------------------------------------
   The opening sentence, revealed a word at a time.

   Words arrive out of focus and settle — blur plus a small rise, which
   reads as the line coming into being rather than sliding in from
   somewhere. Words wrapped in *asterisks* in the translation file are the
   ones worth landing on (Grand Trunk Road, charpai, karahi, qahwa): they
   come in gold, hold a beat longer, and draw a gold rule beneath
   themselves once they arrive.

   Marking emphasis inside the message string keeps it in the translator's
   hands — Urdu stresses different words than English, and the component
   never needs to know which.
   --------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

type Token = { word: string; emphasis: boolean };

function tokenize(text: string): Token[] {
  // Split on *emphasis* spans, then on whitespace inside each span.
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .flatMap((segment) => {
      const emphasis = segment.startsWith("*") && segment.endsWith("*");
      const body = emphasis ? segment.slice(1, -1) : segment;
      return body
        .split(/(\s+)/)
        .filter((part) => part.trim().length > 0)
        .map((word) => ({ word, emphasis }));
    });
}

export function AnimatedLede({
  text,
  className,
  delay = 0,
  /** Seconds between one word and the next. */
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const tokens = useMemo(() => tokenize(text), [text]);

  if (reduced) {
    // Strip the markers and show the sentence as written.
    return <p className={className}>{text.replace(/\*/g, "")}</p>;
  }

  return (
    <motion.p
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {tokens.map((token, index) => (
        <motion.span
          key={`${token.word}-${index}`}
          className={`relative inline-block ${
            token.emphasis ? "text-gold-300 font-semibold" : ""
          }`}
          variants={{
            hidden: { opacity: 0, y: 14, filter: "blur(7px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: token.emphasis ? 1.05 : 0.75,
                ease: EASE,
              },
            },
          }}
        >
          {token.word}
          {token.emphasis && (
            <motion.span
              aria-hidden
              className="from-gold-500/0 via-gold-300 to-gold-500/0 absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gradient-to-r"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: delay + index * stagger + 0.45,
                ease: EASE,
              }}
            />
          )}
          {/* A normal space would collapse against the inline-block. */}
          {index < tokens.length - 1 && " "}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default AnimatedLede;
