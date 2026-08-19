import React from "react";
import type { ContentTemplate, SocialPlatform } from "@/types/template";
import { Calendar, Eye, Trash2 } from "lucide-react";

interface TemplateCardProps {
  template: ContentTemplate;
  onPreview: (template: ContentTemplate) => void;
  onDelete: (id: string, title: string) => void;
}

const PLATFORM_COLOR_MAP: Record<
  SocialPlatform,
  { bg: string; text: string; label: string }
> = {
  FACEBOOK: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-600 dark:text-blue-400",
    label: "FB",
  },
  INSTAGRAM: {
    bg: "bg-pink-100 dark:bg-pink-950",
    text: "text-pink-600 dark:text-pink-400",
    label: "IG",
  },
  TIKTOK: {
    bg: "bg-zinc-900 dark:bg-zinc-800",
    text: "text-white",
    label: "TT",
  },
  THREADS: {
    bg: "bg-zinc-800 dark:bg-zinc-700",
    text: "text-white",
    label: "TH",
  },
  YOUTUBE: {
    bg: "bg-red-100 dark:bg-red-950",
    text: "text-red-600 dark:text-red-400",
    label: "YT",
  },
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onDelete,
}) => {
  // Truncate caption to first 100 chars
  const snippet =
    template.caption.length > 100
      ? template.caption.slice(0, 100) + "..."
      : template.caption;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => onPreview(template)}
      className="bg-card border-border/80 hover:border-brand-orange/40 group flex cursor-pointer flex-col justify-between rounded-xl border p-5 shadow-xs transition-all hover:shadow-md"
    >
      <div>
        {/* Header Title & Delete Button */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-foreground group-hover:text-brand-orange line-clamp-1 text-sm font-semibold transition-colors">
            {template.title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id, template.title);
            }}
            className="shrink-0 cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            title="Xóa template"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Caption Snippet (100 chars) */}
        <p className="bg-muted/40 mb-4 line-clamp-3 rounded-xl border border-zinc-100 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {snippet}
        </p>

        {/* Target Platform Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {template.targetPlatforms.map((p) => {
            const pInfo = PLATFORM_COLOR_MAP[p] || {
              bg: "bg-zinc-100",
              text: "text-zinc-700",
              label: p,
            };
            return (
              <span
                key={p}
                className={`rounded-md px-2 py-0.5 font-mono text-3xs font-bold ${pInfo.bg} ${pInfo.text}`}
              >
                {pInfo.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
        <span className="flex items-center gap-1 text-2xs text-zinc-400">
          <Calendar className="size-3" />
          Dùng gần nhất: {formatDate(template.lastUsedAt)}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="bg-brand-orange-soft hover:bg-brand-orange text-brand-orange flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold transition-colors hover:text-white"
        >
          <Eye className="size-3.5" />
          <span>Xem trước</span>
        </button>
      </div>
    </div>
  );
};
