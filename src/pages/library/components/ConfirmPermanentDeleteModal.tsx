import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MaterialItem } from "@/types/material";

export function ConfirmPermanentDeleteModal({
  target,
  pending,
  onClose,
  onConfirm,
}: {
  target: MaterialItem | "all" | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const cancel = useRef<HTMLButtonElement>(null);
  const all = target === "all";
  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
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
          {t(`library.trash.${all ? "emptyTrashTitle" : "purgeTitle"}`)}
        </DialogTitle>
        <DialogDescription className="break-words">
          {t(
            `library.trash.${all ? "emptyTrashDescription" : "purgeDescription"}`,
            { name: target && target !== "all" ? target.name : "" },
          )}
        </DialogDescription>
        <DialogFooter>
          <Button
            ref={cancel}
            variant="outline"
            disabled={pending}
            onClick={onClose}
          >
            {t("library.trash.cancel")}
          </Button>
          <Button
            variant="destructive"
            loading={pending}
            disabled={pending}
            onClick={onConfirm}
          >
            {t(`library.trash.${all ? "emptyTrash" : "purge"}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
