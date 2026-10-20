import { cn } from "@/lib/utils";

interface FeatureCardSvgDecorProps {
  featureKey: string;
  className?: string;
}

export function FeatureCardSvgDecor({ featureKey, className }: FeatureCardSvgDecorProps) {
  switch (featureKey) {
    case "planning":
      return (
        <svg
          viewBox="0 0 200 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("pointer-events-none select-none opacity-40 transition-opacity group-hover:opacity-75", className)}
        >
          {/* Calendar & 3-Task Matrix Blueprint */}
          <rect x="5" y="5" width="58" height="68" rx="6" stroke="#F97316" strokeWidth="1.2" strokeDasharray="3 2" />
          <text x="12" y="22" fill="#F97316" fontSize="7.5" fontWeight="bold">TASK 01</text>
          <rect x="12" y="28" width="44" height="12" rx="3" fill="#F97316" fillOpacity="0.2" />
          <text x="16" y="37" fill="#F97316" fontSize="6" fontWeight="semibold">Social Post</text>
          <circle cx="50" cy="54" r="3" fill="#F97316" />

          <rect x="71" y="5" width="58" height="68" rx="6" stroke="#F97316" strokeWidth="1.2" strokeDasharray="3 2" />
          <text x="78" y="22" fill="#F97316" fontSize="7.5" fontWeight="bold">TASK 02</text>
          <rect x="78" y="28" width="44" height="12" rx="3" fill="#F97316" fillOpacity="0.2" />
          <text x="82" y="37" fill="#F97316" fontSize="6" fontWeight="semibold">Livestream</text>
          <polygon points="103,50 109,54 103,58" fill="#F97316" />

          <rect x="137" y="5" width="58" height="68" rx="6" stroke="#F97316" strokeWidth="1.2" strokeDasharray="3 2" />
          <text x="144" y="22" fill="#F97316" fontSize="7.5" fontWeight="bold">TASK 03</text>
          <rect x="144" y="28" width="44" height="12" rx="3" fill="#F97316" fillOpacity="0.2" />
          <text x="148" y="37" fill="#F97316" fontSize="6" fontWeight="semibold">Workshop</text>
          <line x1="148" y1="54" x2="184" y2="54" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "collab":
      return (
        <svg
          viewBox="0 0 140 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("pointer-events-none select-none opacity-35 transition-opacity group-hover:opacity-75", className)}
        >
          {/* 4-Tier Approval Flow: Creator -> Peer QC -> Manager -> Client */}
          <circle cx="16" cy="20" r="10" stroke="#F97316" strokeWidth="1.2" />
          <text x="12" y="23" fill="#F97316" fontSize="7" fontWeight="bold">CR</text>

          <line x1="26" y1="20" x2="42" y2="20" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />

          <circle cx="52" cy="20" r="10" stroke="#F97316" strokeWidth="1.2" />
          <text x="47" y="23" fill="#F97316" fontSize="7" fontWeight="bold">QC</text>

          <line x1="62" y1="20" x2="78" y2="20" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />

          <circle cx="88" cy="20" r="10" stroke="#F97316" strokeWidth="1.2" />
          <text x="83" y="23" fill="#F97316" fontSize="7" fontWeight="bold">AM</text>

          <line x1="98" y1="20" x2="114" y2="20" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />

          <circle cx="124" cy="20" r="10" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1.5" />
          <text x="120" y="23" fill="#F97316" fontSize="7" fontWeight="bold">CL</text>
        </svg>
      );

    case "publishing":
      return (
        <svg
          viewBox="0 0 100 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("pointer-events-none select-none opacity-30 transition-opacity group-hover:opacity-65", className)}
        >
          {/* Multi-channel Outbound Waves */}
          <path d="M15 20 Q 50 2, 85 20 Q 50 38, 15 20 Z" stroke="#F97316" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="20" r="4" fill="#F97316" />
          <circle cx="15" cy="20" r="2.5" fill="#F97316" />
          <circle cx="85" cy="20" r="2.5" fill="#F97316" />
        </svg>
      );

    case "analytics":
      return (
        <svg
          viewBox="0 0 100 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("pointer-events-none select-none opacity-30 transition-opacity group-hover:opacity-65", className)}
        >
          {/* Trend & Frequency Chart Bars */}
          <rect x="20" y="24" width="6" height="12" rx="1.5" fill="#F97316" fillOpacity="0.4" />
          <rect x="32" y="18" width="6" height="18" rx="1.5" fill="#F97316" fillOpacity="0.6" />
          <rect x="44" y="10" width="6" height="26" rx="1.5" fill="#F97316" />
          <rect x="56" y="14" width="6" height="22" rx="1.5" fill="#F97316" fillOpacity="0.7" />
          <rect x="68" y="20" width="6" height="16" rx="1.5" fill="#F97316" fillOpacity="0.5" />
          <path d="M20 22 L35 15 L47 8 L59 12 L71 18" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "automation":
      return (
        <svg
          viewBox="0 0 120 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("pointer-events-none select-none opacity-35 transition-opacity group-hover:opacity-70", className)}
        >
          {/* Auto Pipeline Synced Nodes */}
          <circle cx="15" cy="15" r="4" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1.2" />
          <line x1="20" y1="15" x2="45" y2="15" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="50" cy="15" r="5" fill="#F97316" />
          <line x1="56" y1="15" x2="80" y2="15" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="85" cy="15" r="4" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1.2" />
          <line x1="90" y1="15" x2="105" y2="15" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 2" />
          <polygon points="108,12 114,15 108,18" fill="#F97316" />
        </svg>
      );

    default:
      return null;
  }
}

export default FeatureCardSvgDecor;
