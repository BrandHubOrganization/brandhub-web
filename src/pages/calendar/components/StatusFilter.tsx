import React from "react";
import { useTranslation } from "react-i18next";
import { FileEdit, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { PostStatus } from "@/types/calendar";

interface StatusFilterProps {
  selectedStatuses: PostStatus[];
  onChange: (statuses: PostStatus[]) => void;
}

const STATUSES: {
  id: PostStatus;
  icon: React.ReactNode;
  selectedClass: string;
}[] = [
  {
    id: "DRAFT",
    icon: <FileEdit className="size-3.5 text-amber-600 dark:text-amber-400" />,
    selectedClass:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/25 dark:text-amber-300 shadow-xs",
  },
  {
    id: "SCHEDULED",
    icon: <Clock className="size-3.5 text-blue-600 dark:text-blue-400" />,
    selectedClass:
      "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/25 dark:text-blue-300 shadow-xs",
  },
  {
    id: "PUBLISHED",
    icon: <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
    selectedClass:
      "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/25 dark:text-emerald-300 shadow-xs",
  },
  {
    id: "FAILED",
    icon: <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />,
    selectedClass:
      "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:border-rose-500/60 dark:bg-rose-500/25 dark:text-rose-300 shadow-xs",
  },
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
                ? s.selectedClass
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
