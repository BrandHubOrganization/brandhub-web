import React from "react";
import { useTranslation } from "react-i18next";
import { FileEdit, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { PostStatus } from "@/types/calendar";

interface StatusFilterProps {
  selectedStatuses: PostStatus[];
  onChange: (statuses: PostStatus[]) => void;
}

const STATUSES: { id: PostStatus; icon: React.ReactNode }[] = [
  { id: "DRAFT", icon: <FileEdit className="size-3.5" /> },
  { id: "SCHEDULED", icon: <Clock className="size-3.5" /> },
  { id: "PUBLISHED", icon: <CheckCircle2 className="size-3.5" /> },
  { id: "FAILED", icon: <XCircle className="size-3.5" /> },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onChange,
}) => {
  const { t } = useTranslation();

  const toggleStatus = (id: PostStatus) => {
    if (selectedStatuses.includes(id)) {
      onChange(selectedStatuses.filter((s) => s !== id));
    } else {
      onChange([...selectedStatuses, id]);
    }
  };

  const selectAll = () => {
    if (selectedStatuses.length === STATUSES.length) {
      onChange([]);
    } else {
      onChange(STATUSES.map((s) => s.id));
    }
  };

  return (
    <div className="border-border bg-muted flex flex-wrap items-center gap-2 rounded-xl border p-2">
      <span className="text-muted-foreground px-2 text-xs font-semibold tracking-wider uppercase">
        {t("calendar.statusFilter.label")}
      </span>
      <button
        type="button"
        onClick={selectAll}
        className="border-border text-foreground hover:bg-accent rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
      >
        {selectedStatuses.length === STATUSES.length
          ? t("calendar.statusFilter.deselectAll")
          : t("calendar.statusFilter.selectAll")}
      </button>
      <div className="bg-border mx-1 h-4 w-px" />
      {STATUSES.map((s) => {
        const isSelected = selectedStatuses.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggleStatus(s.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isSelected
                ? "border-brand-orange bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/20 shadow-xs"
                : "border-transparent opacity-40 grayscale hover:opacity-70"
            }`}
          >
            {s.icon}
            <span>{t(`publish.status.${s.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
};
