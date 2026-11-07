import React from "react";
import { Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialGlyphProps {
  socialKey: string;
  className?: string;
}

/**
 * Standard SVG Glyphs for Social Platforms
 */
export const LinkedInGlyph: React.FC<{ className?: string }> = ({
  className = "size-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("size-4 text-[#0A66C2]", className)}
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </svg>
);

export const FacebookGlyph: React.FC<{ className?: string }> = ({
  className = "size-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("size-4 text-[#1877F2]", className)}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const InstagramGlyph: React.FC<{ className?: string }> = ({
  className = "size-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("size-4 text-[#E4405F]", className)}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const TikTokGlyph: React.FC<{ className?: string }> = ({
  className = "size-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("text-foreground size-4", className)}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46 6.27 6.27 0 0 0 1.88-4.46V8.78a8.18 8.18 0 0 0 4.89 1.62V6.95a4.88 4.88 0 0 1-.99-.26z" />
  </svg>
);

/**
 * Returns the matching icon glyph for a social key.
 */
export const SocialGlyph: React.FC<SocialGlyphProps> = ({
  socialKey,
  className,
}) => {
  switch (socialKey.toLowerCase()) {
    case "linkedin":
      return <LinkedInGlyph className={className} />;
    case "facebook":
      return <FacebookGlyph className={className} />;
    case "instagram":
      return <InstagramGlyph className={className} />;
    case "tiktok":
      return <TikTokGlyph className={className} />;
    case "website":
      return <Globe className={cn("text-brand-orange size-4", className)} />;
    default:
      return (
        <ExternalLink className={cn("text-brand-orange size-4", className)} />
      );
  }
};

export interface SocialIconButtonProps {
  socialKey: string;
  url: string;
  title: string;
  className?: string;
}

/**
 * Circular social button designed for horizontal icon bar in profile preview.
 */
export const SocialIconButton: React.FC<SocialIconButtonProps> = ({
  socialKey,
  url,
  title,
  className,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={title}
      aria-label={title}
      className={cn(
        "border-border bg-card hover:bg-muted group inline-flex items-center justify-center rounded-full border p-1.5 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95",
        className,
      )}
    >
      <SocialGlyph
        socialKey={socialKey}
        className="size-4 transition-transform group-hover:scale-110"
      />
    </a>
  );
};
