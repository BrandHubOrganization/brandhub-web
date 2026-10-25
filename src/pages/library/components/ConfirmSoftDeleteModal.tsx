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

interface Props {
  material: MaterialItem | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmSoftDeleteModal({
  material,
  pending,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const cancel = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <Dialog
      open={!!material}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        role="alertdialog"
        aria-modal="true"
        className="rounded-xl"
        onOpenAutoFocus={(event) => {
          trigger.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          event.preventDefault();
          cancel.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (trigger.current?.isConnected) trigger.current.focus();
        }}
      >
        <DialogTitle>{t("library.trash.deleteTitle")}</DialogTitle>
        <DialogDescription>
          {t("library.trash.deleteDescription", { name: material?.name })}
        </DialogDescription>
        <p className="text-muted-foreground text-sm">
          {t("library.trash.quotaNotice")}
        </p>
        <DialogFooter>
          <Button
            ref={cancel}
            variant="outline"
            disabled={pending}
            onClick={onClose}
          >
            {t("library.trash.cancel")}
          </Button>
          <Button variant="destructive" loading={pending} onClick={onConfirm}>
            {t("library.trash.moveToTrash")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
