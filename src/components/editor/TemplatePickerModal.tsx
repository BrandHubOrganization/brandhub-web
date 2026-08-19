import React, { useEffect, useState } from "react";
import {
  LayoutTemplate,
  Search,
  Check,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { mockTemplateService } from "@/services/mockTemplateService";
import type { ContentTemplate } from "@/types/template";
import { toast } from "sonner";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContentTemplate) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      mockTemplateService
        .getTemplates({ search, page: 0, size: 20 })
        .then((res) => setTemplates(res.items))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleApply = (tpl: ContentTemplate) => {
    onSelectTemplate(tpl);
    toast.success(`Đã áp dụng mẫu bài đăng "${tpl.title}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="animate-in fade-in zoom-in-95 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl duration-200 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Thư viện Mẫu bài đăng (Post Templates)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Chọn mẫu nội dung có sẵn để áp dụng nhanh vào Editor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 text-lg leading-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm mẫu theo tiêu đề hoặc nội dung..."
              className="focus:border-brand-orange focus:ring-brand-orange/20 w-full rounded-xl border border-zinc-200 bg-white py-2 pr-4 pl-9 text-xs text-zinc-900 focus:ring-2 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Template Grid Body */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-2 py-12 text-center text-xs text-zinc-400">
              Đang tải danh sách mẫu bài đăng...
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-zinc-400">
              Không tìm thấy mẫu phù hợp
            </div>
          ) : (
            templates.map((tpl) => (
              <div
                key={tpl.id}
                className="hover:border-brand-orange/50 group flex flex-col justify-between space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs transition-all dark:border-zinc-700/80 dark:bg-zinc-800/60"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="group-hover:text-brand-orange line-clamp-1 text-xs font-semibold text-zinc-900 transition-colors dark:text-zinc-100">
                      {tpl.title}
                    </h4>
                    <span className="bg-brand-orange-soft text-brand-orange shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                      Template
                    </span>
                  </div>

                  <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {tpl.caption}
                  </p>
                </div>

                {/* Hashtags & Action */}
                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-700/60">
                  <div className="flex max-h-6 flex-wrap gap-1 overflow-hidden">
                    {tpl.hashtags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(tpl)}
                    className="bg-brand-orange hover:bg-brand-orange/90 flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Áp dụng</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
