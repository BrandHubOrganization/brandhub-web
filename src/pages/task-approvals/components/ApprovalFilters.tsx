import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
}
const STATUSES = [
  "ALL",
  "IN_REVIEW",
  "IN_PROGRESS",
  "TODO",
  "FINISHED",
  "CANCELLED",
] as const;

export function ApprovalFilters({ search, status, onSearch, onStatus }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <Input
        aria-label={t("tasks.approvalPage.search")}
        placeholder={t("tasks.approvalPage.search")}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <div
        role="tablist"
        aria-label={t("tasks.approvalPage.status")}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs"
      >
        {STATUSES.map((value) => {
          const isActive = status === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatus(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(
                value === "ALL"
                  ? "tasks.approvalPage.all"
                  : `tasks.status.${value}`,
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
