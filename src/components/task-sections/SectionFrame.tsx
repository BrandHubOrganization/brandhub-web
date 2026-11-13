import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, History, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SectionStatusBadge } from "@/components/task-sections/SectionStatusBadge";
import { SectionReturnDialog } from "@/components/task-sections/SectionReturnDialog";
import { SectionVersionDrawer } from "@/components/task-sections/SectionVersionDrawer";
import type { SectionSaveState } from "@/hooks/sectionDrafts";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

/** i18n base of a section key: `POST.CAPTION` → `tasks.sections.POST.CAPTION`. */
const sectionI18n = (key: string) => `tasks.sections.${key}`;

/**
 * Saving for sections whose content is stored elsewhere (POST/VIDEO caption, media, channels
 * go through the post editor). Default: the section's own draft in `useTaskSections`.
 */
export interface SectionSaveBinding {
  dirty: boolean;
  state?: SectionSaveState;
  save: () => Promise<boolean>;
  reload?: () => void;
}

export function SectionFrame({
  section,
  api,
  isEmpty = false,
  saveBinding,
  showVersions = true,
  className,
  children,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
  isEmpty?: boolean;
  saveBinding?: SectionSaveBinding;
  showVersions?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<"return" | "reopen" | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const base = sectionI18n(section.key);
  const title = t(`${base}.title`, { defaultValue: section.key });
  const save: SectionSaveBinding = saveBinding ?? {
    dirty: api.isDirty(section.key),
    state: api.saveState[section.key],
    save: () => api.save(section.key),
    reload: () => void api.reload(section.key),
  };
  const conflict = save.state === "conflict";
  const owners = section.ownerNames.join(", ");
  const lockReason = section.canEdit ? null : lockText(t, section, owners);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };
  const submit = () =>
    run(async () => {
      if (saveBinding && !(await saveBinding.save())) return;
      await api.act(section.key, "submit");
    });

  return (
    <section
      aria-labelledby={`section-${section.key}`}
      className={cn(
        "bg-card rounded-xl border",
        !section.canEdit && "border-dashed",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`section-${section.key}`} className="text-sm font-semibold">
              {title}
            </h3>
            <SectionStatusBadge status={section.status} />
            {Boolean(section.viewerRoles?.length) && (
              <span className="bg-brand-orange-soft text-brand-orange rounded-full px-2 py-0.5 text-xs font-medium">
                {t("editor.sections.yours")}
              </span>
            )}
            {section.visibility === "INTERNAL" && (
              <span className="text-muted-foreground text-xs">
                {t("editor.sections.internal")}
              </span>
            )}
          </div>
          {lockReason ? (
            <p
              className="text-muted-foreground flex items-center gap-1 text-xs"
              title={lockReason}
            >
              <Lock className="size-3 shrink-0" aria-hidden="true" />
              {lockReason}
            </p>
          ) : (
            owners && (
              <p className="text-muted-foreground text-xs">
                {t("editor.sections.owner", { names: owners })}
              </p>
            )
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {section.canEdit && (
            <SaveIndicator state={save.state} dirty={save.dirty} />
          )}
          {section.canEdit && save.dirty && !conflict && (
            <Button
              size="sm"
              variant="outline"
              loading={save.state === "saving"}
              onClick={() => void save.save()}
            >
              {t("tasks.sectionActions.save")}
            </Button>
          )}
          {showVersions && (
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label={t("tasks.sectionActions.versions")}
              title={t("tasks.sectionActions.versions")}
              onClick={() => setVersionsOpen(true)}
            >
              <History className="size-4" />
            </Button>
          )}
          {section.canReopen && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setDialog("reopen")}
            >
              {t("tasks.sectionActions.reopen")}
            </Button>
          )}
          {section.canReturn && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setDialog("return")}
            >
              {t("tasks.sectionActions.return")}
            </Button>
          )}
          {section.canApprove && (
            <Button
              size="sm"
              loading={busy}
              onClick={() => void run(() => api.act(section.key, "approve"))}
            >
              {t("tasks.sectionActions.approve")}
            </Button>
          )}
          {section.canSubmit && (
            <Button
              size="sm"
              variant="orange"
              loading={busy}
              disabled={conflict}
              onClick={() => void submit()}
            >
              {t("tasks.sectionActions.submit")}
            </Button>
          )}
        </div>
      </header>

      {section.status === "RETURNED" && section.returnNote && (
        <div
          role="status"
          className="flex gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="min-w-0 break-words">
            <span className="font-medium">
              {t("editor.sections.returned")}{" "}
            </span>
            {section.returnNote}
          </p>
        </div>
      )}
      {conflict && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-sm"
        >
          <span>{t("editor.sections.conflict")}</span>
          {save.reload && (
            <Button size="sm" variant="outline" onClick={save.reload}>
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {t("tasks.sectionActions.reload")}
            </Button>
          )}
        </div>
      )}

      <div className="p-4">
        {isEmpty && (
          <p className="text-muted-foreground mb-3 text-sm">
            {section.canEdit
              ? t(`${base}.emptyHint`, {
                  defaultValue: t("editor.sections.emptyHint"),
                })
              : t("editor.sections.empty")}
          </p>
        )}
        <fieldset disabled={!section.canEdit} className="min-w-0">
          {children}
        </fieldset>
      </div>

      {dialog && (
        <SectionReturnDialog
          action={dialog}
          sectionTitle={title}
          onClose={() => setDialog(null)}
          onConfirm={async (note) => {
            if (await api.act(section.key, dialog, note)) setDialog(null);
          }}
        />
      )}
      {versionsOpen && (
        <SectionVersionDrawer
          section={section}
          title={title}
          api={api}
          onClose={() => setVersionsOpen(false)}
        />
      )}
    </section>
  );
}

function lockText(
  t: (key: string, opts?: Record<string, unknown>) => string,
  section: TaskSection,
  owners: string,
) {
  const waitsForWriter =
    (section.status === "DRAFT" || section.status === "RETURNED") &&
    section.viewerRoles?.some((role) => role.endsWith("_EDITING"));
  const reason = waitsForWriter
    ? t("editor.sections.lockedWaitWriter")
    : section.status === "SUBMITTED"
      ? t("editor.sections.lockedSubmitted")
      : section.status === "INTERNAL_APPROVED" ||
          section.status === "CLIENT_APPROVED"
        ? t("editor.sections.lockedApproved")
        : t("editor.sections.lockedNoRight");
  return owners
    ? `${t("editor.sections.owner", { names: owners })} · ${reason}`
    : reason;
}

function SaveIndicator({
  state,
  dirty,
}: {
  state?: SectionSaveState;
  dirty: boolean;
}) {
  const { t } = useTranslation();
  const text =
    state === "saving"
      ? t("tasks.sectionActions.saving")
      : state === "error"
        ? t("tasks.sectionActions.saveError")
        : dirty
          ? t("tasks.sectionActions.unsaved")
          : state === "saved"
            ? t("tasks.sectionActions.saved")
            : null;
  if (!text) return null;
  return (
    <span
      aria-live="polite"
      className={cn(
        "text-xs",
        state === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {text}
    </span>
  );
}

export function SectionFrameSkeleton() {
  return (
    <div className="bg-card space-y-3 rounded-xl border p-4" aria-hidden="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
