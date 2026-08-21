import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { mockTemplateService } from "@/services/mockTemplateService";
import type { ContentTemplate } from "@/types/template";

export function useTemplates() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContentTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mockTemplateService.getTemplates({
        search: debouncedSearch,
        page,
        size: 20,
      });
      setTemplates(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(t("templates.toast.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenPreview = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(t("templates.toast.deleteConfirm", { title }))) {
      try {
        await mockTemplateService.deleteTemplate(id);
        toast.success(t("templates.toast.deleteSuccess", { title }));
        fetchTemplates();
      } catch (err) {
        toast.error(t("templates.toast.deleteError"));
      }
    }
  };

  return {
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
  };
}
