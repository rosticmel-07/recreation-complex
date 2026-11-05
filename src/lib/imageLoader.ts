"use client";

/** Unsplash resizes on its own CDN, so images skip the Next.js optimizer. */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    return `${src}?w=${width}&q=${quality ?? 72}&auto=format&fit=crop`;
  }
  return src;
}
