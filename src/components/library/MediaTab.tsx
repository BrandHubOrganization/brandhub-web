import React, { useEffect, useState, useCallback } from 'react';
import type { MediaItem, MediaType } from '@/types/contentLibrary';
import { mockContentLibraryService } from '@/services/mockContentLibraryService';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { MediaDetailPanel } from './MediaDetailPanel';
import { MediaUploadButton } from './MediaUploadButton';
import { Search, ArrowUpDown, Film, Image as ImageIcon, Loader2, Play } from 'lucide-react';

export const MediaTab: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

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
            // Avoid duplicates
            const existingIds = new Set(prev.map((i) => i.id));
            const newUnique = res.items.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newUnique];
          });
        }
        setHasMore(res.hasMore);
      } catch (err) {
        console.error('Fetch media error:', err);
      } finally {
        setLoading(false);
      }
    },
    [filterType, search, sort]
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm file theo tên..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Type */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'image'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Ảnh
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'video'
                  ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Video
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
              className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="newest" className="dark:bg-zinc-900">Mới nhất</option>
              <option value="oldest" className="dark:bg-zinc-900">Cũ nhất</option>
            </select>
          </div>

          {/* Upload Button */}
          <MediaUploadButton onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Media Grid */}
      {mediaList.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <ImageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            Không tìm thấy file media nào
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc tải thêm tài nguyên mới vào thư viện.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((media) => (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              className="group relative bg-zinc-900 rounded-2xl overflow-hidden aspect-square border border-zinc-200/80 dark:border-zinc-800 cursor-pointer shadow-xs hover:shadow-md hover:border-indigo-500/50 transition-all transform hover:-translate-y-0.5"
            >
              {/* Media Display */}
              {media.type === 'video' ? (
                <div className="w-full h-full relative">
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Hover Overlay Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <span className="text-xs font-semibold truncate leading-tight">{media.filename}</span>
                <span className="text-[10px] text-zinc-300 mt-0.5 font-mono">
                  {(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              {/* Type Badge Top Right */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white uppercase flex items-center gap-1">
                {media.type === 'video' ? (
                  <>
                    <Film className="w-3 h-3 text-purple-400" /> Video
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-indigo-400" /> Image
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Loading Sentinel */}
      <div ref={sentinelRef} className="py-6 flex items-center justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Đang tải thêm media...</span>
          </div>
        )}
        {!hasMore && mediaList.length > 0 && (
          <span className="text-xs text-zinc-400 font-medium">Đã tải tất cả media tài nguyên</span>
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
