"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/client";
import styles from "./Sheet.module.css";

const noop = () => () => {};

/** Modal on tablet/desktop, bottom sheet on phones. */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.root} data-open={open || undefined} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={panel}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-lenis-prevent
      >
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.nav.close}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M3 3l12 12M15 3 3 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>{open && children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
