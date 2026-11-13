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
      totalPages={totalPages}
      isFetching={loading}
      onPageChange={(newPage) => onPageChange(newPage - 1)}
      itemLabel={t("tasks.itemLabel", { defaultValue: "công việc" })}
      compact={false}
    />
  );
}
