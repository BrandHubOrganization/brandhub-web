import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { TemplateCard } from '@/components/template/TemplateCard';
import { TemplatePreviewModal } from '@/components/template/TemplatePreviewModal';
import { mockTemplateService } from '@/services/mockTemplateService';
import type { ContentTemplate } from '@/types/template';
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
        <button
          type="button"
          onClick={() => navigate('/editor')}
          className="px-4 py-2 bg-[#f05a28] hover:bg-[#f05a28]/90 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Bài Viết Mới</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top Control Bar: Search & Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          {/* Search Bar with 300ms Debounce */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mẫu theo tiêu đề, nội dung..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
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
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Đi đến Content Editor</span>
            </button>
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
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
