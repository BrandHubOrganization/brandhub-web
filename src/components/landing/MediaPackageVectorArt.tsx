import { cn } from "@/lib/utils";

interface MediaPackageVectorArtProps {
  type: string;
  className?: string;
}

export function MediaPackageVectorArt({
  type,
  className,
}: MediaPackageVectorArtProps) {
  switch (type) {
    case "templates":
      return (
        <svg
          viewBox="0 0 80 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Stacked Blueprint Service Catalog Cards */}
          <rect x="8" y="14" width="44" height="28" rx="4" fill="#F97316" fillOpacity="0.1" stroke="#F97316" strokeOpacity="0.3" />
          <rect x="18" y="8" width="44" height="28" rx="4" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeOpacity="0.5" />
          <rect x="28" y="2" width="44" height="28" rx="4" fill="#FFFFFF" stroke="#F97316" strokeWidth="1.5" />
          {/* Card Lines */}
          <line x1="34" y1="8" x2="48" y2="8" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="34" y1="14" x2="62" y2="14" stroke="#F97316" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
          <line x1="34" y1="19" x2="56" y2="19" stroke="#F97316" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
          <circle cx="62" cy="8" r="2" fill="#F97316" />
        </svg>
      );

    case "negotiate":
      return (
        <svg
          viewBox="0 0 80 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* 2-Way Exchange Arrows & Contract Scales */}
          <path
            d="M18 16 L38 16 M34 11 L39 16 L34 21"
            stroke="#F97316"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M62 32 L42 32 M46 27 L41 32 L46 37"
            stroke="#EA580C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Client & Agency Pill Badges */}
          <rect x="8" y="26" width="24" height="13" rx="3" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeWidth="1" />
          <text x="11" y="35" fill="#F97316" fontSize="6" fontWeight="bold">AGENCY</text>
          <rect x="48" y="9" width="24" height="13" rx="3" fill="#EA580C" fillOpacity="0.15" stroke="#EA580C" strokeWidth="1" />
          <text x="52" y="18" fill="#EA580C" fontSize="6" fontWeight="bold">CLIENT</text>
        </svg>
      );

    case "convert":
      return (
        <svg
          viewBox="0 0 80 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* 1-Click Launch & 3-Task Type Funnel */}
          <path d="M10 24 H32" stroke="#F97316" strokeWidth="2" strokeDasharray="3 2" />
          <polygon points="32,20 40,24 32,28" fill="#F97316" />
          {/* 3 Output Tasks (Post, Live, Workshop) */}
          <rect x="44" y="6" width="28" height="9" rx="2" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1" />
          <text x="47" y="13" fill="#F97316" fontSize="5.5" fontWeight="bold">POST (FB/TT)</text>
          <rect x="44" y="19" width="28" height="9" rx="2" fill="#F97316" fillOpacity="0.25" stroke="#F97316" strokeWidth="1" />
          <text x="47" y="26" fill="#F97316" fontSize="5.5" fontWeight="bold">LIVESTREAM</text>
          <rect x="44" y="32" width="28" height="9" rx="2" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1" />
          <text x="47" y="39" fill="#F97316" fontSize="5.5" fontWeight="bold">WORKSHOP</text>
        </svg>
      );

    case "replicate":
      return (
        <svg
          viewBox="0 0 80 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Synchronized Workspace Tree Fork */}
          <circle cx="20" cy="24" r="7" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeWidth="1.5" />
          <circle cx="20" cy="24" r="3" fill="#F97316" />

          <path d="M27 24 Q 42 12, 56 12" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M27 24 Q 42 36, 56 36" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />

          <circle cx="60" cy="12" r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="1.5" />
          <circle cx="60" cy="36" r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="1.5" />

          <polyline points="58,12 60,14 63,10" stroke="#F97316" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <polyline points="58,36 60,38 63,34" stroke="#F97316" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}

export default MediaPackageVectorArt;
