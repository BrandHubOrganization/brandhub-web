import React from 'react';
import type { ContentTemplate, SocialPlatform } from '@/types/template';
import { Calendar, Eye, Trash2 } from 'lucide-react';

interface TemplateCardProps {
  template: ContentTemplate;
  onPreview: (template: ContentTemplate) => void;
  onDelete: (id: string, title: string) => void;
}

const PLATFORM_COLOR_MAP: Record<SocialPlatform, { bg: string; text: string; label: string }> = {
  FACEBOOK: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', label: 'FB' },
  INSTAGRAM: { bg: 'bg-pink-100 dark:bg-pink-950', text: 'text-pink-600 dark:text-pink-400', label: 'IG' },
  TIKTOK: { bg: 'bg-zinc-900 dark:bg-zinc-800', text: 'text-white', label: 'TT' },
  THREADS: { bg: 'bg-zinc-800 dark:bg-zinc-700', text: 'text-white', label: 'TH' },
  YOUTUBE: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', label: 'YT' },
};

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview, onDelete }) => {
  // Truncate caption to first 100 chars
  const snippet =
    template.caption.length > 100
      ? template.caption.slice(0, 100) + '...'
      : template.caption;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={() => onPreview(template)}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Header Title & Delete Button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {template.title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id, template.title);
            }}
            className="p-1 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
            title="Xóa template"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Caption Snippet (100 chars) */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 line-clamp-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
          {snippet}
        </p>

        {/* Target Platform Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {template.targetPlatforms.map((p) => {
            const pInfo = PLATFORM_COLOR_MAP[p] || { bg: 'bg-zinc-100', text: 'text-zinc-700', label: p };
            return (
              <span
                key={p}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${pInfo.bg} ${pInfo.text}`}
              >
                {pInfo.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Dùng gần nhất: {formatDate(template.lastUsedAt)}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem trước</span>
        </button>
      </div>
    </div>
  );
};
