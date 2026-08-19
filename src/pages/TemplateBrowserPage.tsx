import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { TemplateCard } from '@/components/template/TemplateCard';
import { TemplatePreviewModal } from '@/components/template/TemplatePreviewModal';
import { mockTemplateService } from '@/services/mockTemplateService';
import type { ContentTemplate } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutTemplate, ChevronLeft, ChevronRight, Loader2, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function TemplateBrowserPage() {
  const navigate = useNavigate();

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  // Data States
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Preview Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Debounce 300ms for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to page 0 on search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch templates from mock service
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
      toast.error('Lỗi khi tải danh sách mẫu bài viết');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle Preview
  const handleOpenPreview = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  // Handle Delete
  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa template "${title}"?`)) {
      try {
        await mockTemplateService.deleteTemplate(id);
        toast.success(`Đã xóa template "${title}"`);
        fetchTemplates();
      } catch (err) {
        toast.error('Lỗi khi xóa template');
      }
    }
  };

  return (
    <PageWrapper
      title="Thư Viện Mẫu Bài Viết (Templates)"
      description="Quản lý và tái sử dụng các mẫu bài đăng chuyên nghiệp chỉ với 1 click."
      actions={
        <Button
          type="button"
          onClick={() => navigate('/editor')}
          className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white font-semibold text-xs"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Tạo Bài Viết Mới</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Control Bar: Search & Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          {/* Search Bar with UI Input (300ms Debounce) */}
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mẫu theo tiêu đề, nội dung..."
              className="text-xs"
            />
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium self-end sm:self-center">
            Hiển thị <strong className="text-zinc-900 dark:text-zinc-100">{templates.length}</strong> / {total} mẫu bài đăng
          </div>
        </div>

        {/* Main Grid View */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Đang tải thư viện mẫu bài viết...</p>
          </div>
        ) : templates.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileQuestion className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Chưa Có Mẫu Bài Viết Nào
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No templates yet. Save a draft from the Content Editor to see it here.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => navigate('/editor')}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-xs cursor-pointer"
              size="sm"
            >
              <LayoutTemplate className="w-4 h-4 mr-1" />
              <span>Đi đến Content Editor</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onPreview={handleOpenPreview}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        template={selectedTemplate}
        onClose={() => setIsPreviewOpen(false)}
      />
    </PageWrapper>
  );
}

export default TemplateBrowserPage;
