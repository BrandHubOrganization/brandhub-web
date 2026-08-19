import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`border-border bg-muted/20 flex items-center justify-between border-t px-4 py-3 text-xs ${className}`}
    >
      <span className="text-muted-foreground">
        Trang <span className="text-foreground font-semibold">{page + 1}</span> /{" "}
        {totalPages}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="h-7 cursor-pointer gap-1 text-xs"
        >
          <ChevronLeft className="size-3.5" /> Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 cursor-pointer gap-1 text-xs"
        >
          Sau <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
