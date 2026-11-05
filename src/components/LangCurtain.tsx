"use client";

import { useEffect } from "react";

import { CURTAIN_KEY as KEY } from "@/lib/curtain";

export default function LangCurtain() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute("data-swap")) return;
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(`${KEY}-y`) ?? 0);
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(`${KEY}-y`);
    } catch {}
    if (y) {
      window.scrollTo(0, y);
      window.__lenis?.scrollTo(y, { immediate: true });
    }
    const t1 = setTimeout(() => html.setAttribute("data-swap", "out"), 250);
    const t2 = setTimeout(() => html.removeAttribute("data-swap"), 1250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return <div className="lang-curtain lang-curtain--out" aria-hidden="true" />;
}
