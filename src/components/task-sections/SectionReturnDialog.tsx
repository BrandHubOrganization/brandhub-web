import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_NOTE = 2000; // server limit (SectionService.MAX_NOTE)

/** Note dialog for "return" (note required) and "reopen" (note optional). */
export function SectionReturnDialog({
  action,
  sectionTitle,
  onClose,
  onConfirm,
}: {
  action: "return" | "reopen";
  sectionTitle: string;
  onClose: () => void;
  onConfirm: (note: string) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const required = action === "return";
  const invalid = required && !note.trim();

  const confirm = async () => {
    setTouched(true);
    if (invalid) return;
    setBusy(true);
    try {
      await onConfirm(note.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="rounded-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t(`tasks.sectionActions.${action}Title`, { section: sectionTitle })}
          </DialogTitle>
          <DialogDescription>
            {t(`tasks.sectionActions.${action}Hint`)}
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1.5 text-sm font-medium">
          <span>
            {t("tasks.sectionActions.noteLabel")}
            {required && <span className="text-destructive"> *</span>}
          </span>
          <Textarea
            autoFocus
            value={note}
            maxLength={MAX_NOTE}
            rows={4}
            aria-invalid={touched && invalid}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {touched && invalid && (
          <p role="alert" className="text-destructive text-sm">
            {t("tasks.sectionActions.noteRequired")}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t("tasks.sectionActions.cancel")}
          </Button>
          <Button onClick={() => void confirm()} disabled={busy}>
            {t(`tasks.sectionActions.${action}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
