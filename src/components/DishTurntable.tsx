"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useReducedMotion as useMotionReduced } from "motion/react";
import { frameUrls, type Turntable } from "@/lib/turntables";
import { photoUrl, type Photo } from "@/lib/photos";

/* ---------------------------------------------------------------
   Real-photograph 360 spin.

   A photograph has no back, so a single image can never be turned. What
   turns here is a sequence: one frame per step of a rotating stand, swapped
   under the pointer. Every frame is preloaded and decoded before playback so
   dragging never stutters on a half-loaded image.

   Until PKS shoots those sequences, this falls back to a single real
   photograph on a slow drift — real food that does not rotate reads far
   better than a modelled dish that does.
   --------------------------------------------------------------- */

const AUTO_ROTATE_MS = 90;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** The still shown until a real 360 sequence exists for this dish. */
function StillPhoto({
  photo,
  label,
  className,
  priority,
}: {
  photo: Photo;
  label: string;
  className?: string;
  priority?: boolean;
}) {
  const reduced = useMotionReduced();
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.12, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={photoUrl(photo, 1400)}
          alt={label}
          fill
          sizes="(max-width: 1024px) 92vw, 46vw"
          priority={priority}
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}

export type DishTurntableProps = {
  turntable: Turntable;
  /** Used as the alt text and while frames load. */
  label: string;
  /** Shown until the 360 frames for this dish exist. */
  photo?: Photo;
  className?: string;
  dragHint?: string;
  priority?: boolean;
};

export function DishTurntable({
  turntable,
  label,
  photo,
  className,
  dragHint,
  priority,
}: DishTurntableProps) {
  const usePhotos = turntable.ready;

  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const reducedMotion = useReducedMotion();

  const urls = usePhotos ? frameUrls(turntable) : [];
  const total = urls.length;
  const ready = total > 0 && loaded >= total;

  const drag = useRef<{ x: number; frame: number } | null>(null);
  const container = useRef<HTMLDivElement>(null);

  /* Preload and decode every frame before the spin is offered. */
  useEffect(() => {
    if (!usePhotos) return;
    let cancelled = false;
    let done = 0;

    urls.forEach((url) => {
      // window.Image, not the next/image component imported above.
      const image = new window.Image();
      image.onload = () => {
        if (cancelled) return;
        done += 1;
        setLoaded(done);
      };
      image.onerror = () => {
        if (!cancelled) setFailed(true);
      };
      image.src = url;
    });

    return () => {
      cancelled = true;
    };
    // urls is derived from turntable, which is stable per dish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turntable.id, usePhotos]);

  /* Idle spin, until the visitor takes hold of it. */
  useEffect(() => {
    if (!ready || interacted || reducedMotion) return;
    const timer = window.setInterval(
      () => setFrame((f) => (f + 1) % total),
      AUTO_ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [ready, interacted, reducedMotion, total]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!ready) return;
      setInteracted(true);
      drag.current = { x: event.clientX, frame };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [ready, frame],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = drag.current;
      if (!start || !container.current) return;
      const width = container.current.clientWidth || 1;
      // A full drag across the element is one complete revolution.
      const delta = ((event.clientX - start.x) / width) * total;
      const next = Math.round(start.frame - delta);
      setFrame(((next % total) + total) % total);
    },
    [total],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  /* Arrow keys turn it too — a spin nobody can reach is not a feature. */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!ready) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setInteracted(true);
        const step = event.key === "ArrowRight" ? 1 : -1;
        setFrame((f) => ((f + step) % total + total) % total);
      }
    },
    [ready, total],
  );

  // No 360 sequence yet (or the frames failed to load): show the still.
  if ((!usePhotos || failed) && photo) {
    return (
      <StillPhoto
        photo={photo}
        label={label}
        className={className}
        priority={priority}
      />
    );
  }

  if (!usePhotos || failed) {
    return <div className={className} aria-label={label} role="img" />;
  }

  const progress = total ? Math.round((loaded / total) * 100) : 0;

  return (
    <div className={className}>
      <div
        ref={container}
        role="img"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative h-full w-full touch-none cursor-grab select-none active:cursor-grabbing focus:outline-none"
      >
        {urls.map((url, index) => (
          // Plain <img>: every frame is already decoded in memory, and
          // next/image would fight the preloader for no benefit here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={index === 0 ? label : ""}
            aria-hidden={index !== frame}
            draggable={false}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-75 ${
              index === frame && ready ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="border-ember-500/25 border-t-ember-500 h-10 w-10 animate-spin rounded-full border-2" />
            <p className="text-naan-200/40 text-xs tabular-nums">{progress}%</p>
          </div>
        )}
      </div>

      {dragHint && ready && !interacted && (
        <p className="pointer-events-none mt-3 text-center text-xs tracking-widest text-naan-200/50 uppercase">
          {dragHint}
        </p>
      )}
    </div>
  );
}

export default DishTurntable;
