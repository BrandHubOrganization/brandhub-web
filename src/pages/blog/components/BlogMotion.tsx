import { useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

export const BLOG_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Top scroll-driven progress indicator for long-form blog articles.
 * Animates exclusively via GPU transform (`scaleX`).
 */
export function BlogReadingProgress() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent"
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-brand-orange via-orange-500 to-amber-500"
        style={{ scaleX: smoothProgress }}
      />
    </div>
  );
}

/**
 * Delegated pointer tracker that feeds `--bh-mx` / `--bh-my` into any nested
 * `.bh-spotlight-card` elements using requestAnimationFrame throttling.
 */
export function BlogSpotlightContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingEvent = useRef<{ x: number; y: number; card: HTMLElement } | null>(
    null,
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        ".bh-spotlight-card",
      );
      if (!card) return;

      pendingEvent.current = { x: e.clientX, y: e.clientY, card };
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const payload = pendingEvent.current;
        if (!payload) return;
        const rect = payload.card.getBoundingClientRect();
        payload.card.style.setProperty(
          "--bh-mx",
          `${payload.x - rect.left}px`,
        );
        payload.card.style.setProperty("--bh-my", `${payload.y - rect.top}px`);
      });
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={cn(className)}
    >
      {children}
    </div>
  );
}

/**
 * Scroll-triggered entrance wrapper constrained strictly to transform + opacity.
 * Keeps `amount: 0.05` and short distance so tall grids reveal immediately without trapping SSR/readers.
 */
export function BlogReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.42, delay, ease: BLOG_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
