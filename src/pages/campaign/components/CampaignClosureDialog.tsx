import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { campaignService } from "../services/campaignService";
import { CANCEL_REASONS, type CancelReason, type Campaign, type CampaignClosure } from "../types";

export function CampaignClosureDialog({ workspaceId, campaign, onClose, onCompleted, onTasksChanged }: {
  workspaceId: string; campaign: Campaign; onClose: () => void;
  onCompleted: (value: Campaign) => void; onTasksChanged: () => void;
}) {
  const { t } = useTranslation();
  const [check, setCheck] = useState<CampaignClosure>();
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState<CancelReason | "">("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    campaignService.completionCheck(workspaceId, campaign.id).then(result => {
      if (active) { setCheck(result.data.data); setSelected([]); }
    }).catch(() => { if (active) setError(t("campaign.error")); });
    return () => { active = false; };
  }, [workspaceId, campaign.id, revision, t]);

  function resetCancellation() {
    setCancelOpen(false); setSelected([]); setReason(""); setNote(""); setConfirmed(false);
  }
  function failed(failure: unknown) {
    const code: unknown = isAxiosError(failure) ? failure.response?.data?.error?.code : undefined;
    const key = typeof code === "string" ? `campaign.errors.${code}` : "";
    setError(key && t(key) !== key ? t(key) : t("campaign.error"));
    setCheck(undefined); setRevision(value => value + 1); resetCancellation();
  }
  async function cancelSelected() {
    if (!check || !reason || busy || !cancelOpen || !confirmed) return;
    setBusy(true); setError("");
    try {
      const result = await campaignService.cancelTasks(workspaceId, campaign,
        check.unfinishedTasks.filter(task => selected.includes(task.id)), reason, note.trim());
      setCheck(result.data.data); resetCancellation();
      onTasksChanged();
    } catch (failure) { failed(failure); }
    finally { setBusy(false); }
  }
  async function complete() {
    if (!check?.canComplete || busy) return;
    setBusy(true); setError("");
    try {
      const result = await campaignService.complete(workspaceId, campaign, "");
      onCompleted(result.data.data);
    } catch (failure) { failed(failure); }
    finally { setBusy(false); }
  }
  const validBatch = selected.length > 0 && selected.length <= 100 && !!reason && (reason !== "OTHER" || !!note.trim());
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{t("campaign.closure.title")}</DialogTitle>
        <DialogDescription>{t("campaign.closure.description")}</DialogDescription></DialogHeader>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!check && <Button variant="outline" disabled={busy} onClick={() => setRevision(value => value + 1)}>
        {t("campaign.closure.reload")}</Button>}
      {check && <div className="space-y-5">
        {!check.deploymentComplete && <p role="alert" className="text-destructive">{t("campaign.errors.CAMPAIGN_DEPLOYMENT_INCOMPLETE")}</p>}
        {check.unlinkedRequestTaskCount > 0 && <p role="alert" className="text-destructive">{t("campaign.closure.legacy", { count: check.unlinkedRequestTaskCount })}</p>}
        <p className="bg-muted rounded-lg p-3 text-sm">{t("campaign.closure.pending", { count: check.pendingRequestCount })}</p>
        {check.reviewingRequests.length > 0 && <section className="space-y-2">
          <h3 className="font-semibold">{t("campaign.closure.reviewing")}</h3>
          <ul className="space-y-2">{check.reviewingRequests.map(request => <li key={request.id}>
            <Link className="break-words underline underline-offset-4" to={`/workspaces/${workspaceId}/requests?request=${request.id}`}>{request.title}</Link>
          </li>)}</ul><p className="text-muted-foreground text-sm">{t("campaign.closure.reviewingHelp")}</p>
        </section>}
        {check.unfinishedTasks.length > 0 && <section className="space-y-3">
          <h3 className="font-semibold" role="alert">{t("campaign.closure.unfinished", { count: check.unfinishedTasks.length })}</h3>
          <Button variant="outline" className="min-h-11 h-auto whitespace-normal text-left" disabled={busy}
            aria-expanded={cancelOpen} aria-controls="campaign-cancel-options"
            onClick={() => { if (cancelOpen) resetCancellation(); else setCancelOpen(true); }}>
            {t("campaign.closure.cancelOption")}</Button>
          <div id="campaign-cancel-options" className="space-y-3">
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">{check.unfinishedTasks.map(task => <li key={task.id}>
            {cancelOpen ? <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
              <input type="checkbox" className="mt-1 size-4 shrink-0" disabled={busy || (selected.length >= 100 && !selected.includes(task.id))} checked={selected.includes(task.id)}
                onChange={event => { setConfirmed(false); setSelected(previous => event.target.checked ? [...previous, task.id] : previous.filter(id => id !== task.id)); }} />
              <span className="min-w-0 break-words">{task.name}<span className="text-muted-foreground block text-sm">
                {t(`campaign.ui.taskStatuses.${task.status}`, { defaultValue: task.status })}</span></span>
            </label> : <div className="break-words py-2">{task.name}<p className="text-muted-foreground text-sm">
              {t(`campaign.ui.taskStatuses.${task.status}`, { defaultValue: task.status })}</p></div>}
          </li>)}</ul>
          {cancelOpen && <>
          <p className="text-muted-foreground text-sm">{t("campaign.closure.cancelHelp")}</p>
          <Label htmlFor="campaign-cancel-reason">{t("campaign.closure.reason")}</Label>
          <Select id="campaign-cancel-reason" value={reason} disabled={busy} onChange={event => { setReason(event.target.value as CancelReason | ""); setNote(""); setConfirmed(false); }}>
            <option value="">{t("campaign.closure.chooseReason")}</option>
            {CANCEL_REASONS.map(value => <option key={value} value={value}>{t(`campaign.closure.reasons.${value}`)}</option>)}
          </Select>
          {reason === "OTHER" && <div className="space-y-2"><Label htmlFor="campaign-cancel-note">{t("campaign.closure.otherRequired")}</Label>
            <Textarea id="campaign-cancel-note" required maxLength={2000} value={note} disabled={busy}
              onChange={event => { setNote(event.target.value); setConfirmed(false); }} /></div>}
          <p className="text-muted-foreground text-sm">{t("campaign.closure.selected", { count: selected.length })}</p>
          {confirmed && <p role="alert" className="text-destructive text-sm">{t("campaign.closure.confirmBatch", { count: selected.length, reason: reason ? t(`campaign.closure.reasons.${reason}`) : "" })}</p>}
          <Button variant="destructive" disabled={!validBatch || busy} loading={busy}
            onClick={() => { if (confirmed) void cancelSelected(); else setConfirmed(true); }}>
            {t(confirmed ? "campaign.closure.confirmCancel" : "campaign.closure.cancelSelected")}</Button>
          </>}
          </div>
        </section>}
        {!check.canComplete && <p className="text-muted-foreground text-sm">{t("campaign.closure.blocked")}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>{t("campaign.closure.close")}</Button>
          <Button variant="orange" disabled={!check.canComplete || busy} loading={busy} onClick={() => void complete()}>
            {t("campaign.delivery.complete")}</Button>
        </div>
      </div>}
    </DialogContent>
  </Dialog>;
}
