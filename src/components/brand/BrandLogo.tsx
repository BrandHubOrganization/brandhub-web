import brandHubFavicon from "../../../asset/favicon.png";
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
          "relative flex items-center justify-center shrink-0",
          iconSize,
        )}
      >
        <img
          src={brandHubFavicon}
          alt="BrandHub"
          className="size-full scale-125 object-contain"
        />
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
