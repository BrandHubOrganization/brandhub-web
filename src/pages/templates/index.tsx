import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { TemplatePreviewModal } from "@/pages/templates/components/TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useTemplates } from "./hooks/useTemplates";
import { TemplateGridView } from "./components/TemplateGridView";
import { useTranslation } from "react-i18next";

export function TemplateBrowserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    templates,
    total,
    totalPages,
    isLoading,
    selectedTemplate,
    isPreviewOpen,
    setIsPreviewOpen,
    handleOpenPreview,
    handleDeleteTemplate,
  } = useTemplates();

  return (
    <PageWrapper
      title={t("templates.page.title")}
      description={t("templates.page.description")}
      actions={
        <Button
          type="button"
          onClick={() => navigate("/editor")}
          className="bg-brand-orange hover:bg-brand-orange/90 text-xs font-semibold text-white"
          size="sm"
        >
          <Plus className="mr-1 size-4" />
          <span>{t("templates.page.createButton")}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="border-border bg-card flex flex-col items-center justify-between gap-4 rounded-xl border p-4 shadow-xs sm:flex-row">
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="size-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("templates.page.searchPlaceholder")}
              className="text-xs"
            />
          </div>

          <div className="text-muted-foreground self-end text-xs font-medium sm:self-center">
            {t("templates.page.showing", {
              count: templates.length,
              total,
            })}
          </div>
        </div>

        <TemplateGridView
          templates={templates}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onOpenEditor={() => navigate("/editor")}
          onPreview={handleOpenPreview}
          onDelete={handleDeleteTemplate}
          onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
          onNextPage={() => setPage((p) => p + 1)}
        />
      </div>

      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        template={selectedTemplate}
        onClose={() => setIsPreviewOpen(false)}
      />
    </PageWrapper>
  );
}

export default TemplateBrowserPage;
