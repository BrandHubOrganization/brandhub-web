import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDraftUnloadWarning } from "@/pages/media-package/hooks/useDraftUnloadWarning";
import { invalidRequestFields, requestError } from "@/pages/requests/requestErrors";
import { REQUEST_TYPES } from "@/pages/requests/types/workspaceRequest";
import type { RequestFields, RequestType, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";
import { useRequestDeadline } from "../hooks/useRequestDeadline";
import { localDateTime } from "../lib/requestDeadline";

export function WorkspaceRequestForm({ workspaceId, request, onClose, onSave, onConflict }: {
  workspaceId: string; request: WorkspaceRequest | "new"; onClose: () => void;
  onSave: (fields: RequestFields) => Promise<void>; onConflict: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const deadline = useRequestDeadline(workspaceId);
  const existing = request === "new" ? null : request;
  const initial = { title: existing?.title ?? "", description: existing?.description ?? "",
    type: existing?.type ?? "POST", dueDate: existing ? localDateTime(existing.dueDate) : "" };
  const [fields, setFields] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<string[]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const dirty = JSON.stringify(fields) !== JSON.stringify(initial);
  useDraftUnloadWarning(dirty);
  const fieldError = (name: string) => invalid.includes(name)
    ? t(name === "dueDate" ? "requests.deadlineInvalid" : "requests.v2.invalidField") : undefined;
  function close() { if (busy) return; if (dirty) setConfirmDiscard(true); else onClose(); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current || !deadline.window || deadline.isError || deadline.isFetching) return;
    if (!dueRef.current?.checkValidity()) { setInvalid(["dueDate"]); dueRef.current?.reportValidity(); return; }
    inFlight.current = true;
    setBusy(true); setError(""); setInvalid([]);
    try {
      const dueDate = existing && fields.dueDate === initial.dueDate
        ? existing.dueDate : new Date(fields.dueDate).toISOString();
      await onSave({ ...fields, title: fields.title.trim(), dueDate });
      toast.success(t("requests.v2.saved"));
    } catch (failure) {
      setError(requestError(failure, t)); setInvalid(invalidRequestFields(failure));
      await onConflict();
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open) close(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{t(existing ? "requests.v2.edit" : "requests.v2.create")}</DialogTitle>
        <DialogDescription>{t("requests.v2.formHelp")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        {error && <div ref={summaryRef} role="alert" tabIndex={-1} className="text-destructive rounded-md border p-3">
          <p>{error}</p>{invalid.map(name => <a key={name} href={`#request-${name}`} className="block underline">
            {t(`requests.v2.fields.${name}`)}</a>)}
        </div>}
        <Input id="request-title" label={t("requests.v2.fields.title")} required maxLength={255}
          value={fields.title} disabled={busy} error={fieldError("title")}
          onChange={event => setFields({ ...fields, title: event.target.value })} />
        <div className="space-y-1.5"><Label htmlFor="request-description">{t("requests.v2.fields.description")}</Label>
          <Textarea id="request-description" maxLength={10000} value={fields.description} disabled={busy}
            aria-invalid={invalid.includes("description")} aria-describedby="request-description-error"
            onChange={event => setFields({ ...fields, description: event.target.value })} />
          <p id="request-description-error" className="text-destructive text-sm">{fieldError("description")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="request-type">{t("requests.v2.fields.type")}</Label>
            <Select id="request-type" value={fields.type} disabled={busy}
              aria-invalid={invalid.includes("type")} aria-describedby="request-type-error"
              onChange={event => setFields({ ...fields, type: event.target.value as RequestType })}>
              {REQUEST_TYPES.map(type => <option key={type} value={type}>{t(`requests.v2.types.${type}`)}</option>)}
            </Select>
            <p id="request-type-error" className="text-destructive text-sm">{fieldError("type")}</p>
          </div>
          <Input ref={dueRef} id="request-dueDate" type="datetime-local" required
            className="[color-scheme:light] dark:[color-scheme:dark]"
            disabled={busy || !deadline.window || deadline.isFetching || deadline.isError}
            min={deadline.window?.min} max={deadline.window?.max} aria-describedby="request-deadline-help"
            label={t("requests.v2.fields.dueDate")} value={fields.dueDate} error={fieldError("dueDate")}
            onInvalid={() => setInvalid(previous => [...new Set([...previous, "dueDate"])])}
            onChange={event => { setFields({ ...fields, dueDate: event.target.value });
              setInvalid(previous => previous.filter(name => name !== "dueDate")); }} />
        </div>
        <div id="request-deadline-help" className="text-muted-foreground space-y-2 text-sm" aria-live="polite">
          <p>{t("requests.deadlineHelp")}</p>
          {deadline.isFetching ? <p>{t("requests.deadlineLoading")}</p> : deadline.isError
            ? <><p role="alert" className="text-destructive">{t("requests.deadlineUnavailable")}</p>
              <Button type="button" variant="outline" onClick={() => void deadline.refetch()}>{t("requests.v2.retry")}</Button></>
            : deadline.window ? <p>{t("requests.deadlineRange", { start: deadline.window.min.replace("T", " "),
              end: deadline.window.max.replace("T", " "), timezone: deadline.window.timezone })}</p>
              : <p role="alert">{t("requests.deadlineEmpty")}</p>}
        </div>
        {confirmDiscard && <div className="rounded-xl border p-3" role="alert">
          <p className="mb-3 text-sm">{t("requests.v2.discardPrompt")}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDiscard(false)}>{t("requests.v2.keepEditing")}</Button>
            <Button type="button" variant="destructive" onClick={onClose}>{t("requests.v2.discard")}</Button>
          </div>
        </div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={close}>{t("requests.v2.close")}</Button>
          <Button type="submit" variant="orange" loading={busy}
            disabled={!deadline.window || deadline.isError || deadline.isFetching}>{t("requests.v2.save")}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
