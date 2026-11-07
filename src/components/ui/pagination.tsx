import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Trang hiện tại (bắt đầu từ 1) */
  page: number;
  /** Số bản ghi trên mỗi trang */
  size?: number;
  /** Tổng số bản ghi (nếu có, dùng để hiển thị text tổng và tính totalPages) */
  total?: number;
  /** Tổng số trang (nếu không truyền sẽ tự động tính từ total / size) */
  totalPages?: number;
  /** Trạng thái đang tải (disable các nút bấm) */
  isFetching?: boolean;
  /** Callback khi chuyển trang */
  onPageChange: (page: number) => void;
  /** Callback khi thay đổi số bản ghi/trang (nếu không truyền sẽ ẩn dropdown chọn size) */
  onSizeChange?: (size: number) => void;
  /** Danh sách lựa chọn số dòng/trang (mặc định: [10, 20, 50, 100]) */
  pageSizeOptions?: number[];
  /** Tên danh từ của mục dữ liệu (VD: "người dùng", "bài viết", "thông báo", mặc định "mục") */
  itemLabel?: string;
  /** Ẩn dòng thông tin tổng bản ghi */
  showTotalInfo?: boolean;
  /** Hiển thị dạng nhỏ gọn (dành cho modal hoặc khung chật) */
  compact?: boolean;
  /** CSS class container tùy biến */
  className?: string;
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function resolveTotalPages(explicitTotalPages?: number, total?: number, size = 10): number {
  if (explicitTotalPages !== undefined) {
    return Math.max(1, explicitTotalPages);
  }
  if (total !== undefined && size > 0) {
    return Math.max(1, Math.ceil(total / size));
  }
  return 1;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

interface RenderTotalTextOptions {
  page: number;
  size: number;
  total?: number;
  totalPages: number;
  itemLabel: string;
  t: TFunction;
}

function renderTotalText({ page, size, total, totalPages, itemLabel, t }: RenderTotalTextOptions): string {
  if (total !== undefined && total > 0) {
    return t("common.pagination.showing", {
      from: formatNumber((page - 1) * size + 1),
      to: formatNumber(Math.min(page * size, total)),
      total: formatNumber(total),
      item: itemLabel,
    });
  }
  if (total !== undefined) {
    return t("common.pagination.total", { count: 0, item: itemLabel });
  }
  return `${page} / ${totalPages}`;
}

interface PaginationNavButtonsProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

function CompactPagination({ page, totalPages, isFetching, onPageChange, className }: PaginationNavButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center justify-between gap-2 text-xs", className)}>
      <span className="text-muted-foreground font-sans">
        {page} / {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("common.pagination.previous")}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("common.pagination.next")}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PaginationNavButtons({ page, totalPages, isFetching, onPageChange }: PaginationNavButtonsProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {/* Đầu trang */}
      <Button
        variant="outline"
        size="sm"
        className="size-8 p-0"
        disabled={page <= 1 || isFetching}
        onClick={() => onPageChange(1)}
        title={t("common.pagination.first")}
        aria-label={t("common.pagination.first")}
      >
        <ChevronsLeft className="size-4" />
      </Button>

      {/* Trang trước */}
      <Button
        variant="outline"
        size="sm"
        className="size-8 p-0"
        disabled={page <= 1 || isFetching}
        onClick={() => onPageChange(page - 1)}
        title={t("common.pagination.previous")}
        aria-label={t("common.pagination.previous")}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Danh sách các số trang */}
      <div className="flex items-center gap-1">
        {getPaginationItems(page, totalPages).map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-muted-foreground flex size-8 items-center justify-center text-xs select-none"
              >
                …
              </span>
            );
          }
          const isActive = item === page;
          return (
            <Button
              key={`page-${item}`}
              variant={isActive ? "orange" : "outline"}
              size="sm"
              className={cn("size-8 p-0 text-xs", isActive && "shadow-xs pointer-events-none font-semibold")}
              disabled={isFetching}
              onClick={() => onPageChange(item)}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </Button>
          );
        })}
      </div>

      {/* Trang tiếp */}
      <Button
        variant="outline"
        size="sm"
        className="size-8 p-0"
        disabled={page >= totalPages || isFetching}
        onClick={() => onPageChange(page + 1)}
        title={t("common.pagination.next")}
        aria-label={t("common.pagination.next")}
      >
        <ChevronRight className="size-4" />
      </Button>

      {/* Cuối trang */}
      <Button
        variant="outline"
        size="sm"
        className="size-8 p-0"
        disabled={page >= totalPages || isFetching}
        onClick={() => onPageChange(totalPages)}
        title={t("common.pagination.last")}
        aria-label={t("common.pagination.last")}
      >
        <ChevronsRight className="size-4" />
      </Button>
    </nav>
  );
}

export function Pagination({
  page,
  size = 10,
  total,
  totalPages: explicitTotalPages,
  isFetching = false,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel,
  showTotalInfo = true,
  compact = false,
  className,
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = resolveTotalPages(explicitTotalPages, total, size);
  const resolvedItemLabel = itemLabel || t("common.pagination.defaultItem");

  if (compact) {
    return (
      <CompactPagination
        page={page}
        totalPages={totalPages}
        isFetching={isFetching}
        onPageChange={onPageChange}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-between gap-4 pt-3 sm:flex-row", className)}>
      {/* 1. Thông tin tổng số lượng */}
      {showTotalInfo && (
        <div className="text-muted-foreground text-xs">
          {renderTotalText({ page, size, total, totalPages, itemLabel: resolvedItemLabel, t })}
        </div>
      )}

      {/* 2. Controls: Page size selector & Page navigation buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdown chọn số dòng/trang (chỉ hiện khi có callback onSizeChange) */}
        {onSizeChange && (
          <div className="flex items-center gap-2">
            <SelectMenu
              className="h-8 w-auto min-w-[110px] text-xs"
              ariaLabel={t("common.pagination.perPage")}
              value={String(size)}
              onChange={(selectedValue) => onSizeChange(Number(selectedValue))}
              options={pageSizeOptions.map((pageSizeOption) => ({
                value: String(pageSizeOption),
                label: `${pageSizeOption} ${t("common.pagination.perPage")}`,
              }))}
            />
          </div>
        )}

        {/* Nút điều hướng phân trang */}
        <PaginationNavButtons
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

export default Pagination;

