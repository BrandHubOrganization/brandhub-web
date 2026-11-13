import { useTranslation } from "react-i18next";
import { Pagination } from "@/components/ui/pagination";
import type { HashtagPage } from "@/pages/hashtag-groups/types/hashtag";

interface HashtagCollectionPaginationProps {
  page: HashtagPage;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function HashtagCollectionPagination({
  page,
  currentPage,
  onPageChange,
}: HashtagCollectionPaginationProps) {
  const { t } = useTranslation();

  if (page.totalPages <= 1) return null;

  return (
    <Pagination
      page={currentPage + 1}
      size={page.size || 10}
      total={page.totalElements}
      totalPages={page.totalPages}
      onPageChange={(p1) => onPageChange(p1 - 1)}
      itemLabel={t("hashtagGroups.collection.itemLabel", {
        defaultValue: "nhóm hashtag",
      })}
      compact={false}
    />
  );
}
