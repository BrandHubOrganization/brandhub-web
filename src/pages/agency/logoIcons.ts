import {
  Building2,
  Megaphone,
  Palette,
  Rocket,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

export interface LogoIconOption {
  name: string;
  Icon: LucideIcon;
}

// Bộ icon SVG dùng thay logo khi agency chưa upload ảnh thật.
export const LOGO_ICON_OPTIONS: LogoIconOption[] = [
  { name: "building", Icon: Building2 },
  { name: "rocket", Icon: Rocket },
  { name: "megaphone", Icon: Megaphone },
  { name: "palette", Icon: Palette },
  { name: "sparkles", Icon: Sparkles },
  { name: "star", Icon: Star },
];

export function getLogoIcon(name: string | null | undefined): LucideIcon {
  return LOGO_ICON_OPTIONS.find((o) => o.name === name)?.Icon ?? Building2;
}
