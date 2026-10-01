import { Building2 } from "lucide-react";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";

interface ClientProfileLogoProps {
  logoUrl?: string | null;
  displayName?: string | null;
  brandColor?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Universal logo renderer for ClientProfile:
 * - If `logoUrl` is formatted as `icon:{iconName}:{hexColor}`, renders the SVG icon with tint.
 * - If `logoUrl` is an image URL (http/https/blob/data), renders the `<img>`.
 * - Otherwise renders initial letter or fallback `Building2` icon.
 */
export function ClientProfileLogo({
  logoUrl,
  displayName,
  brandColor = "#f05a28",
  className,
  iconClassName,
}: ClientProfileLogoProps) {
  if (logoUrl?.startsWith("icon:")) {
    const parts = logoUrl.split(":");
    const iconName = parts[1];
    const color = parts[2] || brandColor;
    const Icon = getLogoIcon(iconName);
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center transition-colors",
          className,
        )}
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className={cn("size-6", iconClassName)} style={{ color }} />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={displayName || "Logo"}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  const initial = displayName?.trim().charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex size-full items-center justify-center font-bold transition-colors select-none",
        className,
      )}
      style={{
        backgroundColor: `${brandColor}18`,
        color: brandColor,
      }}
    >
      {initial || <Building2 className={cn("size-6", iconClassName)} />}
    </div>
  );
}

export default ClientProfileLogo;
