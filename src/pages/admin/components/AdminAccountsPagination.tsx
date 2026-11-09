import { useTranslation } from "react-i18next";
import { Pagination } from "@/components/ui/pagination";

export interface AdminAccountsPaginationProps {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

export function AdminAccountsPagination({
  page,
  size,
  total,
  totalPages,
  isFetching,
  onPageChange,
  onSizeChange,
}: AdminAccountsPaginationProps) {
  const { t } = useTranslation();

  return (
    <Pagination
      page={page}
      size={size}
      total={total}
      totalPages={totalPages}
      isFetching={isFetching}
      onPageChange={onPageChange}
      onSizeChange={onSizeChange}
      itemLabel={t("admin.accounts.usersLabel")}
    />
  );
}

export default AdminAccountsPagination;
