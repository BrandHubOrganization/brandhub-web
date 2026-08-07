export function BrandHubLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.2" fill="white" />
      <circle cx="2.5" cy="4" r="1.5" fill="white" />
      <circle cx="13.5" cy="4" r="1.5" fill="white" />
      <circle cx="2.5" cy="12" r="1.5" fill="white" />
      <circle cx="13.5" cy="12" r="1.5" fill="white" />
      <line
        x1="5.8"
        y1="7"
        x2="3.5"
        y2="5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="10.2"
        y1="7"
        x2="12.5"
        y2="5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="5.8"
        y1="9"
        x2="3.5"
        y2="11"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="10.2"
        y1="9"
        x2="12.5"
        y2="11"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
