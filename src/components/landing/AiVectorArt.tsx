import { cn } from "@/lib/utils";

interface AiVectorArtProps {
  type: string;
  className?: string;
}

export function AiVectorArt({ type, className }: AiVectorArtProps) {
  switch (type) {
    case "trendCrawler":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          <defs>
            <linearGradient id="tc-grad" x1="0" y1="70" x2="120" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" stopOpacity="0.4" />
              <stop offset="1" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Subtle Grid */}
          <line x1="10" y1="20" x2="110" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 3" />
          <line x1="10" y1="45" x2="110" y2="45" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 3" />
          {/* Trend Area */}
          <path
            d="M10 58 C 30 52, 45 60, 65 35 C 80 18, 95 24, 110 12 L 110 65 L 10 65 Z"
            fill="url(#tc-grad)"
          />
          {/* Trend Line */}
          <path
            d="M10 58 C 30 52, 45 60, 65 35 C 80 18, 95 24, 110 12"
            stroke="#F97316"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Glowing Peak Points */}
          <circle cx="65" cy="35" r="3.2" fill="#F97316" />
          <circle cx="65" cy="35" r="6" stroke="#F97316" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="110" cy="12" r="3.8" fill="#FFFFFF" stroke="#F97316" strokeWidth="2" />
        </svg>
      );

    case "virtualAmbassador":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Biometric Avatar Mesh Polygon */}
          <path
            d="M60 10 L82 24 L76 52 L60 64 L44 52 L38 24 Z"
            stroke="#F97316"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          {/* Facial Landmark Symmetry Lines */}
          <line x1="60" y1="10" x2="60" y2="64" stroke="#F97316" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="45" y1="32" x2="75" y2="32" stroke="#F97316" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="50" y1="46" x2="70" y2="46" stroke="#F97316" strokeOpacity="0.3" strokeWidth="1" />
          {/* LoRA Keypoints */}
          <circle cx="50" cy="32" r="2.2" fill="#F97316" />
          <circle cx="70" cy="32" r="2.2" fill="#F97316" />
          <circle cx="60" cy="40" r="1.8" fill="#F97316" fillOpacity="0.8" />
          <circle cx="60" cy="48" r="2.2" fill="#F97316" />
          <circle cx="60" cy="10" r="2" fill="#F97316" fillOpacity="0.5" />
          <circle cx="60" cy="64" r="2" fill="#F97316" fillOpacity="0.5" />
        </svg>
      );

    case "graphRag":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Knowledge Graph Edges */}
          <line x1="60" y1="35" x2="25" y2="20" stroke="#F97316" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="60" y1="35" x2="95" y2="22" stroke="#F97316" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="60" y1="35" x2="40" y2="58" stroke="#F97316" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="60" y1="35" x2="85" y2="55" stroke="#F97316" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="25" y1="20" x2="40" y2="58" stroke="#F97316" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="95" y1="22" x2="85" y2="55" stroke="#F97316" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />

          {/* Central Brand Entity Node */}
          <circle cx="60" cy="35" r="7" fill="#F97316" fillOpacity="0.2" />
          <circle cx="60" cy="35" r="4.5" fill="#F97316" />

          {/* Semantic Concept Nodes */}
          <circle cx="25" cy="20" r="3.2" fill="#FFFFFF" stroke="#F97316" strokeWidth="1.8" />
          <circle cx="95" cy="22" r="3.2" fill="#FFFFFF" stroke="#F97316" strokeWidth="1.8" />
          <circle cx="40" cy="58" r="3" fill="#F97316" fillOpacity="0.8" />
          <circle cx="85" cy="55" r="3" fill="#F97316" fillOpacity="0.8" />
        </svg>
      );

    case "generativeStudio":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Aspect Ratio Framing Guideline (16:9 & 1:1) */}
          <rect x="15" y="12" width="70" height="46" rx="4" stroke="#F97316" strokeOpacity="0.25" strokeWidth="1" />
          <rect x="25" y="12" width="46" height="46" rx="2" stroke="#F97316" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 2" />
          {/* Watermark Protection Stamp SVG */}
          <g transform="translate(68, 28) rotate(-12)">
            <rect x="0" y="0" width="36" height="20" rx="3" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeWidth="1" />
            <text x="5" y="14" fill="#F97316" fontSize="7.5" fontWeight="bold" letterSpacing="0.5">
              BRAND
            </text>
            <circle cx="30" cy="10" r="2" fill="#F97316" />
          </g>
          {/* Focus Reticle in Center */}
          <path d="M44 35H52M48 31V39" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "livestreamScript":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Audio Waveform Spectrum Bars */}
          <rect x="15" y="32" width="2.5" height="12" rx="1.2" fill="#F97316" fillOpacity="0.3" />
          <rect x="22" y="24" width="2.5" height="26" rx="1.2" fill="#F97316" fillOpacity="0.4" />
          <rect x="29" y="16" width="2.5" height="40" rx="1.2" fill="#F97316" fillOpacity="0.7" />
          <rect x="36" y="26" width="2.5" height="22" rx="1.2" fill="#F97316" fillOpacity="0.5" />
          <rect x="43" y="18" width="2.5" height="36" rx="1.2" fill="#F97316" />
          <rect x="50" y="28" width="2.5" height="18" rx="1.2" fill="#F97316" fillOpacity="0.4" />

          {/* Broadcast Radio Waves */}
          <path d="M72 44 C 77 39, 77 31, 72 26" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M80 50 C 88 42, 88 28, 80 20" stroke="#F97316" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M88 56 C 99 45, 99 25, 88 14" stroke="#F97316" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="65" cy="35" r="3" fill="#F97316" />
        </svg>
      );

    case "collaboratorRecommender":
      return (
        <svg
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("size-full select-none", className)}
        >
          {/* Multi-Partner Bridge Network */}
          <path
            d="M20 35 Q 60 15, 100 35 Q 60 55, 20 35"
            stroke="#F97316"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <line x1="20" y1="35" x2="100" y2="35" stroke="#F97316" strokeOpacity="0.3" strokeWidth="1" />

          {/* Partner Nodes */}
          <circle cx="20" cy="35" r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="2" />
          <circle cx="60" cy="22" r="4" fill="#F97316" fillOpacity="0.9" />
          <circle cx="60" cy="48" r="4" fill="#F97316" fillOpacity="0.9" />
          <circle cx="100" cy="35" r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="2" />

          {/* Central Spark */}
          <circle cx="60" cy="35" r="2.5" fill="#F97316" />
        </svg>
      );

    default:
      return null;
  }
}

export default AiVectorArt;
