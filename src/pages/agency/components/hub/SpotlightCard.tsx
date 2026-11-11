import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Màu ánh sáng spotlight tùy chỉnh (mặc định dùng Brand Orange tinh tế) */
  spotlightColor?: string;
  /** Bán kính vùng sáng (px) */
  spotlightSize?: number;
}

export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      children,
      className,
      spotlightColor = "rgba(240, 90, 40, 0.065)",
      spotlightSize = 500,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
     forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const setRefs = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (internalRef.current) {
        const rect = internalRef.current.getBoundingClientRect();
        setPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      onMouseMove?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <div
        ref={setRefs}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative bg-card rounded-xl border border-border overflow-hidden shadow-xs transition-all duration-200 hover:border-brand-orange/40 hover:shadow-md",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${spotlightSize}px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 60%)`,
          }}
        />
        {children}
      </div>
    );
  },
);

SpotlightCard.displayName = "SpotlightCard";

export default SpotlightCard;
