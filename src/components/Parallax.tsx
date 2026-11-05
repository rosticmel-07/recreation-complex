"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps a photo: it is revealed with a clip from the bottom when it enters the viewport
 * and drifts slightly slower than the page while scrolling.
 */
export default function Parallax({
  children,
  className,
  amount = 12,
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  reveal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const inner = el.firstElementChild as HTMLElement;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: -amount / 2, scale: 1 + amount / 100 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      if (reveal) {
        gsap.fromTo(
          el,
          { clipPath: "inset(18% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [amount, reveal]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, willChange: "transform" }}>{children}</div>
    </div>
  );
}
