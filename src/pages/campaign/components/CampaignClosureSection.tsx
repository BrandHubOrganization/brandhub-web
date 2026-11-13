import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { AlertTriangle, Pin, RefreshCw, X } from "lucide-react";
import { HoldButton, StatusMark } from "@/components/micro";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { campaignService } from "../services/campaignService";
import { CANCEL_REASONS, type CancelReason, type Campaign } from "../types";

function ClosureContent({
  workspaceId,
  campaign,
  onClose,
  onCompleted,
  onTasksChanged,
  onDismissLockChange,
  pinAction,
}: {
  workspaceId: string;
  campaign: Campaign;
  onClose: () => void;
  onCompleted: (value: Campaign) => void;
  onTasksChanged: () => void;
  onDismissLockChange: (locked: boolean) => void;
  pinAction: ReactNode;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = [
    "campaign-completion",
    workspaceId,
    campaign.id,
    campaign.contentVersion,
  ];
  const query = useQuery({
    queryKey,
    queryFn: async () =>
      (await campaignService.completionCheck(workspaceId, campaign.id)).data
        .data,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const check = query.isError ? undefined : query.data;
  const loading = query.isFetching;
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState<CancelReason | "">("");
  const [note, setNote] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);
  useEffect(() => {
    onDismissLockChange(
      busy || cancelOpen || confirmDialogOpen || completeOpen,
    );
  }, [busy, cancelOpen, confirmDialogOpen, completeOpen, onDismissLockChange]);

  function resetCancellation() {
    setCancelOpen(false);
    setSelected([]);
    setReason("");
    setNote("");
    setConfirmDialogOpen(false);
  }
  function failed(failure: unknown) {
    const code: unknown = isAxiosError(failure)
      ? failure.response?.data?.error?.code
      : undefined;
    const key = typeof code === "string" ? `campaign.errors.${code}` : "";
    setError(key && t(key) !== key ? t(key) : t("campaign.error"));
    void query.refetch();
    resetCancellation();
  }
  async function cancelSelected() {
    if (!check || !validBatch || !reason || busy || !cancelOpen) return;
    setBusy(true);
    setError("");
    try {
      const result = await campaignService.cancelTasks(
        workspaceId,
        campaign,
        check.unfinishedTasks.filter((task) => selected.includes(task.id)),
        reason,
        note.trim(),
      );
      queryClient.setQueryData(queryKey, result.data.data);
      resetCancellation();
      onTasksChanged();
    } catch (failure) {
      failed(failure);
    } finally {
      setBusy(false);
    }
  }
  async function complete() {
    if (!check?.canComplete || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await campaignService.complete(workspaceId, campaign, "");
      onCompleted(result.data.data);
    } catch (failure) {
      failed(failure);
    } finally {
      setBusy(false);
    }
  }
  const validBatch =
    selected.length > 0 &&
    selected.length <= 100 &&
    !!reason &&
    (reason !== "OTHER" || !!note.trim());
  return (
    <div className="space-y-3 text-sm" aria-busy={loading || busy}>
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <h2 className="font-semibold">{t("campaign.closure.title")}</h2>
        <div className="flex gap-1">
          {pinAction}
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={t("campaign.closure.reload")}
            disabled={busy || loading}
            onClick={() => {
              setError("");
              setSelected([]);
              void query.refetch();
            }}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={t("campaign.closure.close")}
            disabled={busy}
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {loading && (
        <div
          role="status"
          aria-label={t("campaign.closure.loading")}
          className="space-y-3"
        >
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      )}
      {(error || query.isError) && (
        <p role="alert" className="text-destructive">
          {error || t("campaign.error")}
        </p>
      )}
      {!check && !loading && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            setSelected([]);
            void query.refetch();
          }}
        >
          {t("campaign.closure.reload")}
        </Button>
      )}
      {check && !loading && (
        <div className="space-y-3">
          <ul className="bg-muted/50 space-y-2.5 rounded-lg p-3">
            {(
              [
                [
                  t("campaign.closure.checkDeployment"),
                  check.deploymentComplete,
                ],
                [
                  t("campaign.closure.checkTasks"),
                  check.unfinishedTasks.length === 0,
                ],
                [
                  t("campaign.closure.checkRequests"),
                  check.reviewingRequests.length === 0,
                ],
                [
                  t("campaign.closure.checkLinks"),
                  check.unlinkedRequestTaskCount === 0,
                ],
              ] as [string, boolean][]
            ).map(([label, ready]) => (
              <li key={label} className="flex items-start gap-2">
                <StatusMark
                  state={ready ? "success" : "idle"}
                  tone="orange"
                  size="sm"
                  className="mt-0.5"
                />
                <span>{label}</span>
              </li>
            ))}
          </ul>
          {!check.deploymentComplete && (
            <p role="alert" className="text-destructive">
              {t("campaign.errors.CAMPAIGN_DEPLOYMENT_INCOMPLETE")}
            </p>
          )}
          {check.unlinkedRequestTaskCount > 0 && (
            <p role="alert" className="text-destructive">
              {t("campaign.closure.legacy", {
                count: check.unlinkedRequestTaskCount,
              })}
            </p>
          )}
          {check.pendingRequestCount > 0 && (
            <p className="bg-brand-orange/10 rounded-lg p-3 text-sm">
              {t("campaign.closure.pending", {
                count: check.pendingRequestCount,
              })}
            </p>
          )}
          {check.reviewingRequests.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-semibold">
                {t("campaign.closure.reviewing")}
              </h3>
              <ul className="space-y-2">
                {check.reviewingRequests.map((request) => (
                  <li key={request.id}>
                    <Link
                      className="break-words underline underline-offset-4"
                      to={`/workspaces/${workspaceId}/requests?request=${request.id}`}
                    >
                      {request.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm">
                {t("campaign.closure.reviewingHelp")}
              </p>
            </section>
          )}
          {check.unfinishedTasks.length > 0 && (
            <details className="space-y-3" open={cancelOpen || undefined}>
              <summary className="cursor-pointer font-semibold">
                {t("campaign.closure.unfinished", {
                  count: check.unfinishedTasks.length,
                })}
              </summary>
              <Button
                variant="outline"
                className="h-auto min-h-11 text-left whitespace-normal"
                disabled={busy}
                aria-expanded={cancelOpen}
                aria-controls="campaign-cancel-options"
                onClick={() => {
                  if (cancelOpen) resetCancellation();
                  else setCancelOpen(true);
                }}
              >
                {t("campaign.closure.cancelOption")}
              </Button>
              <div id="campaign-cancel-options" className="space-y-3">
                <ul className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {check.unfinishedTasks.map((task) => (
                    <li key={task.id}>
                      {cancelOpen ? (
                        <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
                          <input
                            type="checkbox"
                            className="mt-1 size-4 shrink-0"
                            disabled={
                              busy ||
                              (selected.length >= 100 &&
                                !selected.includes(task.id))
                            }
                            checked={selected.includes(task.id)}
                            onChange={(event) => {
                              setSelected((previous) =>
                                event.target.checked
                                  ? [...previous, task.id]
                                  : previous.filter((id) => id !== task.id),
                              );
                            }}
                          />
                          <span className="min-w-0 break-words">
                            {task.name}
                            <span className="text-muted-foreground block text-sm">
                              {t(`campaign.ui.taskStatuses.${task.status}`, {
                                defaultValue: task.status,
                              })}
                            </span>
                          </span>
                        </label>
                      ) : (
                        <div className="py-2 break-words">
                          {task.name}
                          <p className="text-muted-foreground text-sm">
                            {t(`campaign.ui.taskStatuses.${task.status}`, {
                              defaultValue: task.status,
                            })}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {cancelOpen && (
                  <>
                    <p className="text-muted-foreground text-sm">
                      {t("campaign.closure.cancelHelp")}
                    </p>
                    <Label htmlFor="campaign-cancel-reason">
                      {t("campaign.closure.reason")}
                    </Label>
                    <Select
                      id="campaign-cancel-reason"
                      value={reason}
                      disabled={busy}
                      onChange={(event) => {
                        setReason(event.target.value as CancelReason | "");
                        setNote("");
                      }}
                    >
                      <option value="">
                        {t("campaign.closure.chooseReason")}
                      </option>
                      {CANCEL_REASONS.map((value) => (
                        <option key={value} value={value}>
                          {t(`campaign.closure.reasons.${value}`)}
                        </option>
                      ))}
                    </Select>
                    {reason === "OTHER" && (
                      <div className="space-y-2">
                        <RichTextInput
                          id="campaign-cancel-note"
                          label={t("campaign.closure.otherRequired")}
                          value={note}
                          disabled={busy}
                          onChange={setNote}
                        />
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {t("campaign.closure.selected", {
                        count: selected.length,
                      })}
                    </p>

                    <Button
                      variant="destructive"
                      disabled={!validBatch || busy}
                      loading={busy}
                      onClick={() => setConfirmDialogOpen(true)}
                    >
                      {t("campaign.closure.cancelSelected")}
                    </Button>

                    <Dialog
                      open={confirmDialogOpen}
                      onOpenChange={(open) => {
                        if (!busy) setConfirmDialogOpen(open);
                      }}
                    >
                      <DialogContent className="z-[80] sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-destructive flex items-center gap-2 text-base font-bold">
                            <AlertTriangle className="size-5 shrink-0" />
                            {t("campaign.closure.confirmCancel")}
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                            {t("campaign.closure.confirmBatch", {
                              count: selected.length,
                              reason: reason
                                ? t(`campaign.closure.reasons.${reason}`)
                                : "",
                            })}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="bg-destructive/5 border-destructive/20 space-y-2 rounded-lg border p-3.5 text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-destructive font-medium">
                              {t("campaign.closure.selected", {
                                count: selected.length,
                              })}
                            </span>
                            <Badge variant="destructive" className="text-2xs">
                              {reason
                                ? t(`campaign.closure.reasons.${reason}`)
                                : ""}
                            </Badge>
                          </div>
                          {note.trim() && (
                            <p className="text-muted-foreground border-destructive/15 border-t pt-1.5 break-words italic">
                              &ldquo;{note.trim()}&rdquo;
                            </p>
                          )}
                          <div className="border-destructive/15 no-scrollbar max-h-36 space-y-1.5 overflow-y-auto border-t pt-2">
                            {check.unfinishedTasks
                              .filter((task) => selected.includes(task.id))
                              .map((task) => (
                                <div
                                  key={task.id}
                                  className="text-foreground/80 flex items-center gap-2 truncate text-xs"
                                >
                                  <span className="bg-destructive size-1.5 shrink-0 rounded-full" />
                                  <span className="truncate">{task.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => setConfirmDialogOpen(false)}
                          >
                            {t("campaign.cancel")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={busy}
                            loading={busy}
                            onClick={async () => {
                              await cancelSelected();
                              setConfirmDialogOpen(false);
                            }}
                          >
                            {t("campaign.closure.confirmCancel")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </details>
          )}
          {!check.canComplete && (
            <p className="text-muted-foreground text-sm">
              {t("campaign.closure.blocked")}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" disabled={busy} onClick={onClose}>
              {t("campaign.closure.close")}
            </Button>
            <Button
              variant="orange"
              disabled={!check.canComplete || busy}
              loading={busy}
              onClick={() => setCompleteOpen(true)}
            >
              {t("campaign.delivery.complete")}
            </Button>
          </div>
        </div>
      )}
      <Dialog
        open={completeOpen}
        onOpenChange={(open) => {
          if (!busy) setCompleteOpen(open);
        }}
      >
        <DialogContent className="z-[80] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("campaign.closure.confirmComplete")}</DialogTitle>
            <DialogDescription>
              {t("campaign.closure.completeDescription")}
            </DialogDescription>
          </DialogHeader>
          {!!check?.pendingRequestCount && (
            <p className="bg-brand-orange/10 rounded-lg p-3 text-sm">
              {t("campaign.closure.pending", {
                count: check.pendingRequestCount,
              })}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setCompleteOpen(false)}
            >
              {t("campaign.cancel")}
            </Button>
            <HoldButton
              size="default"
              durationMs={850}
              loading={busy}
              disabled={!check?.canComplete || busy}
              holdHint={t("campaign.closure.holdToComplete", {
                defaultValue: "Giữ để hoàn thành",
              })}
              onCommit={async () => {
                await complete();
                setCompleteOpen(false);
              }}
            >
              {t("campaign.delivery.complete")}
            </HoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CampaignClosureSection(
  props: Omit<
    Parameters<typeof ClosureContent>[0],
    "onClose" | "onDismissLockChange" | "pinAction"
  >,
) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dismissLocked, setDismissLocked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const show = () => {
    clearTimer();
    setOpen(true);
  };
  const hide = () => {
    clearTimer();
    if (!pinned) timer.current = setTimeout(() => setOpen(false), 220);
  };
  const close = () => {
    clearTimer();
    setOpen(false);
    setPinned(false);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (!value && !pinned) close();
      }}
    >
      <PopoverAnchor asChild>
        <Button
          data-campaign-complete
          variant="orange"
          size="sm"
          aria-expanded={open}
          aria-haspopup="dialog"
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              show();
              setPinned(true);
              requestAnimationFrame(() =>
                contentRef.current
                  ?.querySelector<HTMLButtonElement>("button")
                  ?.focus(),
              );
            }
          }}
          onClick={() => {
            show();
            setPinned(true);
          }}
        >
          {t("campaign.timeline.closeCampaign")}
        </Button>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        align="end"
        aria-label={t("campaign.closure.title")}
        className="max-h-[min(640px,var(--radix-popover-content-available-height))] w-[min(440px,calc(100vw-24px))] overflow-y-auto p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={() => {
          clearTimer();
          setPinned(true);
        }}
        onPointerDownCapture={() => setPinned(true)}
        onEscapeKeyDown={(e) => {
          if (dismissLocked) e.preventDefault();
          else close();
        }}
        onInteractOutside={(e) => {
          if (pinned) e.preventDefault();
        }}
      >
        <ClosureContent
          {...props}
          pinAction={
            <Button
              size="icon"
              variant={pinned ? "secondary" : "ghost"}
              className="size-7"
              aria-label={t("campaign.closure.pin")}
              aria-pressed={pinned}
              onClick={() => setPinned((v) => !v)}
            >
              <Pin className="size-3.5" />
            </Button>
          }
          onDismissLockChange={setDismissLocked}
          onClose={close}
          onCompleted={(value) => {
            close();
            props.onCompleted(value);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
