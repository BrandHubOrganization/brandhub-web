import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import type {
  BlogCategory,
  BlogCategorySlug,
  BlogPostSummary,
  PlannedBlogTopic,
} from "@/data/blogTypes";
import { getBlogPostSummaryBySlug } from "@/data/blogLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BlogSpotlightContainer } from "./BlogMotion";

interface BlogRoadmapTableProps {
  catalog: PlannedBlogTopic[];
  getCategoryMeta: (slug: BlogCategorySlug) => BlogCategory | undefined;
  selectedBatch: string;
  onBatchChange: (batch: string) => void;
  publishedCount: number;
}

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

interface EnrichedTopic {
  topic: PlannedBlogTopic;
  summary: BlogPostSummary | undefined;
  categoryMeta: BlogCategory | undefined;
}

export function BlogRoadmapTable({
  catalog,
  getCategoryMeta,
  selectedBatch,
  onBatchChange,
  publishedCount,
}: BlogRoadmapTableProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [roadmapQuery, setRoadmapQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [previewEntry, setPreviewEntry] = useState<EnrichedTopic | null>(null);

  const filteredCatalog = useMemo(() => {
    let items = catalog;
    if (selectedBatch === "published") {
      items = items.filter((item) => item.isPublished);
    } else if (selectedBatch !== "all") {
      items = items.filter((item) => item.priorityBatch === selectedBatch);
    }
    const q = roadmapQuery.trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const summary = getBlogPostSummaryBySlug(item.slug);
        return (
          item.title.toLowerCase().includes(q) ||
          item.primaryKeyword.toLowerCase().includes(q) ||
          item.brandhubFeature.toLowerCase().includes(q) ||
          String(item.topicNumber).includes(q) ||
          (summary?.metaDescription.toLowerCase().includes(q) ?? false) ||
          item.targetRoles.some((r) => r.toLowerCase().includes(q))
        );
      });
    }
    return items;
  }, [catalog, selectedBatch, roadmapQuery]);

  const visibleItems = useMemo(
    () => filteredCatalog.slice(0, visibleCount),
    [filteredCatalog, visibleCount],
  );
  const hasMore = visibleCount < filteredCatalog.length;

  const handleBatchSelect = (batchId: string) => {
    onBatchChange(batchId);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleQueryChange = (val: string) => {
    setRoadmapQuery(val);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <section
      id="danh-muc-100-chu-de"
      aria-labelledby="roadmap-heading"
      className="space-y-6 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-6 md:flex-row md:items-end dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Sparkles className="size-3.5 text-brand-orange" />
              Danh mục Tri thức 100 Chủ đề
            </span>
            <span className="tabular-nums inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              {publishedCount} / 100 bài đã phát hành
            </span>
          </div>

          <h2
            id="roadmap-heading"
            className="text-balance text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
          >
            Danh mục 100 Chủ đề Chuyên sâu Dành cho Agency &amp; Doanh Nghiệp
          </h2>
          <p className="max-w-3xl text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
            Mỗi chủ đề đều đi kèm ảnh minh họa, tóm tắt chuyên sâu, vai trò áp
            dụng và nút{" "}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
              Xem nhanh (Quick Preview)
            </strong>{" "}
            để bạn nắm trọn ý chính trước khi đọc toàn bài.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-xl border border-zinc-200/90 bg-zinc-50 p-1 md:self-auto dark:border-zinc-800 dark:bg-zinc-950/60">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              viewMode === "cards"
                ? "bg-white text-brand-orange shadow-2xs dark:bg-zinc-800 dark:text-orange-300"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            <LayoutGrid className="size-3.5" />
            <span>Dạng Thẻ Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              viewMode === "table"
                ? "bg-white text-brand-orange shadow-2xs dark:bg-zinc-800 dark:text-orange-300"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            <List className="size-3.5" />
            <span>Dạng Bảng</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Batch Filters */}
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={roadmapQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Lọc nhanh 100 chủ đề theo số thứ tự, từ khóa hoặc tính năng..."
            aria-label="Lọc danh mục 100 chủ đề"
            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/70 pl-10 text-xs sm:text-sm focus-visible:ring-brand-orange dark:border-zinc-700 dark:bg-zinc-950/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `Tất cả (${catalog.length})` },
            { id: "Batch 1", label: "Đợt 1 (Ưu tiên)" },
            { id: "Batch 2", label: "Đợt 2" },
            { id: "Batch 3", label: "Đợt 3" },
            { id: "Batch 4", label: "Đợt 4" },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBatchSelect(b.id)}
              className={cn(
                "tabular-nums cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                selectedBatch === b.id
                  ? "border-brand-orange bg-brand-orange text-white shadow-2xs"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-brand-orange/40 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:text-zinc-100",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="tabular-nums">
          Đang hiển thị{" "}
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
            {visibleItems.length}
          </strong>{" "}
          / {filteredCatalog.length} chủ đề
          {selectedBatch !== "all" && ` (${selectedBatch})`}
          {roadmapQuery && ` khớp "${roadmapQuery}"`}
        </span>
        {visibleItems.length < filteredCatalog.length && (
          <button
            type="button"
            onClick={() => setVisibleCount(filteredCatalog.length)}
            className="cursor-pointer font-semibold text-brand-orange hover:underline"
          >
            Xem toàn bộ {filteredCatalog.length} chủ đề &rarr;
          </button>
        )}
      </div>

      {/* Content Area */}
      {filteredCatalog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-10 text-center space-y-3 dark:border-zinc-700 dark:bg-zinc-950/40">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Không có chủ đề nào khớp với bộ lọc hiện tại.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRoadmapQuery("");
              handleBatchSelect("all");
            }}
            className="cursor-pointer rounded-xl text-xs font-semibold"
          >
            Hiển thị lại 100 chủ đề
          </Button>
        </div>
      ) : viewMode === "cards" ? (
        <BlogSpotlightContainer className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            const summary = getBlogPostSummaryBySlug(item.slug);

            return (
              <article
                key={item.topicNumber}
                className="bh-spotlight-card group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Clean 16:9 Cover Thumbnail Preview (zero overlays) */}
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                  {summary?.coverImage ? (
                    <img
                      src={summary.coverImage}
                      alt={summary.coverImageAlt || item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-brand-orange dark:bg-zinc-800">
                      <Sparkles className="size-8 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="relative z-10 flex flex-1 flex-col justify-between space-y-3.5 p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums font-mono font-bold text-brand-orange">
                          #{String(item.topicNumber).padStart(3, "0")}
                        </span>
                        {catMeta && (
                          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {catMeta.shortName}
                          </span>
                        )}
                      </div>
                      {summary && (
                        <span className="tabular-nums inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <Clock className="size-3 text-brand-orange/80" />
                          {summary.readingTimeMinutes} phút
                        </span>
                      )}
                    </div>

                    <h3 className="text-balance line-clamp-2 text-sm font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange dark:text-zinc-100">
                      <Link to={`/blog/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <p className="text-pretty line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {summary?.metaDescription ?? catMeta?.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 border-t border-zinc-200/70 pt-3 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="inline-flex min-w-0 items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Tag className="size-3 shrink-0 text-brand-orange" />
                        <span className="truncate font-medium">
                          {item.brandhubFeature}
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.targetRoles.slice(0, 3).map((role) => (
                          <span
                            key={role}
                            className="rounded bg-zinc-200/65 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {summary ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewEntry({
                              topic: item,
                              summary,
                              categoryMeta: catMeta,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-zinc-700 transition-colors hover:text-brand-orange dark:text-zinc-300"
                        >
                          <Eye className="size-3.5" />
                          <span>Tóm tắt nhanh</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      <Link
                        to={`/blog/${item.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline"
                      >
                        <span>Đọc bài</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </BlogSpotlightContainer>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/85 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-[11px] font-bold tracking-wide text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <th className="w-16 px-4 py-3.5">#</th>
                  <th className="min-w-[320px] px-4 py-3.5">
                    Chủ đề &amp; Preview nội dung
                  </th>
                  <th className="min-w-[160px] px-4 py-3.5">Trụ cột</th>
                  <th className="min-w-[140px] px-4 py-3.5">Vai trò</th>
                  <th className="min-w-[160px] px-4 py-3.5">
                    Tính năng BrandHub
                  </th>
                  <th className="w-40 px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {visibleItems.map((item) => {
                  const catMeta = getCategoryMeta(item.category);
                  const summary = getBlogPostSummaryBySlug(item.slug);
                  return (
                    <tr
                      key={item.topicNumber}
                      className="group transition-colors hover:bg-orange-50/35 dark:hover:bg-zinc-800/40"
                    >
                      <td className="tabular-nums px-4 py-3.5 font-mono font-bold text-brand-orange">
                        #{String(item.topicNumber).padStart(3, "0")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {summary?.coverImage && (
                            <img
                              src={summary.coverImage}
                              alt=""
                              loading="lazy"
                              className="hidden h-12 w-20 shrink-0 rounded-lg border border-zinc-200/80 object-cover sm:block dark:border-zinc-700"
                            />
                          )}
                          <div className="min-w-0 space-y-1">
                            <Link
                              to={`/blog/${item.slug}`}
                              className="line-clamp-1 font-bold text-zinc-900 transition-colors hover:text-brand-orange dark:text-zinc-100"
                            >
                              {item.title}
                            </Link>
                            <p className="line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {summary?.metaDescription ?? item.primaryKeyword}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {catMeta && (
                          <span
                            className={cn(
                              "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              catMeta.badgeColor,
                            )}
                          >
                            {catMeta.shortName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {item.targetRoles.map((r) => (
                            <span
                              key={r}
                              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-zinc-600 dark:text-zinc-400">
                        {item.brandhubFeature}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {summary && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewEntry({
                                  topic: item,
                                  summary,
                                  categoryMeta: catMeta,
                                })
                              }
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 transition-colors hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            >
                              <Eye className="size-3" />
                              Xem nhanh
                            </button>
                          )}
                          <Link
                            to={`/blog/${item.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-orange/10 px-2.5 py-1 text-[11px] font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
                          >
                            Đọc bài
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Buttons */}
      {hasMore && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount((prev) =>
                Math.min(prev + LOAD_MORE_STEP, filteredCatalog.length),
              )
            }
            className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-5 text-xs font-semibold text-zinc-800 hover:border-brand-orange/45 hover:bg-orange-50/40 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <ChevronDown className="mr-1.5 size-4 text-brand-orange" />
            <span>
              Xem thêm{" "}
              {Math.min(
                LOAD_MORE_STEP,
                filteredCatalog.length - visibleCount,
              )}{" "}
              chủ đề
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setVisibleCount(filteredCatalog.length)}
            className="h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-zinc-500 hover:text-brand-orange"
          >
            Mở toàn bộ {filteredCatalog.length} chủ đề
          </Button>
        </div>
      )}

      {/* Interactive Quick Preview Modal */}
      <Dialog
        open={Boolean(previewEntry)}
        onOpenChange={(open) => {
          if (!open) setPreviewEntry(null);
        }}
      >
        {previewEntry && (
          <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-2xl border-zinc-200 bg-white p-0 sm:max-w-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Preview Cover Header */}
            {previewEntry.summary?.coverImage && (
              <div className="aspect-[16/9] w-full overflow-hidden border-b border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                <img
                  src={previewEntry.summary.coverImage}
                  alt={
                    previewEntry.summary.coverImageAlt ||
                    previewEntry.topic.title
                  }
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-5 p-6">
              <DialogHeader className="space-y-2.5 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-brand-orange dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
                    Chủ đề #{String(previewEntry.topic.topicNumber).padStart(3, "0")}
                  </span>
                  {previewEntry.categoryMeta && (
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {previewEntry.categoryMeta.shortName}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {previewEntry.summary && (
                    <>
                      <span className="tabular-nums inline-flex items-center gap-1">
                        <Calendar className="size-3.5 text-brand-orange" />
                        {previewEntry.summary.publishedAt}
                      </span>
                      <span className="tabular-nums inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-brand-orange" />
                        {previewEntry.summary.readingTimeMinutes} phút đọc
                      </span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <Users className="size-3.5 text-brand-orange" />
                    {previewEntry.topic.targetRoles.join(" · ")}
                  </span>
                </div>

                <DialogTitle className="text-balance text-lg font-extrabold leading-snug text-zinc-900 sm:text-xl dark:text-zinc-50">
                  {previewEntry.topic.title}
                </DialogTitle>
                <DialogDescription className="text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
                  {previewEntry.summary?.metaDescription}
                </DialogDescription>
              </DialogHeader>

              {/* Direct GEO Answer Preview */}
              {previewEntry.summary?.geoSummary && (
                <div className="space-y-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                    <Sparkles className="size-3.5" />
                    Tóm tắt trọng tâm bài viết
                  </p>
                  <p className="text-pretty text-xs leading-relaxed text-zinc-700 sm:text-[13px] dark:text-zinc-200">
                    {previewEntry.summary.geoSummary}
                  </p>
                </div>
              )}

              {/* Key Takeaways Preview */}
              {previewEntry.summary?.keyTakeaways &&
                previewEntry.summary.keyTakeaways.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
                      Nội dung chính bạn sẽ nhận được
                    </p>
                    <ul className="space-y-2">
                      {previewEntry.summary.keyTakeaways.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-600 sm:text-[13px] dark:text-zinc-300"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <DialogFooter className="flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Tag className="size-3.5 text-brand-orange" />
                  <span className="font-medium">
                    {previewEntry.topic.brandhubFeature}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={previewEntry.topic.ctaTarget}
                    onClick={() => setPreviewEntry(null)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer rounded-xl text-xs font-semibold"
                    >
                      Mở tính năng hệ thống
                    </Button>
                  </Link>
                  <Link
                    to={`/blog/${previewEntry.topic.slug}`}
                    onClick={() => setPreviewEntry(null)}
                  >
                    <Button
                      size="sm"
                      className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl text-xs font-semibold text-white"
                    >
                      Đọc trọn vẹn bài viết
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Button>
                  </Link>
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

export default BlogRoadmapTable;
