import { ArrowUpDown, FolderKanban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function formatTaskDate(
  iso: string | null | undefined,
  lang: string,
  fallback: string,
): string {
  if (!iso) return fallback;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(lang, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export interface SortableHeaderProps {
  field: "name" | "status" | "dueDate";
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort: (field: "name" | "status" | "dueDate") => void;
  label: string;
  className: string;
}

export function SortableHeader({
  field,
  sortField,
  onSort,
  label,
  className,
}: SortableHeaderProps) {
  const active = sortField === field;
  return (
    <th className={`px-3 py-3 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onSort(field);
        }}
        className="hover:text-foreground group inline-flex cursor-pointer items-center gap-1.5 transition-all focus-visible:outline-none active:scale-97"
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`size-3 transition-colors ${
            active
              ? "text-brand-orange"
              : "text-muted-foreground/40 group-hover:text-muted-foreground"
          }`}
        />
      </button>
    </th>
  );
}

export function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-3 py-3">
            <div className="bg-muted mx-auto size-3.5 rounded-sm" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted h-4 w-48 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted h-4 w-28 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted h-4 w-16 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted h-4 w-20 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted h-4 w-24 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <div className="bg-muted ml-auto h-4 w-16 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}

export interface TableEmptyRowProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export function TableEmptyRow({
  isFiltered,
  onResetFilters,
}: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={7} className="py-12 text-center">
        <FolderKanban className="text-muted-foreground/40 mx-auto size-12" />
        <p className="text-foreground mt-3 font-medium">
          Không tìm thấy công việc nào
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {isFiltered
            ? "Không có công việc nào khớp với bộ lọc hiện tại."
            : "Chưa có công việc nào trong không gian này."}
        </p>
        {isFiltered && onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="mt-3.5 gap-1.5 text-xs shadow-2xs"
          >
            <RotateCcw className="text-brand-orange size-3.5" />
            <span>Xóa bộ lọc</span>
          </Button>
        )}
      </td>
    </tr>
  );
}

