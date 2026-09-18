"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { photoUrl, type Photo } from "@/lib/photos";

/* ---------------------------------------------------------------
   A photograph that reacts to the scroll position.

   The frame stays put and the picture moves inside it — drifting,
   breathing in and out of scale, and tilting a degree or two. Overflow is
   clipped by the frame, and the image is deliberately rendered larger than
   the frame so no drift or rotation can ever expose an empty corner.
   --------------------------------------------------------------- */

export type ScrollEffect = "drift" | "zoom" | "tilt" | "full" | "none";

export function ScrollImage({
  photo,
  alt,
  className,
  imageClassName,
  effect = "full",
  intensity = 1,
  sizes = "100vw",
  priority,
  rounded = true,
}: {
  photo: Photo;
  alt: string;
  className?: string;
  imageClassName?: string;
  effect?: ScrollEffect;
  /** Scales every movement at once. 0.5 is a whisper, 1.5 is theatrical. */
  intensity?: number;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });

  // Springs keep the motion from tracking the wheel one-to-one, which is
  // what separates "cinematic" from "jittery".
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });

  const wants = (which: ScrollEffect) => effect === "full" || effect === which;

  const drift = useTransform(
    progress,
    [0, 1],
    wants("drift") ? [`${-9 * intensity}%`, `${9 * intensity}%`] : ["0%", "0%"],
  );
  // Largest in the middle of the viewport, easing back at either end.
  const zoom = useTransform(
    progress,
    [0, 0.5, 1],
    wants("zoom")
      ? [1.16 * intensity - (intensity - 1), 1.3, 1.16 * intensity - (intensity - 1)]
      : [1.18, 1.18, 1.18],
  );
  const tilt = useTransform(
    progress,
    [0, 1],
    wants("tilt") ? [-2.2 * intensity, 2.2 * intensity] : [0, 0],
  );

  // The frame must be positioned so the image inside can fill it — but a
  // caller placing this as a full-bleed backdrop passes its own `absolute`.
  // Emitting `relative` as well would put two position utilities on one
  // element, and Tailwind's ordering makes `relative` win: the frame then
  // collapses to zero height and the photograph disappears.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "");

  return (
    <div
      ref={frame}
      className={`${positioned ? "" : "relative"} overflow-hidden ${
        rounded ? "rounded-2xl" : ""
      } ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0"
        style={
          reduced || effect === "none"
            ? undefined
            : { y: drift, scale: zoom, rotate: tilt }
        }
      >
        <Image
          src={photoUrl(photo, 1600)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imageClassName ?? ""}`}
        />
      </motion.div>
    </div>
  );
}

export default ScrollImage;
