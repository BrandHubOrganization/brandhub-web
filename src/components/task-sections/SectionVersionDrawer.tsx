import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fieldText, lineDiff } from "@/components/task-sections/lineDiff";
import { taskSectionService } from "@/services/taskSectionService";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const CURRENT = "current";

/** Submitted versions of a section: line diff between any two (or the current copy) and restore. */
export function SectionVersionDrawer({
  section,
  title,
  api,
  onClose,
}: {
  section: TaskSection;
  title: string;
  api: TaskSectionsApi;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { workspaceId, taskId } = api;
  const query = useQuery({
    queryKey: ["task-section-versions", workspaceId, taskId, section.key],
    queryFn: () =>
      taskSectionService.versions(workspaceId, taskId, section.key),
  });
  const versions = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => b.versionNo - a.versionNo),
    [query.data],
  );
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState(CURRENT);
  const [restoreNo, setRestoreNo] = useState<number | null>(null);
  const fromKey =
    from ?? (versions[0] ? String(versions[0].versionNo) : CURRENT);

  const contentOf = (key: string): Record<string, unknown> =>
    key === CURRENT
      ? api.contentOf(section)
      : (versions.find((v) => String(v.versionNo) === key)?.content ?? {});
  const before = contentOf(fromKey);
  const after = contentOf(to);
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const date = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  const label = (no: number, at: string) =>
    t("tasks.sectionActions.versionLabel", { no, date: date(at) });
  const options = [
    { value: CURRENT, label: t("tasks.sectionActions.currentVersion") },
    ...versions.map((v) => ({
      value: String(v.versionNo),
      label: label(v.versionNo, v.submittedAt),
    })),
  ];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {t("tasks.sectionActions.versionsTitle", { section: title })}
          </SheetTitle>
          <SheetDescription>
            {t("tasks.sectionActions.versionsHint")}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          {query.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : versions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("tasks.sectionActions.versionsEmpty")}
            </p>
          ) : (
            <>
              <ul className="divide-y rounded-lg border">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {label(v.versionNo, v.submittedAt)}
                    </span>
                    {section.canRestore && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRestoreNo(v.versionNo)}
                      >
                        {t("tasks.sectionActions.restore")}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-2">
                <VersionSelect
                  label={t("tasks.sectionActions.compareFrom")}
                  value={fromKey}
                  options={options}
                  onChange={setFrom}
                />
                <VersionSelect
                  label={t("tasks.sectionActions.compareTo")}
                  value={to}
                  options={options}
                  onChange={setTo}
                />
              </div>
              <div className="space-y-3">
                {fields.map((field) => {
                  const diff = lineDiff(
                    fieldText(before[field]),
                    fieldText(after[field]),
                  );
                  const changed = diff.some((d) => d.type !== "same");
                  return (
                    <div key={field} className="rounded-lg border">
                      <p className="bg-muted/50 border-b px-3 py-1.5 text-xs font-medium">
                        {t(`tasks.sections.${section.key}.fields.${field}`, {
                          defaultValue: field,
                        })}
                        {!changed && (
                          <span className="text-muted-foreground font-normal">
                            {" · "}
                            {t("tasks.sectionActions.unchanged")}
                          </span>
                        )}
                      </p>
                      <div className="overflow-x-auto px-3 py-2 text-sm whitespace-pre-wrap">
                        {diff.map((line, i) => (
                          <div
                            key={i}
                            className={cn(
                              line.type === "add" &&
                                "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
                              line.type === "del" &&
                                "bg-destructive/10 text-destructive line-through",
                            )}
                          >
                            <span aria-hidden="true">
                              {line.type === "add"
                                ? "+ "
                                : line.type === "del"
                                  ? "− "
                                  : "  "}
                            </span>
                            {line.type !== "same" && (
                              <span className="sr-only">
                                {t(
                                  line.type === "add"
                                    ? "tasks.sectionActions.added"
                                    : "tasks.sectionActions.removed",
                                )}
                              </span>
                            )}
                            {line.text || " "}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </SheetContent>
      <ConfirmDialog
        isOpen={restoreNo !== null}
        onClose={() => setRestoreNo(null)}
        variant="warning"
        title={t("tasks.sectionActions.restoreTitle", { no: restoreNo })}
        description={t("tasks.sectionActions.restoreHint")}
        confirmText={t("tasks.sectionActions.restore")}
        onConfirm={async () => {
          if (restoreNo !== null && (await api.restore(section, restoreNo))) {
            setRestoreNo(null);
            onClose();
          }
        }}
      />
    </Sheet>
  );
}

function VersionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground block text-xs">{label}</span>
      <select
        className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
