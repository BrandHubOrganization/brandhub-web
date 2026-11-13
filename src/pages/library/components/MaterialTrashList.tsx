import { useRef, useState } from "react";
import {
  FileText,
  Film,
  Folder,
  ImageIcon,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatFileSize } from "@/lib/utils";
import { retentionDays } from "@/pages/library/hooks/materialTrashPolicy";
import { useTrashSelection } from "@/pages/library/hooks/useTrashSelection";
import { stripExtension } from "@/utils/mediaDownloadHelper";
import type { MaterialFolderItem, MaterialItem } from "@/types/material";

export function MaterialTrashList({
  workspace,
  files,
  folders,
  busy,
  onBusyChange,
}: {
  workspace: string;
  files: MaterialItem[];
  folders: MaterialFolderItem[];
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const label = (key: string) => t(`library.trash.${key}`);
  const selection = useTrashSelection({
    workspace,
    files,
    folders,
    onBusyChange,
  });
  const { rows, selected, eligible, mutation } = selection;
  const [confirm, setConfirm] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const pending = busy || mutation.isPending;
  const count = selected.length;
  const checkboxClass =
    "border-input accent-primary size-4 shrink-0 cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <section
      aria-label={label("title")}
      className="space-y-3"
      aria-busy={pending}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
        <label className="flex min-h-8 cursor-pointer items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={!!eligible.length && count === eligible.length}
            ref={(node) => {
              if (node)
                node.indeterminate = count > 0 && count < eligible.length;
            }}
            disabled={pending || !eligible.length}
            onChange={selection.selectPage}
          />
          {label("selectPage")}
        </label>
        <span aria-live="polite" className="text-muted-foreground text-xs">
          {count
            ? t("library.trash.selectedCount", { count })
            : label("selectionHint")}
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-[4px]"
            disabled={
              pending || !count || selected.some((row) => !row.canRestore)
            }
            onClick={() => mutation.mutate("restore")}
          >
            <RotateCcw className="size-3.5" />
            {label("restore")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-[4px]"
            disabled={
              pending || !count || selected.some((row) => !row.canPurge)
            }
            onClick={() => setConfirm(true)}
          >
            <Trash2 className="size-3.5" />
            {label("purge")}
          </Button>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-[4px]"
              disabled={pending}
              onClick={selection.clear}
            >
              {label("clearSelection")}
            </Button>
          )}
        </div>
      </div>
      {count > 0 &&
        selected.some((row) => !row.canRestore || !row.canPurge) && (
          <p className="text-muted-foreground text-xs" role="status">
            {label("folderContentsBlocked")}
          </p>
        )}
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
          <div className="bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(0,1fr)_7rem_14rem] gap-4 border-b px-4 py-2.5 text-xs font-medium sm:grid">
            <span className="pl-7">{label("nameColumn")}</span>
            <span>{label("sizeColumn")}</span>
            <span>{label("statusColumn")}</span>
          </div>
          <ul className="divide-border divide-y">
            {rows.map((row) => {
              const checked = selected.some((item) => item.key === row.key);
              const selectable = row.canRestore || row.canPurge;
              const file = row.file;
              const Icon = row.folder
                ? Folder
                : file?.mediaKind === "VIDEO"
                  ? Film
                  : file?.mediaKind === "IMAGE"
                    ? ImageIcon
                    : FileText;
              const days = file ? retentionDays(file) : 0;
              const status =
                file?.status === "PURGE_IN_PROGRESS"
                  ? label("purging")
                  : file?.purgeBlockedReason
                    ? label("referenced")
                    : !selectable
                      ? label("noPermission")
                      : file
                        ? days > 0
                          ? t("library.trash.daysRemaining", { count: days })
                          : label("retentionExpired")
                        : label("folderContents");
              return (
                <li
                  key={row.key}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    checked && "bg-primary/5",
                  )}
                >
                  <label className="grid cursor-pointer grid-cols-[minmax(0,1fr)] gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_7rem_14rem] sm:items-center sm:gap-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        aria-label={t("library.trash.selectItem", {
                          name: row.name,
                        })}
                        className={checkboxClass}
                        checked={checked}
                        disabled={pending || !selectable}
                        onChange={() => selection.toggle(row.key)}
                      />
                      <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon
                          className={cn(
                            "size-4",
                            row.folder && "text-brand-orange",
                          )}
                        />
                      </span>
                      <span className="min-w-0">
                        <span
                          className="block truncate text-sm font-medium"
                          title={row.folder ? row.name : stripExtension(row.name)}
                        >
                          {row.folder ? row.name : stripExtension(row.name)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {row.folder ? label("folderType") : label("fileType")}
                        </span>
                      </span>
                    </span>
                    <span className="text-muted-foreground pl-7 text-xs tabular-nums sm:pl-0">
                      {file ? formatFileSize(file.fileSize ?? 0) : "—"}
                    </span>
                    <span className="text-muted-foreground pl-7 text-xs sm:pl-0">
                      {status}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Dialog
        open={confirm}
        onOpenChange={(open) => {
          if (!pending) setConfirm(open);
        }}
      >
        <DialogContent
          role="alertdialog"
          className="rounded-xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancel.current?.focus();
          }}
        >
          <DialogTitle>
            {t("library.trash.selectionPurgeTitle", { count })}
          </DialogTitle>
          <DialogDescription>
            {t("library.trash.selectionPurgeDescription", { count })}
          </DialogDescription>
          <DialogFooter>
            <Button
              ref={cancel}
              variant="outline"
              disabled={pending}
              onClick={() => setConfirm(false)}
            >
              {label("cancel")}
            </Button>
            <Button
              variant="destructive"
              loading={pending}
              disabled={pending || !count}
              onClick={() =>
                mutation.mutate("purge", { onSettled: () => setConfirm(false) })
              }
            >
              {label("purge")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
