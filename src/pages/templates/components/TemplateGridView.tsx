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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 py-20">
        <Loader2 className="text-brand-orange size-8 animate-spin" />
        <p className="text-xs font-medium">{t("templates.grid.loading")}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="border-border bg-card mx-auto my-8 flex max-w-lg flex-col items-center justify-center space-y-4 rounded-xl border p-12 text-center shadow-xs">
        <div className="bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/20 dark:text-brand-orange/80 rounded-xl p-4">
          <FileQuestion className="size-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-foreground text-base font-bold">
            {t("templates.grid.emptyTitle")}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("templates.grid.emptyDescription")}
          </p>
        </div>
        <Button
          type="button"
          onClick={onOpenEditor}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <LayoutTemplate className="mr-1 size-4" />
          <span>{t("templates.grid.goToEditor")}</span>
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
        <div className="border-border flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-xs">
            {t("templates.grid.pageIndicator", {
              page: page + 1,
              total: totalPages,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={onPrevPage}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={onNextPage}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
