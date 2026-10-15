import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { requestError } from "@/pages/requests/requestErrors";

export function WorkspaceRequestCancel({ title, onClose, onConfirm, onConflict }: {
  title: string; onClose: () => void; onConfirm: () => Promise<void>; onConflict: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try { await onConfirm(); toast.success(t("requests.v2.cancelled")); }
    catch (failure) { setError(requestError(failure, t)); await onConflict(); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent><DialogHeader><DialogTitle>{t("requests.v2.cancelRequest")}</DialogTitle>
      <DialogDescription>{t("requests.v2.cancelHelp", { title })}</DialogDescription></DialogHeader>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={onClose}>{t("requests.v2.keepRequest")}</Button>
        <Button variant="destructive" loading={busy} onClick={confirm}>{t("requests.v2.cancelRequest")}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
