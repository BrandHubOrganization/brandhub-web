export interface BannerPreset {
  id: string;
  name: string;
  category: "gradient" | "photo";
  url: string;
  previewGradient?: string;
}

export const BANNER_PRESETS: BannerPreset[] = [
  // 1. Gradients & Abstracts (Chuyên nghiệp & Tươi sáng)
  {
    id: "sunset-ember",
    name: "Sunset Ember",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #f05a28 0%, #ff8c42 50%, #f9c784 100%)",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  },
  {
    id: "neon-cyber",
    name: "Neon Glow",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)",
  },
  {
    id: "emerald-glow",
    name: "Emerald Horizon",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  },
  {
    id: "cosmic-slate",
    name: "Midnight Slate",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  },
  {
    id: "aurora-violet",
    name: "Royal Aurora",
    category: "gradient",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&auto=format&fit=crop&q=80",
    previewGradient: "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
  },

  // 2. Chụp thực tế / Studio / Doanh nghiệp
  {
    id: "modern-workspace",
    name: "Không gian làm việc",
    category: "photo",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: "creative-team",
    name: "Đội ngũ sáng tạo",
    category: "photo",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: "architecture",
    name: "Kiến trúc tương lai",
    category: "photo",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: "minimal-office",
    name: "Tối giản hiện đại",
    category: "photo",
    url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: "design-art",
    name: "Nghệ thuật & Thiết kế",
    category: "photo",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: "urban-lights",
    name: "Thành phố ánh sáng",
    category: "photo",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1400&auto=format&fit=crop&q=80",
  },
];
