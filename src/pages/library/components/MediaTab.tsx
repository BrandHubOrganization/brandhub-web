import React, { useEffect, useState, useCallback } from "react";
import type { MediaItem, MediaType } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mockContentLibraryService";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { MediaDetailPanel } from "./MediaDetailPanel";
import { MediaUploadButton } from "./MediaUploadButton";
import {
  Search,
  ArrowUpDown,
  Film,
  Image as ImageIcon,
  Loader2,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const MediaTab: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<MediaType | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Detail panel state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Intersection observer sentinel for infinite scroll
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
  });

  const fetchMedia = useCallback(
    async (pageToFetch: number, reset: boolean = false) => {
      setLoading(true);
      try {
        const res = await mockContentLibraryService.getMedia({
          page: pageToFetch,
          limit: 6,
          type: filterType,
          search,
          sort,
        });

        if (reset) {
          setMediaList(res.items);
        } else {
          setMediaList((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newUnique = res.items.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newUnique];
          });
        }
        setHasMore(res.hasMore);
      } catch (err) {
        console.error("Fetch media error:", err);
      } finally {
        setLoading(false);
      }
    },
    [filterType, search, sort],
  );

  // Initial & Filter Change Fetch
  useEffect(() => {
    setPage(1);
    fetchMedia(1, true);
  }, [filterType, search, sort, fetchMedia]);

  // Trigger next page on infinite scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMedia(nextPage, false);
    }
  }, [isIntersecting, hasMore, loading, page, fetchMedia]);

  const handleUploadSuccess = (newMedia: MediaItem) => {
    setMediaList((prev) => [newMedia, ...prev]);
  };

  const handleDeleteMedia = async (id: string) => {
    await mockContentLibraryService.deleteMedia(id);
    setMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Toolbar Controls */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm file theo tên..."
              className="rounded-xl border-zinc-200 bg-zinc-50 pr-4 pl-9 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-zinc-100"
            />
          </div>

          {/* Filter Type */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700/80 dark:bg-zinc-800/80">
            <button
              onClick={() => setFilterType("all")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "image"
                  ? "bg-brand-orange-soft text-brand-orange font-bold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Ảnh
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "video"
                  ? "bg-brand-orange-soft text-brand-orange font-bold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              Video
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700/80 dark:bg-zinc-800/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              className="h-auto w-auto min-w-0 cursor-pointer border-0 bg-transparent px-0 py-0 text-xs font-medium text-zinc-700 shadow-none focus-visible:ring-0 dark:text-zinc-300"
            >
              <option value="newest" className="dark:bg-zinc-900">
                Mới nhất
              </option>
              <option value="oldest" className="dark:bg-zinc-900">
                Cũ nhất
              </option>
            </Select>
          </div>

          {/* Upload Button */}
          <MediaUploadButton onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Media Grid */}
      {mediaList.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            Không tìm thấy file media nào
          </h3>
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            Thử thay đổi từ khóa tìm kiếm hoặc tải thêm tài nguyên mới vào thư
            viện.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mediaList.map((media) => (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              className="group hover:border-brand-orange/50 relative aspect-square transform cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
            >
              {/* Media Display */}
              {media.type === "video" ? (
                <div className="relative h-full w-full">
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.filename}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="text-brand-orange flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={media.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Hover Overlay Details */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate text-xs leading-tight font-semibold">
                  {media.filename}
                </span>
                <span className="mt-0.5 font-mono text-[10px] text-zinc-300">
                  {(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              {/* Type Badge Top Right */}
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                {media.type === "video" ? (
                  <>
                    <Film className="text-brand-orange h-3 w-3" /> Video
                  </>
                ) : (
                  <>
                    <ImageIcon className="text-brand-orange h-3 w-3" /> Image
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Loading Sentinel */}
      <div ref={sentinelRef} className="flex items-center justify-center py-6">
        {loading && (
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-500 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <Loader2 className="text-brand-orange h-4 w-4 animate-spin" />
            <span>Đang tải thêm media...</span>
          </div>
        )}
        {!hasMore && mediaList.length > 0 && (
          <span className="text-xs font-medium text-zinc-400">
            Đã tải tất cả media tài nguyên
          </span>
        )}
      </div>

      {/* Slide-over Detail Panel */}
      <MediaDetailPanel
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onDelete={handleDeleteMedia}
      />
    </div>
  );
};
