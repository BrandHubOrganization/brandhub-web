import React, { useEffect, useState } from 'react';
import type { PostTemplate, HashtagGroup } from '@/types/contentLibrary';
import { mockContentLibraryService } from '@/services/mockContentLibraryService';
import { FileText, ArrowRight, Plus, Trash2, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export const TemplatesTab: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedHgId, setSelectedHgId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplData, hgData] = await Promise.all([
        mockContentLibraryService.getTemplates(),
        mockContentLibraryService.getHashtagGroups(),
      ]);
      setTemplates(tplData);
      setHashtagGroups(hgData);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách Post Templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUseTemplate = (tpl: PostTemplate) => {
    const fullCaption = tpl.hashtagGroup
      ? `${tpl.caption}\n\n${tpl.hashtagGroup.tags.join(' ')}`
      : tpl.caption;

    // Navigate to /editor passing pre-fill state
    navigate('/editor', {
      state: {
        prefilledCaption: fullCaption,
        templateTitle: tpl.title,
      },
    });

    toast.success(`Đã áp dụng template "${tpl.title}" vào Content Editor!`);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) {
      toast.error('Vui lòng điền tiêu đề và nội dung caption mẫu');
      return;
    }

    setIsSaving(true);
    try {
      const created = await mockContentLibraryService.createTemplate(title, caption, selectedHgId || undefined);
      setTemplates((prev) => [created, ...prev]);
      toast.success('Tạo Mẫu Bài Viết mới thành công!');
      setIsModalOpen(false);
      setTitle('');
      setCaption('');
      setSelectedHgId('');
    } catch (err) {
      toast.error('Lỗi khi tạo Mẫu Bài Viết');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa template "${title}"?`)) {
      try {
        await mockContentLibraryService.deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success('Đã xóa mẫu bài viết');
      } catch (err) {
        toast.error('Lỗi khi xóa template');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-orange" />
            Mẫu Bài Viết Đã Duyệt ({templates.length})
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Các bài viết chuẩn hóa kèm nhóm hashtag sẵn sàng để sử dụng ngay
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Template Mới</span>
        </button>
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Đang tải danh sách template...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Chưa có template bài viết nào. Nhấn "Tạo Template Mới" để thêm mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-brand-orange/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 group-hover:text-brand-orange transition-colors">
                    {tpl.title}
                  </h4>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="p-1 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption Snippet */}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  {tpl.caption}
                </p>

                {/* Attached Hashtag Group */}
                {tpl.hashtagGroup && (
                  <div className="mb-4">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Nhóm Hashtag Đính Kèm:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tpl.hashtagGroup.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-brand-orange-soft text-brand-orange"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </span>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Tạo Mẫu Bài Viết Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tiêu đề Template
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Khuyến Mãi Mùa Hè"
                  className="rounded-xl border-zinc-200 bg-zinc-50 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nội dung Caption mẫu
                </label>
                <Textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Nhập nội dung mẫu bài đăng tại đây..."
                  className="rounded-xl border-zinc-200 bg-zinc-50 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Gắn Nhóm Hashtag (Tùy chọn)
                </label>
                <Select
                  value={selectedHgId}
                  onChange={(e) => setSelectedHgId(e.target.value)}
                  className="rounded-xl border-zinc-200 bg-zinc-50 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">-- Không đính kèm --</option>
                  {hashtagGroups.map((hg) => (
                    <option key={hg.id} value={hg.id}>
                      {hg.name} ({hg.tags.length} tags)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Đang tạo...' : 'Tạo Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
