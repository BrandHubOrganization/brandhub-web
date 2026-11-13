import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SectionStatus } from "@/types/task";

const STYLE: Record<SectionStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SUBMITTED: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  INTERNAL_APPROVED:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  CLIENT_APPROVED:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  RETURNED: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

export function SectionStatusBadge({ status }: { status: SectionStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-medium",
        STYLE[status],
      )}
    >
      {t(`tasks.sectionStatus.${status}`)}
    </span>
  );
}
