import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showText = true,
  className,
}: BrandLogoProps) {
  const iconSize = {
    sm: "size-7",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  }[size];

  const textSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm shadow-orange-500/20",
          iconSize,
        )}
      >
        {/* BrandHub Custom Hexagonal Hub & Node Network Vector SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full"
        >
          <defs>
            <linearGradient id="bh-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="bh-accent" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FED7AA" stopOpacity="0.8" />
            </linearGradient>
            <filter id="bh-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Rounded Shield */}
          <rect width="40" height="40" rx="10" fill="url(#bh-bg)" />

          {/* Subtle Grid Network */}
          <path
            d="M6 20H34M20 6V34"
            stroke="white"
            strokeOpacity="0.12"
            strokeWidth="0.8"
            strokeDasharray="1.5 1.5"
          />

          {/* Connected Hub Vectors (The 'B' silhouette embedded in interconnected network nodes) */}
          <path
            d="M12 9V31M12 9H23C26.3137 9 29 11.6863 29 15C29 18.3137 26.3137 21 23 21M12 21H24C27.3137 21 30 23.6863 30 27C30 30.3137 27.3137 33 24 33H12"
            stroke="url(#bh-accent)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Creative Core Node */}
          <circle cx="21" cy="20" r="2.4" fill="#FFFFFF" filter="url(#bh-glow)" />

          {/* Satellite Orbit Nodes */}
          <circle cx="29" cy="15" r="1.5" fill="#FED7AA" />
          <circle cx="30" cy="27" r="1.5" fill="#FED7AA" />
          <circle cx="12" cy="9" r="1.6" fill="#FFFFFF" />
          <circle cx="12" cy="31" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100",
            textSize,
          )}
        >
          Brand<span className="text-brand-orange">Hub</span>
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
