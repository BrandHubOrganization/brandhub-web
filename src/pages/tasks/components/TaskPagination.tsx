import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface TaskPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
}

export function TaskPagination({
  page,
  totalPages,
  totalElements,
  loading,
  onPageChange,
}: TaskPaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {t("tasks.pagination", {
          page: page + 1,
          pages: Math.max(totalPages, 1),
          total: totalElements,
        })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={page === 0 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          {t("tasks.previous")}
        </Button>
        <Button
          variant="outline"
          disabled={page + 1 >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          {t("tasks.next")}
        </Button>
      </div>
    </div>
  );
}
