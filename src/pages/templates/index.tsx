import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { TemplatePreviewModal } from "@/pages/templates/components/TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useTemplates } from "./hooks/useTemplates";
import { TemplateGridView } from "./components/TemplateGridView";

export function TemplateBrowserPage() {
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
      title="Thư Viện Mẫu Bài Viết (Templates)"
      description="Quản lý và tái sử dụng các mẫu bài đăng chuyên nghiệp chỉ với 1 click."
      actions={
        <Button
          type="button"
          onClick={() => navigate("/editor")}
          className="bg-[#f05a28] text-xs font-semibold text-white hover:bg-[#f05a28]/90"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span>Tạo Bài Viết Mới</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:flex-row dark:border-zinc-800 dark:bg-zinc-900">
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mẫu theo tiêu đề, nội dung..."
              className="text-xs"
            />
          </div>

          <div className="self-end text-xs font-medium text-zinc-500 sm:self-center dark:text-zinc-400">
            Hiển thị{" "}
            <strong className="text-foreground">{templates.length}</strong> /{" "}
            {total} mẫu bài đăng
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
