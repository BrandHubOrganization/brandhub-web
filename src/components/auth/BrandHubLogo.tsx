import brandHubFavicon from "../../../asset/favicon.png";
import { cn } from "@/lib/utils";

export function BrandHubLogo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={brandHubFavicon}
      alt="BrandHub"
      width={size}
      height={size}
      className={cn(
        "shrink-0 scale-125 object-contain select-none",
        className,
      )}
    />
  );
}
