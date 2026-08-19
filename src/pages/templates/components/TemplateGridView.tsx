import { TemplateCard } from "@/pages/templates/components/TemplateCard";
import { Button } from "@/components/ui/button";
import {
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileQuestion,
} from "lucide-react";
import type { ContentTemplate } from "@/types/template";

interface Props {
  templates: ContentTemplate[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  onOpenEditor: () => void;
  onPreview: (template: ContentTemplate) => void;
  onDelete: (id: string, title: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function TemplateGridView({
  templates,
  page,
  totalPages,
  isLoading,
  onOpenEditor,
  onPreview,
  onDelete,
  onPrevPage,
  onNextPage,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-20 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        <p className="text-xs font-medium">Đang tải thư viện mẫu bài viết...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="rounded-2xl bg-brand-orange-soft p-4 text-brand-orange dark:bg-brand-orange/20 dark:text-brand-orange/80">
          <FileQuestion className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Chưa Có Mẫu Bài Viết Nào
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            No templates yet. Save a draft from the Content Editor to see it
            here.
          </p>
        </div>
        <Button
          type="button"
          onClick={onOpenEditor}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <LayoutTemplate className="mr-1 h-4 w-4" />
          <span>Đi đến Content Editor</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-xs text-zinc-500">
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={onPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={onNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
