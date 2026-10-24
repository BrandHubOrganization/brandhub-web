import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  GripVertical,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Layers,
  History,
  Check,
  Ban,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { WorkspaceRequestTask } from "@/pages/requests/components/WorkspaceRequestTask";
import { useResizablePanelWidth } from "@/pages/tasks/hooks/useResizablePanelWidth";
import type { ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

export function WorkspaceRequestDetail({
  isOpen = true,
  request,
  loading,
  error,
  onClose,
  onRetry,
  onEdit,
  onCancel,
  onReview,
}: {
  isOpen?: boolean;
  request?: WorkspaceRequest;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
  onEdit: (request: WorkspaceRequest) => void;
  onCancel: (request: WorkspaceRequest) => void;
  onReview: (request: WorkspaceRequest, action: ReviewAction) => void;
}) {
  const { t, i18n } = useTranslation();
  const date = (value: string) => new Date(value).toLocaleString(i18n.language);

  const { width, panelRef, onMouseDown } = useResizablePanelWidth(
    560,
    380,
    850,
    "brandhub_workspace_request_panel_width",
  );

  // Giữ lại request gần nhất khi animation đóng đang trượt ra
  // để nội dung không bị biến mất đột ngột làm giật layout
  const lastActiveRequest = useRef<WorkspaceRequest | undefined>(request);
  if (request) {
    lastActiveRequest.current = request;
  }
  const displayRequest = request || lastActiveRequest.current;

  // Tính số ngày còn lại đến hạn
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = displayRequest?.dueDate ? new Date(displayRequest.dueDate) : null;
  if (deadlineDate) deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const historyEvents = displayRequest?.history ?? [];
  const visibleEvents =
    isHistoryExpanded || historyEvents.length <= 3
      ? historyEvents
      : historyEvents.slice(0, 3);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        ref={panelRef}
        side="right"
        showOverlay={false}
        id="workspace-request-detail-panel"
        style={{ width: `${width}px`, maxWidth: "92vw" }}
        className="border-border bg-card fixed inset-y-0 right-0 z-[60] flex h-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-none md:max-w-none lg:max-w-none [&>button]:hidden !duration-300 !transition-transform"
      >
        {/* Resize Handle ở mép trái */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize request panel width"
          onMouseDown={onMouseDown}
          className="group hover:bg-brand-orange/20 active:bg-brand-orange/40 absolute top-0 -left-1.5 z-50 flex h-full w-3 cursor-col-resize items-center justify-center transition-colors"
        >
          <div className="bg-border group-hover:bg-brand-orange group-active:bg-brand-orange flex h-10 w-1 items-center justify-center rounded-full transition-colors">
            <GripVertical className="text-muted-foreground group-hover:text-brand-orange size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Header Panel */}
        <SheetHeader className="border-border bg-card shrink-0 flex-row items-center justify-between gap-3 border-b px-6 py-4 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-brand-orange/10 text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-xl">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-foreground text-base font-semibold truncate">
                {displayRequest?.title ?? t("requests.v2.detail")}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs truncate">
                {t("requests.v2.detailHelp")}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-8 rounded-lg"
              aria-label={t("requests.v2.close")}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6 text-brand-orange" />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm space-y-2"
            >
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={onRetry}>
                {t("requests.v2.retry")}
              </Button>
            </div>
          )}

          {displayRequest && !error && (
            <div className="space-y-5">
              {/* Main Info Card */}
              <div className="border-border/80 bg-muted/20 space-y-3.5 rounded-xl border p-4.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-semibold text-xs border-brand-orange/40 text-brand-orange bg-brand-orange/5">
                      {t(`requests.v2.status.${displayRequest.status}`)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t(`requests.v2.types.${displayRequest.type}`)}
                    </Badge>
                    <span className="text-muted-foreground text-2xs font-mono">
                      {t("requests.v2.version")} {displayRequest.version}
                    </span>
                  </div>
                  {diffDays !== null && (
                    <div>
                      {diffDays < 0 ? (
                        <span className="bg-destructive/10 text-destructive border-destructive/20 inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold border">
                          <AlertCircle className="size-3" />
                          Quá hạn {Math.abs(diffDays)} ngày
                        </span>
                      ) : diffDays === 0 ? (
                        <span className="bg-amber-500/10 text-amber-600 border-amber-500/20 inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold border">
                          Hạn chót hôm nay
                        </span>
                      ) : (
                        <span className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold border">
                          Còn {diffDays} ngày
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="pt-1">
                  <p className="text-foreground whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {displayRequest.description || t("requests.v2.noDescription")}
                  </p>
                </div>

                {/* Metadata Grid */}
                <dl className="grid gap-3 pt-3 border-t border-border/50 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {t("requests.v2.fields.dueDate")}
                    </dt>
                    <dd className="text-foreground font-medium mt-0.5 font-mono">
                      {date(displayRequest.dueDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-muted-foreground" />
                      {t("requests.v2.version")}
                    </dt>
                    <dd className="text-foreground font-medium mt-0.5 font-mono">
                      Phiên bản {displayRequest.version}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {t("requests.v2.createdAt")}
                    </dt>
                    <dd className="text-foreground font-medium mt-0.5 font-mono">
                      {date(displayRequest.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {t("requests.v2.updatedAt")}
                    </dt>
                    <dd className="text-foreground font-medium mt-0.5 font-mono">
                      {date(displayRequest.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Locked note if cannot edit */}
              {!displayRequest.canEdit && (
                <div className="border-border/80 bg-muted/30 text-muted-foreground flex items-center gap-2.5 rounded-xl border p-3.5 text-xs">
                  <AlertCircle className="size-4 shrink-0 text-amber-500" />
                  <span>{t("requests.v2.locked")}</span>
                </div>
              )}

              {/* Decision Note */}
              {displayRequest.decisionNote && (
                <div className="border-border/80 bg-muted/20 space-y-1.5 rounded-xl border p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <FileText className="size-3.5 text-brand-orange" />
                    <span>{t("requests.v2.review.decisionNote")}</span>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed pl-5 italic">
                    "{displayRequest.decisionNote}"
                  </p>
                </div>
              )}

              {/* Generated Task Card */}
              {displayRequest.generatedTaskId && (
                <WorkspaceRequestTask
                  workspaceId={displayRequest.workspaceId}
                  requestId={displayRequest.id}
                />
              )}

              {/* History Timeline with P2 accordion limit */}
              <section className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-brand-orange" />
                    <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                      {t("requests.v2.history")}
                    </h3>
                  </div>
                  {historyEvents.length > 0 && (
                    <span className="text-muted-foreground font-mono text-2xs">
                      {historyEvents.length} {t("requests.v2.historyEvents", { defaultValue: "sự kiện" })}
                    </span>
                  )}
                </div>

                {!historyEvents.length ? (
                  <p className="text-muted-foreground text-xs italic">
                    {t("requests.v2.noHistory")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className={isHistoryExpanded ? "max-h-64 overflow-y-auto overscroll-contain pr-1" : ""}>
                      <ol className="border-border/80 relative ml-3 space-y-4 border-l-2 pl-4 py-1">
                        {visibleEvents.map((event, index) => (
                          <li key={`${event.version}-${index}`} className="relative space-y-1">
                            <span className="border-card bg-brand-orange ring-brand-orange/30 absolute top-1 -left-[23px] size-2.5 rounded-full ring-2" />
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="text-foreground text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="size-3 text-brand-orange" />
                                {t(`requests.v2.events.${event.action}`)} · {t("requests.v2.version")}{" "}
                                {event.version}
                              </span>
                              <time
                                dateTime={event.at}
                                className="text-muted-foreground font-mono text-2xs"
                              >
                                {date(event.at)}
                              </time>
                            </div>
                            {event.note && (
                              <p className="text-muted-foreground text-xs whitespace-pre-wrap break-words pl-4.5">
                                {event.note === "CAMPAIGN_COMPLETED"
                                  ? t("requests.cancelledByCompletion")
                                  : event.note}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {historyEvents.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className="text-muted-foreground hover:text-foreground h-8 text-xs w-full justify-center rounded-xl"
                      >
                        {isHistoryExpanded ? (
                          <>
                            <ChevronUp className="size-3.5 mr-1.5" />
                            {t("requests.v2.collapseHistory")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-3.5 mr-1.5" />
                            {t("requests.v2.viewAllHistory", { count: historyEvents.length })}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {displayRequest && (
          <div className="border-border bg-card/90 backdrop-blur-sm shrink-0 flex flex-wrap items-center justify-end gap-2 border-t p-4 px-6">
            {displayRequest.canReceive && (
              <Button
                variant="orange"
                size="sm"
                onClick={() => onReview(displayRequest, "receive")}
                className="text-xs"
              >
                <Check className="size-3.5 mr-1.5" />
                {t("requests.v2.review.receive")}
              </Button>
            )}
            {displayRequest.canDeny && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReview(displayRequest, "deny")}
                className="text-xs"
              >
                <Ban className="size-3.5 mr-1.5" />
                {t("requests.v2.review.deny")}
              </Button>
            )}
            {displayRequest.canAccept && (
              <Button
                variant="orange"
                size="sm"
                onClick={() => onReview(displayRequest, "accept")}
                className="text-xs"
              >
                <Check className="size-3.5 mr-1.5" />
                {t("requests.v2.review.accept")}
              </Button>
            )}
            {displayRequest.canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(displayRequest)}
                className="text-xs"
              >
                <Ban className="size-3.5 mr-1.5" />
                {t("requests.v2.cancelRequest")}
              </Button>
            )}
            {displayRequest.canEdit && (
              <Button
                variant="orange"
                size="sm"
                onClick={() => onEdit(displayRequest)}
                className="text-xs"
              >
                <Edit3 className="size-3.5 mr-1.5" />
                {t("requests.v2.edit")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              {t("requests.v2.close")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
