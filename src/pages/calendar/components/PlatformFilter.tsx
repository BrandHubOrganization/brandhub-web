import React from "react";
import type { PlatformType } from "@/types/calendar";
import { Video, AtSign, Share2, Globe, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlatformFilterProps {
  selectedPlatforms: PlatformType[];
  onChange: (platforms: PlatformType[]) => void;
}

const PLATFORMS: {
  id: PlatformType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "FACEBOOK", label: "Facebook", icon: <Share2 className="size-3.5" /> },
  { id: "INSTAGRAM", label: "Instagram", icon: <Globe className="size-3.5" /> },
  { id: "TIKTOK", label: "TikTok", icon: <Video className="size-3.5" /> },
  { id: "THREADS", label: "Threads", icon: <AtSign className="size-3.5" /> },
  {
    id: "YOUTUBE",
    label: "Youtube",
    icon: <MessageSquare className="size-3.5" />,
  },
];

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatforms,
  onChange,
}) => {
  const { t } = useTranslation();
  const togglePlatform = (id: PlatformType) => {
    if (selectedPlatforms.includes(id)) {
      onChange(selectedPlatforms.filter((p) => p !== id));
    } else {
      onChange([...selectedPlatforms, id]);
    }
  };

  const selectAll = () => {
    if (selectedPlatforms.length === PLATFORMS.length) {
      onChange([]);
    } else {
      onChange(PLATFORMS.map((p) => p.id));
    }
  };

  return (
    <div className="border-border bg-muted flex flex-wrap items-center gap-2 rounded-xl border p-2">
      <span className="text-muted-foreground px-2 text-xs font-semibold tracking-wider uppercase">
        {t("calendar.platformFilter.label")}
      </span>
      <button
        type="button"
        onClick={selectAll}
        className="border-border text-foreground hover:bg-accent rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
      >
        {selectedPlatforms.length === PLATFORMS.length
          ? t("calendar.platformFilter.deselectAll")
          : t("calendar.platformFilter.selectAll")}
      </button>
      <div className="bg-border mx-1 h-4 w-px" />
      {PLATFORMS.map((p) => {
        const isSelected = selectedPlatforms.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => togglePlatform(p.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isSelected
                ? "border-brand-orange bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/20 shadow-xs"
                : "border-transparent opacity-40 grayscale hover:opacity-70"
            }`}
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
