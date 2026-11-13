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

  if (page.totalPages <= 1 && page.totalElements <= page.size) return null;

  return (
    <Pagination
      page={currentPage + 1}
      size={page.size}
      total={page.totalElements}
      totalPages={page.totalPages}
      itemLabel={t("hashtagGroups.collection.itemLabel", "nhóm hashtag")}
      onPageChange={(nextPage) => onPageChange(nextPage - 1)}
      className="pt-2"
    />
  );
}
