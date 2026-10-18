import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface Props {
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
}
const STATUSES = [
  "IN_REVIEW",
  "IN_PROGRESS",
  "TODO",
  "FINISHED",
  "CANCELLED",
  "ALL",
];
export function ApprovalFilters({ search, status, onSearch, onStatus }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        aria-label={t("tasks.approvalPage.search")}
        placeholder={t("tasks.approvalPage.search")}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        wrapperClassName="flex-1"
      />
      <Select
        aria-label={t("tasks.approvalPage.status")}
        value={status}
        wrapperClassName="sm:max-w-56"
        onChange={(event) => onStatus(event.target.value)}
      >
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {t(
              value === "ALL"
                ? "tasks.approvalPage.all"
                : `tasks.status.${value}`,
            )}
          </option>
        ))}
      </Select>
    </div>
  );
}
