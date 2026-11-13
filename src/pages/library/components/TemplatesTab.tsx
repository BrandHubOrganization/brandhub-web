import React, { useEffect, useState, useMemo } from "react";
import type { PostTemplate, HashtagGroup } from "@/types/contentLibrary";
import { contentLibraryService } from "@/services/contentLibraryService";
import { FileText, ArrowRight, Plus, Trash2, Calendar, X, Search, Copy, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SelectMenu } from "@/components/ui/select-menu";
import { Pagination } from "@/components/ui/pagination";
import { useWorkspaceStore } from "@/store/workspaceStore";

const CATEGORIES = [
  "Tất cả",
  "Ra mắt",
  "Khuyến mãi",
  "Case Study",
  "Thương hiệu",
  "Tương tác",
  "Tuyển dụng",
  "Kiến thức",
];

export const TemplatesTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
        contentLibraryService.getTemplates(),
        contentLibraryService.getHashtagGroups(),
      ]);
      setTemplates(tplData);
      setHashtagGroups(hgData);
    } catch {
      toast.error(t("library.templates.loadError"));
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
    if (currentWorkspace) {
      navigate(`/workspaces/${currentWorkspace.id}/editor`, {
        state: {
          prefilledCaption: fullCaption,
          templateTitle: tpl.title,
        },
      });
    }

    toast.success(t("library.templates.useSuccess", { title: tpl.title }));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) {
      toast.error(t("library.templates.validationError"));
      return;
    }

    setIsSaving(true);
    try {
      const created = await contentLibraryService.createTemplate(
        title,
        caption,
        selectedHgId || undefined,
      );
      setTemplates((prev) => [created, ...prev]);
      toast.success(t("library.templates.createSuccess"));
      setIsModalOpen(false);
      setTitle("");
      setCaption("");
      setSelectedHgId("");
    } catch {
      toast.error(t("library.templates.createError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(t("library.templates.deleteConfirm", { title }))) {
      try {
        await contentLibraryService.deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success(t("library.templates.deleteSuccess"));
      } catch {
        toast.error(t("library.templates.deleteError"));
      }
    }
  };

  const handleCopyCaption = (tpl: PostTemplate) => {
    const fullCaption = tpl.hashtagGroup
      ? `${tpl.caption}\n\n${tpl.hashtagGroup.tags.join(" ")}`
      : tpl.caption;
    navigator.clipboard.writeText(fullCaption);
    toast.success("Đã sao chép nội dung bài mẫu vào bộ nhớ tạm!");
  };

  const sortedTemplates = useMemo(() => {
    const filtered = templates.filter((tpl) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.caption.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || tpl.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.title.localeCompare(b.title, "vi");
        case "name_desc":
          return b.title.localeCompare(a.title, "vi");
        case "oldest": {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        }
        case "newest":
        default: {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
      }
    });
  }, [templates, searchQuery, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedTemplates.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedTemplates = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedTemplates.slice(start, start + pageSize);
  }, [sortedTemplates, safePage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== "Tất cả" || sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tất cả");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filters */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative min-w-48 flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm mẫu bài đăng theo tiêu đề, nội dung..."
                className="border-border bg-muted/40 text-foreground placeholder-muted-foreground rounded-[4px] pr-4 pl-9 text-xs"
              />
            </div>
            <SelectMenu
              ariaLabel="Sắp xếp bài mẫu"
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
              className="h-8.5 min-w-36 text-xs"
              options={[
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
                { value: "name_asc", label: "Tiêu đề A → Z" },
                { value: "name_desc", label: "Tiêu đề Z → A" },
              ]}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer text-xs"
              >
                <RotateCcw className="size-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <Plus className="size-4" />
            <span>{t("library.templates.createNewButton")}</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="border-[#eaeded] dark:border-border flex flex-wrap items-center gap-1.5 border-t pt-3">
          <span className="text-muted-foreground mr-1 text-xs font-medium">Chủ đề:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`cursor-pointer rounded-[4px] border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedCategory === cat
                  ? "border-brand-orange bg-brand-orange text-white font-semibold"
                  : "border-border bg-background text-foreground hover:bg-muted/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="text-muted-foreground py-12 text-center text-xs">
          {t("library.templates.loading")}
        </div>
      ) : sortedTemplates.length === 0 ? (
        <div className="border-[#d5dbdb] dark:border-border bg-card rounded-none border border-dashed p-8 py-12 text-center">
          <FileText className="text-muted-foreground mx-auto mb-2 size-10" />
          <p className="text-muted-foreground text-xs">
            Không tìm thấy mẫu bài đăng nào phù hợp với bộ lọc.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-brand-orange hover:underline text-xs mt-3 inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="size-3" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="hover:border-brand-orange/60 group border-[#d5dbdb] dark:border-border bg-card flex flex-col justify-between rounded-none border p-5 shadow-[0_1px_1px_0_rgba(0,28,36,0.04)] transition-colors"
              >
              <div>
                {/* Card Top: Category and Platforms */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tpl.category && (
                      <span className="bg-brand-orange/10 text-brand-orange rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {tpl.category}
                      </span>
                    )}
                    {tpl.platforms && tpl.platforms.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                        {tpl.platforms.map((p) => (
                          <span key={p} className="bg-muted rounded-md px-1.5 py-0.2 capitalize">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="text-muted-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    title="Xóa mẫu"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h4 className="group-hover:text-brand-orange text-foreground mb-2 flex items-center gap-1.5 text-sm font-semibold transition-colors">
                  {tpl.title}
                </h4>

                {/* Caption Snippet */}
                <p className="mb-4 line-clamp-4 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed font-normal text-muted-foreground whitespace-pre-line">
                  {tpl.caption}
                </p>

                {/* Attached Hashtag Group */}
                {tpl.hashtagGroup && (
                  <div className="mb-4">
                    <span className="text-3xs text-muted-foreground mb-1 block font-semibold tracking-wider uppercase">
                      {t("library.templates.attachedHashtagsLabel")} ({tpl.hashtagGroup.name})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tpl.hashtagGroup.tags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-brand-orange-soft text-brand-orange text-3xs rounded-[3px] px-2 py-0.5 font-mono font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                      {tpl.hashtagGroup.tags.length > 5 && (
                        <span className="text-3xs text-muted-foreground self-center font-mono">
                          +{tpl.hashtagGroup.tags.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-[#eaeded] dark:border-border flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(tpl.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <button
                    onClick={() => handleCopyCaption(tpl)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition-colors"
                    title="Sao chép toàn bộ nội dung"
                  >
                    <Copy className="size-3" />
                    Copy
                  </button>
                </div>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  <span>{t("library.templates.useTemplateButton")}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedTemplates.length > 0 && (
          <Pagination
            page={safePage}
            size={pageSize}
            total={sortedTemplates.length}
            totalPages={totalPages}
            pageSizeOptions={[6, 9, 12, 18]}
            itemLabel="bài mẫu"
            onPageChange={setPage}
            onSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            className="pt-2"
          />
        )}
      </>
    )}

      {/* Modal Create Template */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="border-[#d5dbdb] dark:border-border bg-card w-full max-w-md space-y-4 rounded-none border p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground text-sm font-semibold">
                {t("library.templates.modalTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.titleFieldLabel")}
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("library.templates.titlePlaceholder")}
                  className="border-border bg-muted/40 text-foreground rounded-[4px] text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.captionFieldLabel")}
                </label>
                <Textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("library.templates.captionPlaceholder")}
                  className="border-border bg-muted/40 text-foreground rounded-[4px] text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.hashtagGroupFieldLabel")}
                </label>
                <Select
                  value={selectedHgId}
                  onChange={(e) => setSelectedHgId(e.target.value)}
                  className="border-border bg-muted/40 text-foreground rounded-[4px] text-xs"
                >
                  <option value="">
                    {t("library.templates.hashtagGroupNone")}
                  </option>
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
                  className="border-border text-muted-foreground cursor-pointer rounded-[4px] border px-4 py-2 text-xs font-medium"
                >
                  {t("library.templates.cancelButton")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-[4px] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSaving
                    ? t("library.templates.creating")
                    : t("library.templates.createButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
