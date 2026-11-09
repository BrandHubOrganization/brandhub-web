import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { adminModerationService } from "@/services/adminModerationService";
import { useAuthStore } from "@/store/authStore";
import type {
  ModerationItem,
  ModerationPage,
  ModerationStatus,
} from "@/services/adminModerationService";

export const KANBAN_PAGE_SIZE = 5;

function mergeModerationPages(pages: ModerationPage[] | undefined): ModerationItem[] {
  if (!pages) return [];
  const seen = new Set<string>();
  const merged: ModerationItem[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }
  return merged;
}

function filterItemsByQuery(items: ModerationItem[], searchQuery: string): ModerationItem[] {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(
    (item) =>
      (item.captionPreview ?? "").toLowerCase().includes(normalized) ||
      item.authorName.toLowerCase().includes(normalized) ||
      item.authorEmail.toLowerCase().includes(normalized) ||
      item.reason.toLowerCase().includes(normalized),
  );
}

function useModerationInfiniteQuery(status: ModerationStatus, source: string) {
  const actor = useAuthStore((s) => s.user?.id);
  return useInfiniteQuery({
    queryKey: ["admin-moderation", actor, "infinite", status, source, KANBAN_PAGE_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      adminModerationService.list({ status, source, page: pageParam, size: KANBAN_PAGE_SIZE }),
    getNextPageParam: (last) => (last.page * last.size < last.total ? last.page + 1 : undefined),
    retry: false,
  });
}

export function useModerationColumnInfinite(status: ModerationStatus, source: string, searchQuery: string) {
  const filterKey = `${status}|${source}|${searchQuery.trim()}`;
  const [slice, setSlice] = useState({ key: filterKey, count: KANBAN_PAGE_SIZE });
  const visibleCount = slice.key === filterKey ? slice.count : KANBAN_PAGE_SIZE;
  const query = useModerationInfiniteQuery(status, source);
  const allLoaded = useMemo(() => mergeModerationPages(query.data?.pages), [query.data?.pages]);
  const filtered = useMemo(() => filterItemsByQuery(allLoaded, searchQuery), [allLoaded, searchQuery]);
  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const firstPage = query.data?.pages[0];
  const totalCount = searchQuery.trim() ? filtered.length : (firstPage?.total ?? 0);
  const hasMore = visibleItems.length < filtered.length || Boolean(query.hasNextPage);
  const loadMore = useCallback(() => {
    if (query.isFetchingNextPage) return;
    const nextCount = visibleCount + KANBAN_PAGE_SIZE;
    setSlice({ key: filterKey, count: nextCount });
    if (query.hasNextPage && nextCount > allLoaded.length) void query.fetchNextPage();
  }, [query, visibleCount, filterKey, allLoaded.length]);
  return {
    items: visibleItems,
    totalCount,
    processedToday: firstPage?.processedToday ?? 0,
    isLoading: query.isPending,
    isFetchingMore: query.isFetchingNextPage,
    isError: query.isError,
    hasMore,
    loadMore,
    refetch: query.refetch,
  };
}
