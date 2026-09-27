import type { ReactNode, KeyboardEvent } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { useSpotlight } from "@/hooks/useSpotlight";

interface SpotlightCardProps extends Omit<
  HTMLMotionProps<"div">,
  "onClick" | "children"
> {
  children: ReactNode;
  onActivate: () => void;
  "aria-label": string;
  className?: string;
}

/**
 * Card clickable dùng chung cho AIFeatures/AgencyWorkspace/Templates:
 * click/Enter/Space → onActivate, cộng hiệu ứng spotlight radial theo
 * chuột (CSS var --x/--y, xem useSpotlight) thay cho hover tĩnh cũ.
 */
export function SpotlightCard({
  children,
  onActivate,
  className,
  ...motionProps
}: SpotlightCardProps) {
  const { ref, onMouseMove } = useSpotlight<HTMLDivElement>();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      onMouseMove={onMouseMove}
      className={cn(
        "group focus-visible:ring-brand-orange relative flex cursor-pointer flex-col items-start overflow-hidden rounded-2xl border border-orange-100 bg-white p-8 shadow-sm transition-all hover:border-orange-200 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-800/30",
        className,
      )}
      {...motionProps}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--x, 50%) var(--y, 50%), hsl(var(--brand-orange) / 0.1), transparent 70%)",
        }}
      />
      {children}
    </motion.div>
  );
}

export default SpotlightCard;
