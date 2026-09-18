import data from "../../data/turntables.json";
import type { DishKind } from "@/components/three/dish-models";

export type Turntable = {
  id: string;
  menuItemId: string;
  /** Procedural model shown until the photographs exist. */
  fallback3d: DishKind;
  frames: number;
  extension: string;
  ready: boolean;
};

export const turntables = data.turntables as Record<string, Turntable>;

export function getTurntable(id: string): Turntable | undefined {
  return turntables[id];
}

/** `/photos/turntable/ran-sajji/007.jpg` */
export function frameUrl(turntable: Turntable, index: number): string {
  const n = String(index + 1).padStart(3, "0");
  return `/photos/turntable/${turntable.id}/${n}.${turntable.extension}`;
}

export function frameUrls(turntable: Turntable): string[] {
  return Array.from({ length: turntable.frames }, (_, i) => frameUrl(turntable, i));
}
