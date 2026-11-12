import React from "react";
import type { PlatformType } from "@/types/calendar";
import { FaFacebook, FaInstagram, FaTiktok, FaThreads } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface PlatformFilterProps {
  selectedPlatforms: PlatformType[];
  onChange: (platforms: PlatformType[]) => void;
}

const PLATFORMS: {
  id: PlatformType;
  label: string;
  icon: React.ReactNode;
  selectedClass: string;
}[] = [
  {
    id: "FACEBOOK",
    label: "Facebook",
    icon: <FaFacebook className="size-3.5 text-[#1877F2]" />,
    selectedClass:
      "border-[#1877F2]/50 bg-[#1877F2]/10 text-[#1877F2] dark:border-[#1877F2]/60 dark:bg-[#1877F2]/25 dark:text-[#1877F2] shadow-xs",
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    icon: <FaInstagram className="size-3.5 text-[#E1306C]" />,
    selectedClass:
      "border-[#E1306C]/50 bg-[#E1306C]/10 text-[#E1306C] dark:border-[#E1306C]/60 dark:bg-[#E1306C]/25 dark:text-[#E1306C] shadow-xs",
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    icon: <FaTiktok className="size-3.5 text-neutral-900 dark:text-white" />,
    selectedClass:
      "border-neutral-800 bg-neutral-900/10 text-neutral-900 dark:border-white/40 dark:bg-white/15 dark:text-white shadow-xs",
  },
  {
    id: "THREADS",
    label: "Threads",
    icon: <FaThreads className="size-3.5 text-neutral-900 dark:text-white" />,
    selectedClass:
      "border-neutral-800 bg-neutral-900/10 text-neutral-900 dark:border-white/40 dark:bg-white/15 dark:text-white shadow-xs",
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
                ? p.selectedClass
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
