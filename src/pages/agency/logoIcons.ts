import {
  Building2,
  Rocket,
  Megaphone,
  Palette,
  Sparkles,
  Star,
  Crown,
  Zap,
  Flame,
  Shield,
  Globe,
  Compass,
  Briefcase,
  Layers,
  Gem,
  Target,
  Lightbulb,
  HeartHandshake,
  Feather,
  Eye,
  Coffee,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export interface LogoIconOption {
  name: string;
  label?: string;
  Icon: LucideIcon;
}

// Bộ icon SVG dùng thay logo khi agency chưa upload ảnh thật hoặc muốn dùng biểu tượng đại diện.
export const LOGO_ICON_OPTIONS: LogoIconOption[] = [
  { name: "building", label: "Tòa nhà", Icon: Building2 },
  { name: "rocket", label: "Khởi nghiệp", Icon: Rocket },
  { name: "megaphone", label: "Marketing", Icon: Megaphone },
  { name: "palette", label: "Sáng tạo", Icon: Palette },
  { name: "sparkles", label: "Tỏa sáng", Icon: Sparkles },
  { name: "star", label: "Chất lượng", Icon: Star },
  { name: "crown", label: "Đẳng cấp", Icon: Crown },
  { name: "zap", label: "Đột phá", Icon: Zap },
  { name: "flame", label: "Xu hướng", Icon: Flame },
  { name: "shield", label: "Uy tín", Icon: Shield },
  { name: "globe", label: "Toàn cầu", Icon: Globe },
  { name: "compass", label: "Chiến lược", Icon: Compass },
  { name: "briefcase", label: "Chuyên nghiệp", Icon: Briefcase },
  { name: "layers", label: "Công nghệ", Icon: Layers },
  { name: "gem", label: "Cao cấp", Icon: Gem },
  { name: "target", label: "Mục tiêu", Icon: Target },
  { name: "lightbulb", label: "Ý tưởng", Icon: Lightbulb },
  { name: "heart", label: "Đối tác", Icon: HeartHandshake },
  { name: "feather", label: "Nội dung", Icon: Feather },
  { name: "eye", label: "Thị giác", Icon: Eye },
  { name: "coffee", label: "F&B", Icon: Coffee },
  { name: "bag", label: "Bán lẻ", Icon: ShoppingBag },
];

export function getLogoIcon(name: string | null | undefined): LucideIcon {
  return LOGO_ICON_OPTIONS.find((o) => o.name === name)?.Icon ?? Building2;
}
