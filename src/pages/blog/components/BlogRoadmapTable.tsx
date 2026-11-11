import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  Filter,
  ArrowRight,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import type { PlannedBlogTopic, BlogCategory } from "@/data/blogTypes";

interface BlogRoadmapTableProps {
  catalog: PlannedBlogTopic[];
  getCategoryMeta: (category: PlannedBlogTopic["category"]) => BlogCategory | undefined;
  selectedBatch: string;
  onBatchChange: (batch: string) => void;
  publishedCount: number;
}

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

export function BlogRoadmapTable({
  catalog,
  getCategoryMeta,
  selectedBatch,
  onBatchChange,
  publishedCount,
}: BlogRoadmapTableProps) {
  // View mode: default to modern cards view
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // Filter catalog by search query inside the roadmap section
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.brandhubFeature.toLowerCase().includes(q) ||
        item.primaryKeyword.toLowerCase().includes(q) ||
        item.targetRoles.some((role) => role.toLowerCase().includes(q)) ||
        String(item.topicNumber).includes(q),
    );
  }, [catalog, searchQuery]);

  // Items to display based on pagination / load more
  const displayedItems = useMemo(
    () => filteredCatalog.slice(0, visibleCount),
    [filteredCatalog, visibleCount],
  );

  const hasMore = visibleCount < filteredCatalog.length;

  const handleBatchSelect = (batchId: string) => {
    onBatchChange(batchId);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <section
      id="roadmap-100-topics"
      aria-label="Lộ trình 100 chủ đề truyền thông chuyên sâu"
      className="space-y-6 pt-6"
    >
      {/* Header & Description */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-bold text-brand-orange uppercase tracking-wider">
            <Tag className="size-3.5" />
            <span>LỘ TRÌNH BIÊN TẬP &amp; THƯ VIỆN KIẾN THỨC CHUYÊN SÂU</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Danh mục 100 Chủ đề Chuyên sâu Dành cho Agency &amp; Doanh nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Tổng hợp 100 chủ đề và hướng dẫn thực chiến được quy hoạch theo 6 nhóm nghiệp vụ, cung cấp
            phương pháp luận và giải pháp tối ưu cho từng bộ phận vận hành (Owner, Manager, Creator, Client).
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0 bg-muted/60 p-1 rounded-xl border border-border self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "cards"
                ? "bg-card text-brand-orange shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Hiển thị dạng thẻ (Cards)"
          >
            <LayoutGrid className="size-3.5" />
            <span>Dạng thẻ (Cards)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "table"
                ? "bg-card text-brand-orange shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Hiển thị dạng bảng (Table)"
          >
            <List className="size-3.5" />
            <span>Dạng bảng</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Batch Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/60 p-3 sm:p-4 rounded-2xl border border-border">
        {/* Search inside roadmap */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo chủ đề, từ khóa, tính năng giải pháp..."
            className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Batch Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1 mr-1">
            <Filter className="size-3.5" /> Giai đoạn:
          </span>
          {[
            { id: "all", label: "Tất cả (100)" },
            { id: "published", label: `Đã xuất bản (${publishedCount})` },
            { id: "Batch 1", label: "Đợt 1 (Ưu tiên)" },
            { id: "Batch 2", label: "Đợt 2" },
            { id: "Batch 3", label: "Đợt 3" },
            { id: "Batch 4", label: "Đợt 4" },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBatchSelect(b.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                selectedBatch === b.id
                  ? "bg-brand-orange text-white font-semibold shadow-xs"
                  : "bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Hiển thị <strong>{displayedItems.length}</strong> / <strong>{filteredCatalog.length}</strong> chủ đề
          {selectedBatch !== "all" && ` (${selectedBatch === "published" ? "Đã xuất bản" : selectedBatch})`}
          {searchQuery && ` khớp từ khóa "${searchQuery}"`}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="text-brand-orange hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="size-3" />
            <span>Xóa bộ lọc tìm kiếm</span>
          </button>
        )}
      </div>

      {/* Main View: Cards Grid or Table */}
      {displayedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Không tìm thấy chủ đề phù hợp</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn giai đoạn &quot;Tất cả (100)&quot; để xem toàn bộ danh mục bài viết.
          </p>
          <button
            type="button"
            onClick={() => {
              handleSearchChange("");
              handleBatchSelect("all");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-orange text-white hover:bg-brand-orange/90 transition-all cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Xem lại tất cả 100 chủ đề</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* ================= CARD VIEW (DEFAULT) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            return (
              <article
                key={item.topicNumber}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-orange/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  {/* Card Top: Topic # + Category + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-800">
                        #{String(item.topicNumber).padStart(3, "0")}
                      </span>
                      {catMeta && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 truncate max-w-[140px]">
                          {catMeta.shortName}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Đã xuất bản</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
                        <Clock className="size-3" />
                        <span>{item.priorityBatch}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-brand-orange transition-colors">
                    {item.isPublished ? (
                      <Link to={`/blog/${item.slug}`} className="hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      <span>{item.title}</span>
                    )}
                  </h3>

                  {/* Summary / Category Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {catMeta?.description}
                  </p>

                  {/* Solution Capability Badge */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                    <Sparkles className="size-3.5 text-brand-orange shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Giải pháp giải quyết:
                      </span>
                      <p className="text-foreground/90 font-medium line-clamp-2 leading-snug mt-0.5">
                        {item.brandhubFeature}
                      </p>
                    </div>
                  </div>

                  {/* Target Roles */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Đối tượng áp dụng:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.targetRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-border/60">
                  {item.isPublished ? (
                    <Link
                      to={`/blog/${item.slug}`}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white transition-all group-hover:shadow-xs cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        <span>Đọc bài phân tích chi tiết</span>
                      </span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-muted-foreground bg-muted/30 border border-border/40">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>Kế hoạch {item.priorityBatch}</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                        Sắp xuất bản
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4 min-w-[280px]">Chủ đề bài viết</th>
                  <th className="py-3 px-4 w-44">Chuyên mục</th>
                  <th className="py-3 px-4 w-44">Đối tượng phù hợp</th>
                  <th className="py-3 px-4 min-w-[220px]">Giải pháp liên quan</th>
                  <th className="py-3 px-4 w-32 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayedItems.map((item) => {
                  const catMeta = getCategoryMeta(item.category);
                  return (
                    <tr
                      key={item.topicNumber}
                      className="hover:bg-muted/25 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                        #{String(item.topicNumber).padStart(3, "0")}
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        {item.isPublished ? (
                          <Link
                            to={`/blog/${item.slug}`}
                            className="font-bold text-foreground hover:text-brand-orange transition-colors block leading-snug"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p className="font-semibold text-foreground leading-snug">
                            {item.title}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {catMeta?.description.slice(0, 75)}...
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {catMeta && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-orange/10 text-brand-orange">
                            {catMeta.shortName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.targetRoles.map((r: string) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-medium text-foreground/80"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-foreground/90">
                        {item.brandhubFeature}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.isPublished ? (
                          <Link
                            to={`/blog/${item.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                          >
                            <span>Đọc bài</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                            {item.priorityBatch}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination / Load More Controls */}
      {hasMore && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredCatalog.length))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-card border border-border hover:border-brand-orange hover:text-brand-orange shadow-xs transition-all cursor-pointer"
          >
            <ChevronDown className="size-4" />
            <span>Xem thêm {Math.min(LOAD_MORE_STEP, filteredCatalog.length - visibleCount)} chủ đề tiếp theo</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleCount(filteredCatalog.length)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted transition-all cursor-pointer"
          >
            <span>Hiển thị tất cả ({filteredCatalog.length} chủ đề)</span>
          </button>
        </div>
      )}

      {/* Bottom Summary Callout */}
      {!hasMore && displayedItems.length > 0 && (
        <div className="text-center py-3 border-t border-border/60 text-xs text-muted-foreground">
          Đã hiển thị toàn bộ <strong>{filteredCatalog.length}</strong> chủ đề trong lộ trình biên tập BrandHub.
        </div>
      )}
    </section>
  );
}

export default BlogRoadmapTable;
