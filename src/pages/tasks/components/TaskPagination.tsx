import { useTranslation } from "react-i18next";
import { Pagination } from "@/components/ui/pagination";

export interface TaskPaginationProps {
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
    <Pagination
      page={page + 1}
      size={10}
      total={totalElements}
      totalPages={Math.max(1, totalPages)}
      isFetching={loading}
      itemLabel={t("tasks.itemLabel", "công việc")}
      onPageChange={(newPage) => onPageChange(newPage - 1)}
      className="pt-2"
    />
  );
}
