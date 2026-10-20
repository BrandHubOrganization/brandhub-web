import { cn } from "@/lib/utils";

interface PartnerLogoProps {
  name: string;
  className?: string;
}

export function TechPartnerLogo({ name, className }: PartnerLogoProps) {
  const base = cn("size-5 shrink-0 transition-transform group-hover:scale-110", className);

  switch (name) {
    case "Meta Graph API":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M16.92 5C14.7 5 12.8 6.47 12 7.74C11.2 6.47 9.3 5 7.08 5C3.39 5 0.5 8.08 0.5 12C0.5 15.92 3.39 19 7.08 19C9.77 19 11.45 17.07 12 16.26C12.55 17.07 14.23 19 16.92 19C20.61 19 23.5 15.92 23.5 12C23.5 8.08 20.61 5 16.92 5ZM7.08 16.3C4.85 16.3 3.1 14.36 3.1 12C3.1 9.64 4.85 7.7 7.08 7.7C9.37 7.7 10.98 9.9 11.45 12C10.98 14.1 9.37 16.3 7.08 16.3ZM16.92 16.3C14.63 16.3 13.02 14.1 12.55 12C13.02 9.9 14.63 7.7 16.92 7.7C19.15 7.7 20.9 9.64 20.9 12C20.9 14.36 19.15 16.3 16.92 16.3Z"
            fill="#0668E1"
          />
        </svg>
      );

    case "TikTok Developers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.883 2.896 2.896 0 0 1-2.887-2.883 2.896 2.896 0 0 1 2.887-2.883c.31 0 .605.05.882.14v-3.518a6.388 6.388 0 0 0-.882-.061A6.34 6.34 0 0 0 3 15.672 6.34 6.34 0 0 0 9.487 22a6.34 6.34 0 0 0 6.368-6.328V9.176a8.163 8.163 0 0 0 4.734 1.51v-3.49a4.832 4.832 0 0 1-1-.51z"
            fill="#FE2C55"
          />
        </svg>
      );

    case "Spring Cloud Gateway":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M21.5 12.5c-.2 3.7-2.4 6.8-5.7 8.2-3.3 1.4-7.2.8-9.8-1.7-2.6-2.5-3.3-6.4-2-9.7 1.3-3.3 4.4-5.6 8.1-5.9 1.1-.1 2.3.1 3.3.5.5-1.2 1.4-2.2 2.6-2.9-2-1.3-4.3-1.8-6.7-1.5C6 0 1.2 4.2.2 9.5c-1 5.3 1.8 10.6 6.7 12.8 4.9 2.2 10.7 1.2 14.5-2.6 3.2-3.2 4.3-7.9 2.8-12.2-.8 2.2-1.8 3.9-2.7 5z"
            fill="#6DB33F"
          />
        </svg>
      );

    case "PostgreSQL 17":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M12 2C7 2 3.5 5.5 3.5 10c0 3.2 1.8 5.7 4.5 7.2v2.8c0 .8.6 1.5 1.5 1.5h5c.8 0 1.5-.7 1.5-1.5v-2.8c2.7-1.5 4.5-4 4.5-7.2 0-4.5-3.5-8-8.5-8zm-2 15v-2.5c.6.2 1.3.3 2 .3s1.4-.1 2-.3V17h-4zm5-6.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"
            fill="#336791"
          />
        </svg>
      );

    case "MongoDB Atlas":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M12 1.5c-.4 0-.8.4-1 .8C9.5 5 5 11.5 5 15.5c0 4.2 3.1 7 7 7s7-2.8 7-7c0-4-4.5-10.5-6-13.2-.2-.4-.6-.8-1-.8zm0 18.5c-2.8 0-5-2.2-5-5 0-2.8 3-7.5 5-10.2 2 2.7 5 7.4 5 10.2 0 2.8-2.2 5-5 5z"
            fill="#47A248"
          />
        </svg>
      );

    case "Redis 7.2":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M2 7.5L12 2l10 5.5L12 13 2 7.5zm0 5l10 5.5 10-5.5M2 17.5L12 23l10-5.5"
            stroke="#DC382D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "Neo4j GraphRAG":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <circle cx="6" cy="18" r="3" fill="#008CC1" />
          <circle cx="18" cy="18" r="3" fill="#008CC1" />
          <circle cx="12" cy="6" r="3.5" fill="#018BFF" />
          <line x1="7.8" y1="15.8" x2="10.5" y2="9.2" stroke="#008CC1" strokeWidth="1.8" />
          <line x1="16.2" y1="15.8" x2="13.5" y2="9.2" stroke="#008CC1" strokeWidth="1.8" />
          <line x1="9" y1="18" x2="15" y2="18" stroke="#008CC1" strokeWidth="1.8" />
        </svg>
      );

    case "ChromaDB":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <polygon points="12,2 22,8.5 22,17.5 12,23 2,17.5 2,8.5" stroke="#E2652B" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12.5" r="3.5" fill="#E2652B" />
        </svg>
      );

    case "RabbitMQ":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <rect x="3" y="10" width="18" height="11" rx="3" fill="#FF6600" />
          <path d="M7 10V4C7 2.9 7.9 2 9 2C10.1 2 11 2.9 11 4V10" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" />
          <path d="M13 10V4C13 2.9 13.9 2 15 2C16.1 2 17 2.9 17 4V10" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="15" r="1.5" fill="#FFFFFF" />
          <circle cx="16" cy="15" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case "Docker":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <rect x="3" y="11" width="3" height="3" rx="0.5" fill="#2496ED" />
          <rect x="7" y="11" width="3" height="3" rx="0.5" fill="#2496ED" />
          <rect x="11" y="11" width="3" height="3" rx="0.5" fill="#2496ED" />
          <rect x="7" y="7" width="3" height="3" rx="0.5" fill="#2496ED" />
          <rect x="11" y="7" width="3" height="3" rx="0.5" fill="#2496ED" />
          <path
            d="M21.5 13.5c-.8 0-1.5.3-2 .8-.6-.3-1.6-.4-2.5 0-1.8.8-2.5 2.2-2.5 2.2H2.5c-.8 0-1.5.7-1.5 1.5 0 2.8 2.2 5 5 5 5.5 0 10.5-2.5 13-6.5.8.3 1.7.2 2.2-.4.4-.6.4-1.6.3-2.6z"
            fill="#2496ED"
          />
        </svg>
      );

    case "Cloudflare":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <path
            d="M18.8 11.2c-.3-2.9-2.8-5.2-5.8-5.2-2.5 0-4.6 1.6-5.4 3.8C7.1 9.9 6.6 10 6 10.2 3.8 11 2.2 13 2.2 15.5c0 3 2.5 5.5 5.5 5.5h11c2.8 0 5-2.2 5-5 0-2.4-1.7-4.4-4-4.8-.3 0-.6 0-.9 0z"
            fill="#F38020"
          />
        </svg>
      );

    case "FPT University":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base}>
          <circle cx="7" cy="12" r="4.5" fill="#F37021" />
          <circle cx="12" cy="7" r="4.5" fill="#0054A6" />
          <circle cx="17" cy="12" r="4.5" fill="#00A850" />
        </svg>
      );

    default:
      return null;
  }
}

export default TechPartnerLogo;
