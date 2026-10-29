import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SocialPlatformBadge, SOCIAL_PLATFORMS } from "@/components/common/SocialPlatformBadge";
import { useDraftUnloadWarning } from "@/pages/media-package/hooks/useDraftUnloadWarning";
import { invalidRequestFields, requestError } from "@/pages/requests/requestErrors";
import { REQUEST_TYPES } from "@/pages/requests/types/workspaceRequest";
import type {
  RequestFields,
  RequestType,
  WorkspaceRequest,
} from "@/pages/requests/types/workspaceRequest";
import { useRequestDeadline } from "../hooks/useRequestDeadline";
import { localDateTime } from "../lib/requestDeadline";

export function WorkspaceRequestForm({
  workspaceId,
  request,
  onClose,
  onSave,
  onConflict,
}: {
  workspaceId: string;
  request: WorkspaceRequest | "new";
  onClose: () => void;
  onSave: (fields: RequestFields) => Promise<void>;
  onConflict: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const deadline = useRequestDeadline(workspaceId);
  const existing = request === "new" ? null : request;

  const initialPlatforms = existing?.targetPlatforms && existing.targetPlatforms.length > 0
    ? existing.targetPlatforms
    : existing?.type === "POST" || !existing
      ? ["FACEBOOK"]
      : [];

  const initial = {
    title: existing?.title ?? "",
    description: existing?.description ?? "",
    type: existing?.type ?? "POST",
    dueDate: existing ? localDateTime(existing.dueDate) : "",
    targetPlatforms: initialPlatforms,
  };

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

  const fieldError = (name: string) => {
    if (!invalid.includes(name)) return undefined;
    if (name === "dueDate") return t("requests.deadlineInvalid");
    if (name === "targetPlatforms") return t("requests.v2.errors.platformsRequired");
    return t("requests.v2.invalidField");
  };

  function close() {
    if (busy) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }

  function togglePlatform(platform: string) {
    if (busy) return;
    const current = fields.targetPlatforms ?? [];
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setFields({ ...fields, targetPlatforms: next });
    if (next.length > 0) {
      setInvalid((prev) => prev.filter((name) => name !== "targetPlatforms"));
      if (error === t("requests.v2.errors.platformsRequired")) {
        setError("");
      }
    }
  }

  function handleTypeChange(nextType: RequestType) {
    const nextPlatforms = nextType === "POST"
      ? (fields.targetPlatforms && fields.targetPlatforms.length > 0 ? fields.targetPlatforms : ["FACEBOOK"])
      : [];
    setFields({ ...fields, type: nextType, targetPlatforms: nextPlatforms });
    if (nextType !== "POST") {
      setInvalid((prev) => prev.filter((name) => name !== "targetPlatforms"));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current || !deadline.window || deadline.isError || deadline.isFetching) return;
    if (!dueRef.current?.checkValidity()) {
      setInvalid(["dueDate"]);
      dueRef.current?.reportValidity();
      return;
    }
    if (fields.type === "POST" && (!fields.targetPlatforms || fields.targetPlatforms.length === 0)) {
      setInvalid(["targetPlatforms"]);
      setError(t("requests.v2.errors.platformsRequired"));
      return;
    }

    inFlight.current = true;
    setBusy(true);
    setError("");
    setInvalid([]);

    try {
      const dueDate = existing && fields.dueDate === initial.dueDate
        ? existing.dueDate
        : new Date(fields.dueDate).toISOString();
      await onSave({
        ...fields,
        title: fields.title.trim(),
        dueDate,
        targetPlatforms: fields.type === "POST" ? fields.targetPlatforms : [],
      });
      toast.success(t("requests.v2.saved"));
    } catch (failure) {
      setError(requestError(failure, t));
      setInvalid(invalidRequestFields(failure));
      await onConflict();
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(existing ? "requests.v2.edit" : "requests.v2.create")}</DialogTitle>
          <DialogDescription>{t("requests.v2.formHelp")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div ref={summaryRef} role="alert" tabIndex={-1} className="text-destructive rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p>{error}</p>
              {invalid.map((name) => (
                <a key={name} href={`#request-${name}`} className="block underline text-xs mt-1">
                  {name === "targetPlatforms" ? t("requests.v2.fields.platforms") : t(`requests.v2.fields.${name}`)}
                </a>
              ))}
            </div>
          )}

          <Input
            id="request-title"
            label={t("requests.v2.fields.title")}
            required
            maxLength={255}
            value={fields.title}
            disabled={busy}
            error={fieldError("title")}
            onChange={(e) => setFields({ ...fields, title: e.target.value })}
          />

          <div className="space-y-1.5">
            <Label htmlFor="request-description">{t("requests.v2.fields.description")}</Label>
            <Textarea
              id="request-description"
              maxLength={10000}
              value={fields.description}
              disabled={busy}
              aria-invalid={invalid.includes("description")}
              aria-describedby="request-description-error"
              onChange={(e) => setFields({ ...fields, description: e.target.value })}
            />
            <p id="request-description-error" className="text-destructive text-sm">{fieldError("description")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="request-type">{t("requests.v2.fields.type")}</Label>
              <Select
                id="request-type"
                value={fields.type}
                disabled={busy}
                aria-invalid={invalid.includes("type")}
                aria-describedby="request-type-error"
                onChange={(e) => handleTypeChange(e.target.value as RequestType)}
              >
                {REQUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`requests.v2.types.${type}`)}
                  </option>
                ))}
              </Select>
              <p id="request-type-error" className="text-destructive text-sm">{fieldError("type")}</p>
            </div>

            <Input
              ref={dueRef}
              id="request-dueDate"
              type="datetime-local"
              required
              className="[color-scheme:light] dark:[color-scheme:dark]"
              disabled={busy || !deadline.window || deadline.isFetching || deadline.isError}
              min={deadline.window?.min}
              max={deadline.window?.max}
              aria-describedby="request-deadline-help"
              label={t("requests.v2.fields.dueDate")}
              value={fields.dueDate}
              error={fieldError("dueDate")}
              onInvalid={() => setInvalid((prev) => [...new Set([...prev, "dueDate"])])}
              onChange={(e) => {
                setFields({ ...fields, dueDate: e.target.value });
                setInvalid((prev) => prev.filter((name) => name !== "dueDate"));
              }}
            />
          </div>

          {fields.type === "POST" && (
            <div id="request-targetPlatforms" className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Label id="request-platforms-label" className="text-foreground text-sm font-medium">
                  {t("requests.v2.fields.platforms")}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <span className="text-muted-foreground text-xs">
                  {t("requests.v2.fields.platformsHelp")}
                </span>
              </div>
              <div
                role="group"
                aria-labelledby="request-platforms-label"
                className="flex flex-wrap gap-2 pt-1"
              >
                {SOCIAL_PLATFORMS.map((platform) => (
                  <SocialPlatformBadge
                    key={platform}
                    platform={platform}
                    size="sm"
                    interactive
                    disabled={busy}
                    selected={fields.targetPlatforms?.includes(platform)}
                    onClick={() => togglePlatform(platform)}
                  />
                ))}
              </div>
              {invalid.includes("targetPlatforms") && (
                <p className="text-destructive text-sm" role="alert">
                  {t("requests.v2.errors.platformsRequired")}
                </p>
              )}
            </div>
          )}

          <div id="request-deadline-help" className="text-muted-foreground space-y-2 text-sm" aria-live="polite">
            <p>{t("requests.deadlineHelp")}</p>
            {deadline.isFetching ? (
              <p>{t("requests.deadlineLoading")}</p>
            ) : deadline.isError ? (
              <>
                <p role="alert" className="text-destructive">{t("requests.deadlineUnavailable")}</p>
                <Button type="button" variant="outline" onClick={() => void deadline.refetch()}>
                  {t("requests.v2.retry")}
                </Button>
              </>
            ) : deadline.window ? (
              <p>
                {t("requests.deadlineRange", {
                  start: deadline.window.min.replace("T", " "),
                  end: deadline.window.max.replace("T", " "),
                  timezone: deadline.window.timezone,
                })}
              </p>
            ) : (
              <p role="alert">{t("requests.deadlineEmpty")}</p>
            )}
          </div>

          {confirmDiscard && (
            <div className="rounded-xl border border-border p-3" role="alert">
              <p className="mb-3 text-sm">{t("requests.v2.discardPrompt")}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setConfirmDiscard(false)}>
                  {t("requests.v2.keepEditing")}
                </Button>
                <Button type="button" variant="destructive" onClick={onClose}>
                  {t("requests.v2.discard")}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={close}>
              {t("requests.v2.close")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              loading={busy}
              disabled={!deadline.window || deadline.isError || deadline.isFetching}
            >
              {t("requests.v2.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
