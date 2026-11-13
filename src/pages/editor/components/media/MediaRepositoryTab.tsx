import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  FolderOpen,
  LayoutGrid,
  Image as ImageIcon,
  Film,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { materialService } from "@/services/materialService";
import { MediaRepositoryItemCard } from "./MediaRepositoryItemCard";
import type {
  MediaCategory,
  MediaRepositoryTabProps,
  MediaSortOption,
} from "./types";
import { SORT_TO_API } from "./types";

const PAGE_SIZE = 8;

const CATEGORIES: Array<{
  id: MediaCategory;
  labelKey: string;
  defaultLabel: string;
  icon: typeof LayoutGrid;
}> = [
  {
    id: "ALL",
    labelKey: "library.repository.filterAll",
    defaultLabel: "Tất cả",
    icon: LayoutGrid,
  },
  {
    id: "IMAGE",
    labelKey: "library.repository.filterImage",
    defaultLabel: "Ảnh",
    icon: ImageIcon,
  },
  {
    id: "VIDEO",
    labelKey: "library.repository.filterVideo",
    defaultLabel: "Video",
    icon: Film,
  },
  {
    id: "FILE",
    labelKey: "library.repository.filterFile",
    defaultLabel: "Tài liệu",
    icon: FileText,
  },
];

export const MediaRepositoryTab: React.FC<MediaRepositoryTabProps> = ({
  mediaUrls,
  onToggleSelect,
  workspaceId,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<MediaCategory>("ALL");
  const [sort, setSort] = useState<MediaSortOption>("CREATED_DESC");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = (cat: MediaCategory) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSortChange = (newSort: MediaSortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const sortOptions: SelectMenuOption[] = useMemo(
    () => [
      {
        value: "CREATED_DESC",
        label: t("editor.mediaDropzone.repository.sortNewest", "Mới nhất"),
      },
      {
        value: "CREATED_ASC",
        label: t("editor.mediaDropzone.repository.sortOldest", "Cũ nhất"),
      },
      {
        value: "NAME_ASC",
        label: t("editor.mediaDropzone.repository.sortNameAsc", "Tên A-Z"),
      },
      {
        value: "NAME_DESC",
        label: t("editor.mediaDropzone.repository.sortNameDesc", "Tên Z-A"),
      },
    ],
    [t],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "editor-media-repository",
      workspaceId,
      page,
      debouncedSearch,
      category,
      sort,
    ],
    queryFn: ({ signal }) =>
      materialService.browse(
        workspaceId!,
        {
          page: page - 1,
          size: PAGE_SIZE,
          search: debouncedSearch.trim(),
          mediaKind: category === "ALL" ? undefined : category,
          sort: SORT_TO_API[sort],
          deleted: false,
        },
        signal,
      ),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });

  const items = data?.files?.items ?? [];
  const total = data?.files?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-3">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Input
            iconPrefix={<Search className="size-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "editor.mediaDropzone.repository.searchPlaceholder",
              "Tìm kiếm tài nguyên...",
            )}
            className="bg-card h-8 pr-8 text-xs"
            aria-label={t(
              "editor.mediaDropzone.repository.searchPlaceholder",
              "Tìm kiếm tài nguyên...",
            )}
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground absolute top-0 right-0 size-8 cursor-pointer"
              aria-label={t("common.clear", "Xóa tìm kiếm")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="w-full shrink-0 sm:w-36">
          <SelectMenu
            value={sort}
            onChange={(val) => handleSortChange(val as MediaSortOption)}
            options={sortOptions}
            ariaLabel={t(
              "editor.mediaDropzone.repository.sortLabel",
              "Sắp xếp tài nguyên",
            )}
            className="bg-card h-8 min-w-36 text-xs"
          />
        </div>
      </div>

      {/* Standardized Category Pills */}
      <div
        className="bg-muted/50 flex flex-wrap items-center gap-0.5 rounded-lg p-0.5"
        role="group"
        aria-label={t("library.repository.mediaKind", "Phân loại tài nguyên")}
      >
        {CATEGORIES.map(({ id, labelKey, defaultLabel, icon: Icon }) => {
          const isActive = category === id;
          return (
            <Button
              key={id}
              type="button"
              variant={isActive ? "orange" : "ghost"}
              size="sm"
              className={`h-7 rounded-md px-2.5 text-xs ${
                isActive
                  ? "bg-brand-orange text-white font-semibold shadow-2xs hover:bg-brand-orange/90"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={isActive}
              onClick={() => handleCategoryChange(id)}
            >
              <Icon className="size-3.5" />
              <span>{t(labelKey, defaultLabel)}</span>
            </Button>
          );
        })}
      </div>

      {/* Grid Thumbnail / Loading / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/60 border-border/50 aspect-square animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
          <FolderOpen className="text-muted-foreground/60 mb-2 size-8" />
          <p className="text-foreground text-xs font-medium">
            {debouncedSearch
              ? t(
                  "editor.mediaDropzone.repository.emptySearch",
                  "Không có tài nguyên phù hợp với từ khóa",
                )
              : t(
                  "editor.mediaDropzone.repository.empty",
                  "Không tìm thấy tài nguyên nào trong kho",
                )}
          </p>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t(
              "editor.mediaDropzone.repository.emptySubtext",
              "Tải lên tài nguyên mới hoặc thử tìm kiếm khác",
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {items.map((item) => {
            const isSelected =
              mediaUrls.includes(item.url) ||
              Boolean(item.previewUrl && mediaUrls.includes(item.previewUrl));

            return (
              <MediaRepositoryItemCard
                key={item.id}
                item={item}
                isSelected={isSelected}
                onToggle={() => onToggleSelect(item)}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-1">
          <Pagination
            compact
            page={page}
            totalPages={totalPages}
            total={total}
            size={PAGE_SIZE}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
