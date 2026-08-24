import React, { useEffect, useState, useCallback } from "react";
import type { MediaItem, MediaType } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mock/mockContentLibraryService";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { MediaDetailPanel } from "./MediaDetailPanel";
import { MediaUploadButton } from "./MediaUploadButton";
import { formatFileSize } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  Film,
  Image as ImageIcon,
  Loader2,
  Play,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const MediaTab: React.FC = () => {
  const { t } = useTranslation();
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
      <div className="border-border bg-card flex flex-col items-stretch justify-between gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("library.media.searchPlaceholder")}
              className="border-border bg-muted text-foreground placeholder-muted-foreground rounded-xl pr-4 pl-9 text-xs"
            />
          </div>

          {/* Filter Type */}
          <div className="border-border bg-muted flex items-center gap-1.5 rounded-xl border p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("library.media.filterAll")}
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "image"
                  ? "bg-brand-orange-soft text-brand-orange font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="size-3.5" />
              {t("library.media.filterImage")}
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === "video"
                  ? "bg-brand-orange-soft text-brand-orange font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Film className="size-3.5" />
              {t("library.media.filterVideo")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="border-border bg-muted flex items-center gap-2 rounded-xl border px-3 py-1.5">
            <ArrowUpDown className="text-muted-foreground size-3.5" />
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              className="text-foreground h-auto w-auto min-w-0 cursor-pointer border-0 bg-transparent px-0 py-0 text-xs font-medium shadow-none focus-visible:ring-0"
            >
              <option value="newest" className="bg-card">
                {t("library.media.sortNewest")}
              </option>
              <option value="oldest" className="bg-card">
                {t("library.media.sortOldest")}
              </option>
            </Select>
          </div>

          {/* Upload Button */}
          <MediaUploadButton onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Media Grid */}
      {mediaList.length === 0 && !loading ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-8 py-16 text-center">
          <ImageIcon className="text-muted-foreground mx-auto mb-3 size-12" />
          <h3 className="text-foreground mb-1 text-sm font-semibold">
            {t("library.media.emptyTitle")}
          </h3>
          <p className="text-muted-foreground mx-auto max-w-sm text-xs">
            {t("library.media.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mediaList.map((media) => (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              className="group hover:border-brand-orange/50 border-border relative aspect-square transform cursor-pointer overflow-hidden rounded-xl border bg-zinc-900 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
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
                    <div className="text-brand-orange flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 size-5 fill-current" />
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
                <span className="text-3xs mt-0.5 font-mono text-white/70">
                  {formatFileSize(media.sizeBytes)}
                </span>
              </div>

              {/* Type Badge Top Right */}
              <div className="text-3xs absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-bold text-white uppercase backdrop-blur-xs">
                {media.type === "video" ? (
                  <>
                    <Film className="text-brand-orange size-3" />{" "}
                    {t("library.media.typeVideo")}
                  </>
                ) : (
                  <>
                    <ImageIcon className="text-brand-orange size-3" />{" "}
                    {t("library.media.typeImage")}
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
          <div className="border-border bg-card text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-xs">
            <Loader2 className="text-brand-orange size-4 animate-spin" />
            <span>{t("library.media.loadingMore")}</span>
          </div>
        )}
        {!hasMore && mediaList.length > 0 && (
          <span className="text-muted-foreground text-xs font-medium">
            {t("library.media.allLoaded")}
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
