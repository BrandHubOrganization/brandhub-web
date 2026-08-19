import React, { useEffect, useState } from "react";
import type { PostTemplate, HashtagGroup } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mockContentLibraryService";
import { FileText, ArrowRight, Plus, Trash2, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedHgId, setSelectedHgId] = useState("");
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
      toast.error("Lỗi khi tải danh sách Post Templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUseTemplate = (tpl: PostTemplate) => {
    const fullCaption = tpl.hashtagGroup
      ? `${tpl.caption}\n\n${tpl.hashtagGroup.tags.join(" ")}`
      : tpl.caption;

    // Navigate to /editor passing pre-fill state
    navigate("/editor", {
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
      toast.error("Vui lòng điền tiêu đề và nội dung caption mẫu");
      return;
    }

    setIsSaving(true);
    try {
      const created = await mockContentLibraryService.createTemplate(
        title,
        caption,
        selectedHgId || undefined,
      );
      setTemplates((prev) => [created, ...prev]);
      toast.success("Tạo Mẫu Bài Viết mới thành công!");
      setIsModalOpen(false);
      setTitle("");
      setCaption("");
      setSelectedHgId("");
    } catch (err) {
      toast.error("Lỗi khi tạo Mẫu Bài Viết");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa template "${title}"?`)) {
      try {
        await mockContentLibraryService.deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Đã xóa mẫu bài viết");
      } catch (err) {
        toast.error("Lỗi khi xóa template");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="text-brand-orange h-4 w-4" />
            Mẫu Bài Viết Đã Duyệt ({templates.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Các bài viết chuẩn hóa kèm nhóm hashtag sẵn sàng để sử dụng ngay
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Template Mới</span>
        </button>
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400">
          Đang tải danh sách template...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <FileText className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs text-zinc-500">
            Chưa có template bài viết nào. Nhấn "Tạo Template Mới" để thêm mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="hover:border-brand-orange/40 group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="group-hover:text-brand-orange flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors dark:text-zinc-100">
                    {tpl.title}
                  </h4>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Caption Snippet */}
                <p className="mb-4 line-clamp-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                  {tpl.caption}
                </p>

                {/* Attached Hashtag Group */}
                {tpl.hashtagGroup && (
                  <div className="mb-4">
                    <span className="mb-1 block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                      Nhóm Hashtag Đính Kèm:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tpl.hashtagGroup.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-brand-orange-soft text-brand-orange rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(tpl.createdAt).toLocaleDateString("vi-VN")}
                </span>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <span>Use Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-foreground">
                Tạo Mẫu Bài Viết Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                  className="cursor-pointer rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? "Đang tạo..." : "Tạo Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
