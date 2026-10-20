import { Button } from "@/components/ui/button";
import type { HashtagPage } from "@/pages/hashtag-groups/types/hashtag";
import { useTranslation } from "react-i18next";

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
  const prefix = "hashtagGroups.collection.";

  if (page.totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button
        variant="outline"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t(prefix + "previous")}
      </Button>
      <span>
        {t(prefix + "page", {
          page: page.page + 1,
          total: page.totalPages,
        })}
      </span>
      <Button
        variant="outline"
        disabled={currentPage + 1 >= page.totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t(prefix + "next")}
      </Button>
    </div>
  );
}
