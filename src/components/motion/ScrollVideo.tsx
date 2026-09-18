"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

/* ---------------------------------------------------------------
   A looping clip that reacts to the scroll position, the same way
   ScrollImage does — the frame stays put and the picture drifts, breathes
   and tilts inside it.

   Two things beyond a plain <video>:

   - It only plays while it is on screen. A background loop running behind
     three screens of scrolled-past page is a phone battery for nothing.
   - Under prefers-reduced-motion it does not play at all; the poster frame
     is shown instead, which is the honest still of the same shot.
   --------------------------------------------------------------- */

export function ScrollVideo({
  src,
  poster,
  className,
  /** Description for anyone who cannot see it. */
  label,
  intensity = 1,
  rounded = true,
}: {
  src: string;
  poster: string;
  className?: string;
  label: string;
  intensity?: number;
  rounded?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });

  /**
   * Deliberately almost nothing.
   *
   * The source clip is 576px wide and the frame it sits in is about the same,
   * so the footage is already at its native size on screen. Every extra
   * percent of scale is a straight loss of sharpness, and a rotation
   * resamples every pixel on top of that. Enough drift to feel alive, and
   * only the scale needed to keep the edges covered while it drifts.
   */
  const drift = useTransform(
    progress,
    [0, 1],
    [`${-1.5 * intensity}%`, `${1.5 * intensity}%`],
  );
  const zoom = useTransform(progress, [0, 0.5, 1], [1.04, 1.06, 1.04]);
  const tilt = useTransform(progress, [0, 1], [0, 0]);

  /* Play only while it is actually on screen. */
  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "150px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    if (visible && !reduced) {
      // Autoplay can still be refused; the poster stays up if it is.
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [visible, reduced]);

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: drift, scale: zoom, rotate: tilt }}
      >
        <video
          ref={video}
          className="h-full w-full object-cover"
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}

export default ScrollVideo;
