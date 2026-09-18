"use client";

import { Suspense, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { DishModel, type DishKind } from "./dish-models";

/** Matches the CSS `prefers-reduced-motion` query, and keeps matching it. */
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

/**
 * Gently settles the dish back to a level tilt after the visitor lets go,
 * so an abandoned drag never leaves the plate stranded at a strange angle.
 */
function AutoLevel({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  useFrame(() => {
    const orbit = controls.current;
    if (!orbit || orbit.autoRotate) return;
    const target = Math.PI / 2 - 0.32;
    const current = orbit.getPolarAngle();
    if (Math.abs(current - target) > 0.002) {
      orbit.setPolarAngle(current + (target - current) * 0.05);
      orbit.update();
    }
  });
  return null;
}

function Lighting() {
  return (
    <>
      {/* Warm key light, low and to the side — tandoor coals, not a studio softbox. */}
      <directionalLight
        position={[3.2, 4.4, 2.6]}
        intensity={2.6}
        color="#ffd9a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      {/* Cool fill from the opposite side keeps the shadow side readable. */}
      <directionalLight position={[-3.6, 2.2, -2.4]} intensity={0.75} color="#9fb6d8" />
      {/* Ember bounce from below — the giveaway that it is sitting over fire. */}
      <pointLight position={[0, -1.1, 0]} intensity={2.2} distance={5} color="#ff6a1e" />
      <ambientLight intensity={0.32} color="#fff1de" />
    </>
  );
}

export type DishViewerProps = {
  kind: DishKind;
  /** Turn the dish on its own until the visitor takes over. */
  autoRotate?: boolean;
  className?: string;
  /** Pulled in from the parent so the label stays translated. */
  dragHint?: string;
};

export function DishViewer({
  kind,
  autoRotate = true,
  className,
  dragHint,
}: DishViewerProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const reducedMotion = useReducedMotion();
  const [interacted, setInteracted] = useState(false);

  return (
    <div className={className}>
      <Canvas
        shadows
        // Cap the pixel ratio: past 2x the extra pixels cost battery and buy nothing.
        dpr={[1, 2]}
        camera={{ position: [0, 1.9, 4.1], fov: 38 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onPointerDown={() => setInteracted(true)}
        className="cursor-grab active:cursor-grabbing"
      >
        <Lighting />

        <Suspense fallback={null}>
          <group position={[0, -0.35, 0]}>
            <DishModel kind={kind} />
          </group>

          <ContactShadows
            position={[0, -0.95, 0]}
            opacity={0.55}
            scale={7}
            blur={2.4}
            far={3}
            color="#000000"
          />
        </Suspense>

        <OrbitControls
          ref={controls}
          // A dish on a table: spin it, don't fly around it.
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate && !reducedMotion && !interacted}
          autoRotateSpeed={1.1}
          rotateSpeed={0.7}
          minPolarAngle={Math.PI / 2 - 0.85}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableDamping
          dampingFactor={0.06}
        />
        <AutoLevel controls={controls} />
      </Canvas>

      {dragHint && !interacted && (
        <p className="pointer-events-none mt-3 text-center text-xs tracking-widest text-naan-200/50 uppercase">
          {dragHint}
        </p>
      )}
    </div>
  );
}

export default DishViewer;
