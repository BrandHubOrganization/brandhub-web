import React from "react";
import type { PlatformType } from "@/types/calendar";
import { Video, AtSign, Share2, Globe, MessageSquare } from "lucide-react";

interface PlatformFilterProps {
  selectedPlatforms: PlatformType[];
  onChange: (platforms: PlatformType[]) => void;
}

const PLATFORMS: {
  id: PlatformType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "FACEBOOK",
    label: "Facebook",
    icon: <Share2 className="h-4 w-4 text-blue-600" />,
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    icon: <Globe className="h-4 w-4 text-pink-600" />,
    color: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    icon: <Video className="h-4 w-4 text-slate-900 dark:text-slate-100" />,
    color:
      "border-slate-500/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  },
  {
    id: "THREADS",
    label: "Threads",
    icon: <AtSign className="h-4 w-4 text-purple-600" />,
    color:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  {
    id: "YOUTUBE",
    label: "Youtube",
    icon: <MessageSquare className="h-4 w-4 text-red-600" />,
    color: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
];

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatforms,
  onChange,
}) => {
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
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
      <span className="px-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        Platforms:
      </span>
      <button
        type="button"
        onClick={selectAll}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        {selectedPlatforms.length === PLATFORMS.length
          ? "Deselect All"
          : "Select All"}
      </button>
      <div className="mx-1 h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
      {PLATFORMS.map((p) => {
        const isSelected = selectedPlatforms.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => togglePlatform(p.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isSelected
                ? `${p.color} border-current shadow-xs`
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
