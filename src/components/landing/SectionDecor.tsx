import { cn } from "@/lib/utils";

/**
 * Trang trí nền thẩm mỹ cao cho section landing:
 * - Lưới vector dot matrix + fine grid lines
 * - Vòng tròn đồng tâm gradient SVG phát sáng ở góc
 * - Crosshair markers và radar lines kỹ thuật
 */
export function SectionDecor({
  corner = "right",
  className,
}: {
  corner?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none",
        className,
      )}
    >
      {/* Radiant Concentric Rings SVG */}
      <svg
        className={cn(
          "absolute -top-24 size-[48rem] transition-transform duration-700",
          corner === "right" ? "-right-32" : "-left-32",
        )}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id={`decor-glow-${corner}`}
            cx="250"
            cy="250"
            r="250"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F97316" stopOpacity="0.16" />
            <stop offset="0.6" stopColor="#EA580C" stopOpacity="0.04" />
            <stop offset="1" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="250" cy="250" r="240" fill={`url(#decor-glow-${corner})`} />
        <circle cx="250" cy="250" r="220" stroke="#F97316" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="250" cy="250" r="170" stroke="#F97316" strokeOpacity="0.1" strokeWidth="1" />
        <circle cx="250" cy="250" r="110" stroke="#F97316" strokeOpacity="0.14" strokeWidth="1.2" strokeDasharray="6 3" />
        <circle cx="250" cy="250" r="50" stroke="#F97316" strokeOpacity="0.2" strokeWidth="1.5" />

        {/* Technical Axis Lines */}
        <line x1="250" y1="20" x2="250" y2="480" stroke="#F97316" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="20" y1="250" x2="480" y2="250" stroke="#F97316" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 4" />

        {/* Satellite Points */}
        <circle cx="360" cy="250" r="3" fill="#F97316" fillOpacity="0.4" />
        <circle cx="250" cy="140" r="2.5" fill="#F97316" fillOpacity="0.35" />
        <circle cx="172" cy="172" r="2" fill="#F97316" fillOpacity="0.3" />
      </svg>

      {/* Modern High-Precision Dot & Grid Pattern */}
      <svg className="absolute inset-0 size-full opacity-[0.45] dark:opacity-[0.2]">
        <defs>
          <pattern
            id="section-fine-grid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="18" cy="18" r="1.2" fill="currentColor" opacity="0.6" />
            <path
              d="M36 0H0V36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.15"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#section-fine-grid)"
          className="text-zinc-400 dark:text-zinc-600"
        />
      </svg>

      {/* Corner Bracket / Crosshair Vector Markers */}
      <svg
        className={cn(
          "absolute top-8 size-8 opacity-40 dark:opacity-25",
          corner === "right" ? "right-8" : "left-8",
        )}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4V20M4 12H20"
          stroke="#F97316"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="#F97316" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      </svg>
    </div>
  );
}

export default SectionDecor;

