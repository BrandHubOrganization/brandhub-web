import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function TaskDiscardDialog({
  open,
  onDecision,
}: {
  open: boolean;
  onDecision: (discard: boolean) => void;
}) {
  const { t } = useTranslation();
  const keepEditing = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDecision(false);
      }}
    >
      <DialogContent
        className="rounded-xl [&>button]:hidden"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          keepEditing.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("tasks.inline.discardTitle")}</DialogTitle>
          <DialogDescription>
            {t("tasks.inline.discardWarning")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            ref={keepEditing}
            variant="outline"
            onClick={() => onDecision(false)}
          >
            {t("tasks.inline.keepEditing")}
          </Button>
          <Button variant="destructive" onClick={() => onDecision(true)}>
            {t("tasks.inline.discardChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
