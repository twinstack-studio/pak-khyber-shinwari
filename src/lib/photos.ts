import data from "../../data/photos.json";
import type { Locale } from "@/i18n/routing";

export type Photo = {
  url: string;
  alt: { en: string; ur: string };
  credit?: string;
  /** True while this is still a stand-in rather than PKS's own photography. */
  placeholder?: boolean;
};

export const dishPhotos = data.dishes as Record<string, Photo>;
export const categoryPhotos = data.categories as Record<string, Photo>;
export const scenePhotos = data.scenes as Record<string, Photo>;

/**
 * Remote photos get sized at the CDN; local files are served as they are.
 * Asking for exactly the width we render keeps a phone from downloading a
 * 4000px original to paint a 400px card.
 */
export function photoUrl(photo: Photo, width = 1200): string {
  if (!photo.url.startsWith("http")) return photo.url;
  const separator = photo.url.includes("?") ? "&" : "?";
  return `${photo.url}${separator}auto=format&fit=crop&q=80&w=${width}`;
}

export function photoAlt(photo: Photo, locale: Locale): string {
  return photo.alt[locale];
}

export function dishPhoto(id: string): Photo | undefined {
  return dishPhotos[id];
}

export function categoryPhoto(id: string): Photo | undefined {
  return categoryPhotos[id];
}

export function scenePhoto(id: keyof typeof data.scenes): Photo {
  return scenePhotos[id];
}
