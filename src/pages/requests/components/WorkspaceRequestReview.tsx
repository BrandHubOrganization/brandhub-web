import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDraftUnloadWarning } from "@/pages/media-package/hooks/useDraftUnloadWarning";
import { invalidRequestFields, requestError } from "@/pages/requests/requestErrors";
import type { ReviewAction } from "@/pages/requests/types/workspaceRequest";

export function WorkspaceRequestReview({ action, title, onClose, onConfirm, onConflict }: {
  action: ReviewAction; title: string; onClose: () => void;
  onConfirm: (note: string) => Promise<void>; onConflict: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invalidNote, setInvalidNote] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const inFlight = useRef(false);
  const summary = useRef<HTMLParagraphElement>(null);
  useDraftUnloadWarning(Boolean(note));
  function close() { if (busy) return; if (note) setDiscarding(true); else onClose(); }
  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(""); setInvalidNote(false);
    try { await onConfirm(note.trim()); toast.success(t(`requests.v2.review.${action}Success`)); }
    catch (failure) {
      const noteError = invalidRequestFields(failure).includes("note");
      setInvalidNote(noteError);
      setError(noteError ? t("requests.v2.review.invalidNote") : requestError(failure, t));
      await onConflict();
      requestAnimationFrame(() => summary.current?.focus());
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open) close(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>{t(`requests.v2.review.${action}`)}</DialogTitle>
        <DialogDescription>{t(`requests.v2.review.${action}Help`, { title })}</DialogDescription></DialogHeader>
      {action === "deny" && <div className="space-y-2">
        <Label htmlFor="request-decision-note">{t("requests.v2.review.note")}</Label>
        <Textarea id="request-decision-note" maxLength={2000} value={note} disabled={busy}
          onChange={event => setNote(event.target.value)} aria-invalid={invalidNote}
          aria-describedby="request-note-help request-note-error" />
        <p id="request-note-help" className="text-muted-foreground text-sm">{t("requests.v2.review.noteHelp")}</p>
        <p id="request-note-error" className="text-destructive text-sm">
          {invalidNote ? t("requests.v2.review.invalidNote") : null}</p>
      </div>}
      {error && <p ref={summary} role="alert" tabIndex={-1} className="text-destructive text-sm">{error}</p>}
      {discarding && <div role="alert" className="space-y-3 rounded-xl border p-3">
        <p className="text-sm">{t("requests.v2.discardPrompt")}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDiscarding(false)}>{t("requests.v2.keepEditing")}</Button>
          <Button variant="destructive" onClick={onClose}>{t("requests.v2.discard")}</Button>
        </div>
      </div>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={close}>{t("requests.v2.close")}</Button>
        <Button variant={action === "deny" ? "destructive" : "orange"} loading={busy} onClick={confirm}>
          {t(`requests.v2.review.${action}`)}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
