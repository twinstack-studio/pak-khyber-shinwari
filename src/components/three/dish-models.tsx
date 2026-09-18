"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------------------------------------------------------------
   Procedural dish models.

   The client has no 3D scans and no turntable photography, so every
   signature dish here is built from primitives in code. That keeps the
   whole set under a few hundred KB with no textures to download, and it
   means a real 360 rotation rather than a parallax trick.

   If PKS ever shoots a turntable sequence, swap DishModel for an image
   sequence player — nothing else in the page needs to change.
   --------------------------------------------------------------- */

export type DishKind =
  | "karahi"
  | "chapli"
  | "pulao"
  | "sajji"
  | "platter";

/** Deterministic pseudo-random so garnish never reshuffles between renders. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const IRON = { color: "#221d1a", metalness: 0.75, roughness: 0.42 } as const;
const BRASS = { color: "#c9a227", metalness: 0.9, roughness: 0.3 } as const;

/* --------------------------- shared parts --------------------------- */

function Karahi({ radius = 1 }: { radius?: number }) {
  return (
    <group>
      {/* Bowl — lower half of a sphere, flattened. */}
      <mesh scale={[radius, radius * 0.52, radius]} castShadow receiveShadow>
        <sphereGeometry args={[1, 56, 28, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial {...IRON} side={THREE.DoubleSide} />
      </mesh>

      {/* Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[radius, radius * 0.045, 16, 64]} />
        <meshStandardMaterial {...IRON} />
      </mesh>

      {/* Two ring handles, east and west. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * radius * 1.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <torusGeometry args={[radius * 0.19, radius * 0.035, 12, 32]} />
          <meshStandardMaterial {...IRON} />
        </mesh>
      ))}
    </group>
  );
}

function Plate({ radius = 1.15, color = "#f4ece0" }: { radius?: number; color?: string }) {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 0.82, 0.09, 64]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.3} />
      </mesh>
      {/* Brass pinstripe on the rim — reads as "restaurant crockery", not a disc. */}
      <mesh position={[0, -0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.93, 0.008, 8, 80]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  );
}

/** Chunks of meat scattered on a surface within a radius. */
function MeatChunks({
  count,
  spread,
  y,
  seed,
  color = "#7c3f1d",
  size = 0.13,
}: {
  count: number;
  spread: number;
  y: number;
  seed: number;
  color?: string;
  size?: number;
}) {
  const chunks = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * spread;
      return {
        position: [
          Math.cos(angle) * dist,
          y + rand() * 0.04,
          Math.sin(angle) * dist,
        ] as [number, number, number],
        rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [
          number,
          number,
          number,
        ],
        scale: size * (0.75 + rand() * 0.6),
      };
    });
  }, [count, spread, y, seed, size]);

  return (
    <group>
      {chunks.map((chunk, i) => (
        <mesh
          key={i}
          position={chunk.position}
          rotation={chunk.rotation}
          scale={chunk.scale}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}

function Garnish({ y, spread, seed }: { y: number; spread: number; seed: number }) {
  const bits = useMemo(() => {
    const rand = seeded(seed);
    return {
      chilies: Array.from({ length: 4 }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = spread * (0.35 + rand() * 0.5);
        return {
          position: [Math.cos(angle) * dist, y, Math.sin(angle) * dist] as [
            number,
            number,
            number,
          ],
          rotation: [Math.PI / 2, 0, rand() * Math.PI] as [number, number, number],
        };
      }),
      coriander: Array.from({ length: 22 }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * spread;
        return [Math.cos(angle) * dist, y + rand() * 0.02, Math.sin(angle) * dist] as [
          number,
          number,
          number,
        ];
      }),
      ginger: Array.from({ length: 10 }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * spread * 0.8;
        return {
          position: [Math.cos(angle) * dist, y + 0.02, Math.sin(angle) * dist] as [
            number,
            number,
            number,
          ],
          rotation: [0, rand() * Math.PI, 0] as [number, number, number],
        };
      }),
    };
  }, [y, spread, seed]);

  return (
    <group>
      {bits.chilies.map((chili, i) => (
        <mesh key={`c${i}`} position={chili.position} rotation={chili.rotation} castShadow>
          <capsuleGeometry args={[0.035, 0.26, 4, 10]} />
          <meshStandardMaterial color="#3f7a24" roughness={0.35} />
        </mesh>
      ))}
      {bits.coriander.map((pos, i) => (
        <mesh key={`h${i}`} position={pos}>
          <sphereGeometry args={[0.022, 6, 5]} />
          <meshStandardMaterial color="#5fa03a" roughness={0.6} />
        </mesh>
      ))}
      {bits.ginger.map((g, i) => (
        <mesh key={`g${i}`} position={g.position} rotation={g.rotation}>
          <boxGeometry args={[0.11, 0.012, 0.016]} />
          <meshStandardMaterial color="#e8d9a8" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

/** Slow rising steam. Cheap: a handful of billboarded blobs on sine paths. */
function Steam({ count = 7, radius = 0.5, seed = 11 }: { count?: number; radius?: number; seed?: number }) {
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => ({
      offset: rand() * Math.PI * 2,
      speed: 0.16 + rand() * 0.13,
      x: (rand() - 0.5) * radius * 1.5,
      z: (rand() - 0.5) * radius * 1.5,
      scale: 0.16 + rand() * 0.16,
    }));
  }, [count, radius, seed]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const puff = puffs[i];
      const progress = ((time * puff.speed + puff.offset) % 1);
      child.position.y = progress * 1.5;
      child.position.x = puff.x + Math.sin(progress * 4 + puff.offset) * 0.1;
      child.position.z = puff.z + Math.cos(progress * 3 + puff.offset) * 0.1;
      const fade = Math.sin(progress * Math.PI);
      child.scale.setScalar(puff.scale * (0.6 + progress * 1.6));
      const material = (child as THREE.Mesh).material as
        | THREE.MeshBasicMaterial
        | undefined;
      if (material) material.opacity = fade * 0.14;
    });
  });

  return (
    <group ref={group}>
      {puffs.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------- the dishes --------------------------- */

function KarahiDish() {
  return (
    <group>
      <Karahi radius={1.05} />
      {/* Gravy surface, domed very slightly so the rim catches light. */}
      <mesh position={[0, -0.09, 0]} scale={[0.95, 0.3, 0.95]}>
        <sphereGeometry args={[1, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8d3413" roughness={0.32} metalness={0.08} />
      </mesh>
      <MeatChunks count={16} spread={0.72} y={0.14} seed={7} size={0.16} />
      <Garnish y={0.24} spread={0.78} seed={23} />
      <group position={[0, 0.3, 0]}>
        <Steam radius={0.7} seed={5} />
      </group>
    </group>
  );
}

function ChapliDish() {
  const patties = useMemo(() => {
    const rand = seeded(41);
    return [
      { pos: [-0.42, 0.02, 0.16], rot: rand() * Math.PI },
      { pos: [0.44, 0.02, -0.1], rot: rand() * Math.PI },
      { pos: [0.02, 0.13, 0.02], rot: rand() * Math.PI },
    ] as { pos: [number, number, number]; rot: number }[];
  }, []);

  return (
    <group>
      <Plate radius={1.2} />
      {patties.map((patty, i) => (
        <group key={i} position={patty.pos} rotation={[0, patty.rot, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.44, 0.42, 0.11, 32]} />
            <meshStandardMaterial color="#6b3311" roughness={0.82} />
          </mesh>
          {/* Tomato and egg slice pressed into the top, the chapli signature. */}
          <mesh position={[0.1, 0.06, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
            <meshStandardMaterial color="#c0341f" roughness={0.4} />
          </mesh>
          <mesh position={[-0.14, 0.06, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 20]} />
            <meshStandardMaterial color="#f6efd8" roughness={0.5} />
          </mesh>
          <mesh position={[-0.14, 0.072, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.014, 16]} />
            <meshStandardMaterial color="#e8a917" roughness={0.45} />
          </mesh>
        </group>
      ))}
      {/* Onion rings and lemon around the edge. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`o${i}`}
          position={[Math.cos(i * 2.2) * 0.85, 0.01, Math.sin(i * 2.2) * 0.85]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.13, 0.022, 8, 24]} />
          <meshStandardMaterial color="#efe3ee" roughness={0.4} />
        </mesh>
      ))}
      <Garnish y={0.06} spread={0.9} seed={61} />
    </group>
  );
}

function PulaoDish() {
  const bits = useMemo(() => {
    const rand = seeded(97);
    return {
      carrot: Array.from({ length: 34 }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * 0.72;
        const height = 0.42 * (1 - dist / 0.95);
        return {
          position: [Math.cos(angle) * dist, height, Math.sin(angle) * dist] as [
            number,
            number,
            number,
          ],
          rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [
            number,
            number,
            number,
          ],
        };
      }),
      raisins: Array.from({ length: 26 }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * 0.78;
        const height = 0.42 * (1 - dist / 0.95);
        return [Math.cos(angle) * dist, height, Math.sin(angle) * dist] as [
          number,
          number,
          number,
        ];
      }),
    };
  }, []);

  return (
    <group>
      <Plate radius={1.25} />
      {/* Rice mound */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <coneGeometry args={[0.95, 0.56, 48, 1]} />
        <meshStandardMaterial color="#d9c49a" roughness={0.88} />
      </mesh>
      <MeatChunks count={7} spread={0.5} y={0.42} seed={13} size={0.15} color="#6f3a19" />
      {bits.carrot.map((c, i) => (
        <mesh key={`ca${i}`} position={c.position} rotation={c.rotation}>
          <boxGeometry args={[0.13, 0.018, 0.026]} />
          <meshStandardMaterial color="#e07b1c" roughness={0.5} />
        </mesh>
      ))}
      {bits.raisins.map((pos, i) => (
        <mesh key={`r${i}`} position={pos} scale={[1, 0.7, 1]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#3d2416" roughness={0.55} />
        </mesh>
      ))}
      <group position={[0, 0.45, 0]}>
        <Steam count={5} radius={0.5} seed={31} />
      </group>
    </group>
  );
}

function SajjiDish() {
  return (
    <group>
      <Plate radius={1.35} color="#efe6d6" />
      {/* Rice bed */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.34, 1]}>
        <sphereGeometry args={[1.02, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d9c49a" roughness={0.9} />
      </mesh>
      {/* The leg: a stretched, browned capsule with the bone showing. */}
      <group position={[0, 0.44, 0]} rotation={[0, 0.5, 0.18]}>
        <mesh castShadow scale={[1, 0.72, 0.78]}>
          <capsuleGeometry args={[0.34, 0.72, 8, 24]} />
          <meshStandardMaterial color="#8a4a1c" roughness={0.62} metalness={0.04} />
        </mesh>
        {/* Charred crust patches. */}
        <mesh position={[0.06, 0.16, 0.2]} scale={[0.3, 0.12, 0.24]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#4a2410" roughness={0.85} />
        </mesh>
        <mesh position={[-0.1, 0.1, -0.22]} scale={[0.26, 0.1, 0.2]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#572b12" roughness={0.85} />
        </mesh>
        {/* Bone */}
        <mesh position={[0, -0.62, 0]} rotation={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.07, 0.08, 0.42, 16]} />
          <meshStandardMaterial color="#f0e7d2" roughness={0.5} />
        </mesh>
      </group>
      <Garnish y={0.35} spread={0.95} seed={77} />
      <group position={[0, 0.8, 0]}>
        <Steam count={6} radius={0.6} seed={19} />
      </group>
    </group>
  );
}

function PlatterDish() {
  return (
    <group>
      {/* Wide steel tray. */}
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.42, 0.1, 72]} />
        <meshStandardMaterial color="#cfd2d4" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.46, 0.035, 10, 80]} />
        <meshStandardMaterial color="#b9bcbe" metalness={0.8} roughness={0.28} />
      </mesh>

      {/* Pulao mound on one side. */}
      <group position={[-0.62, 0, 0.1]}>
        <mesh position={[0, 0.17, 0]} castShadow>
          <coneGeometry args={[0.6, 0.42, 36, 1]} />
          <meshStandardMaterial color="#d9c49a" roughness={0.88} />
        </mesh>
      </group>

      {/* Seekh kababs fanned out. */}
      {[-0.3, 0, 0.3].map((offset, i) => (
        <group key={i} position={[0.55, 0.06, offset]} rotation={[0, 0.15 * i - 0.15, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.075, 0.62, 6, 14]} />
            <meshStandardMaterial color="#6d3413" roughness={0.78} />
          </mesh>
          {/* The skewer poking out. */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.52, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
            <meshStandardMaterial color="#9aa0a4" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Naan leaning at the back. */}
      <mesh position={[0.05, 0.02, -0.95]} rotation={[-Math.PI / 2 + 0.12, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 32]} />
        <meshStandardMaterial color="#dcb87c" roughness={0.9} />
      </mesh>

      <MeatChunks count={9} spread={0.55} y={0.16} seed={53} size={0.13} />
      <Garnish y={0.14} spread={1.15} seed={83} />
      <group position={[0, 0.4, 0]}>
        <Steam count={8} radius={1} seed={67} />
      </group>
    </group>
  );
}

/* --------------------------- entry point --------------------------- */

const DISHES: Record<DishKind, () => React.ReactElement> = {
  karahi: KarahiDish,
  chapli: ChapliDish,
  pulao: PulaoDish,
  sajji: SajjiDish,
  platter: PlatterDish,
};

export function DishModel({ kind }: { kind: DishKind }) {
  const Dish = DISHES[kind] ?? KarahiDish;
  return <Dish />;
}
