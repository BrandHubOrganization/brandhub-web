import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  History,
  Inbox,
  Layers,
  Lock,
  Pencil,
  PlayCircle,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { WorkspaceRequestTask } from "@/pages/requests/components/WorkspaceRequestTask";
import type { ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

function getRequestStatusConfig(status: string) {
  switch (status) {
    case "PENDING":
      return {
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        icon: Clock,
      };
    case "ACCEPTED":
      return {
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      };
    case "DENIED":
    case "CANCELLED":
      return {
        className:
          "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
        icon: XCircle,
      };
    case "IN_PROGRESS":
      return {
        className:
          "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        icon: PlayCircle,
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-border",
        icon: AlertCircle,
      };
  }
}

export function WorkspaceRequestDetail({
  request,
  loading,
  error,
  onClose,
  onRetry,
  onEdit,
  onCancel,
  onReview,
}: {
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

  const statusConfig = request ? getRequestStatusConfig(request.status) : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex flex-col max-h-[88dvh] sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-border/80 shadow-lg">
        {/* Fixed Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/50 bg-card">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground line-clamp-1">
              {request?.title ?? t("requests.v2.detail")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("requests.v2.detailHelp")}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
              <Spinner />
              <span>Đang tải thông tin...</span>
            </div>
          )}

          {error && (
            <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              <p className="text-sm font-medium">{error}</p>
              <Button size="sm" variant="outline" onClick={onRetry}>
                {t("requests.v2.retry")}
              </Button>
            </div>
          )}

          {request && !error && (
            <div className="space-y-5">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                {statusConfig && StatusIcon && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 py-1 px-2.5 font-medium shadow-2xs",
                      statusConfig.className,
                    )}
                  >
                    <StatusIcon className="size-3.5 shrink-0" />
                    <span>{t(`requests.v2.status.${request.status}`)}</span>
                  </Badge>
                )}

                <Badge variant="secondary" className="gap-1 py-1 px-2.5 font-normal">
                  <Layers className="size-3 opacity-70" />
                  <span>{t(`requests.v2.types.${request.type}`)}</span>
                </Badge>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Mô tả yêu cầu
                </h4>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                  {request.description || t("requests.v2.noDescription")}
                </p>
              </div>

              {/* Metadata Grid */}
              <dl className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium text-2xs uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="size-3 opacity-70" />
                    {t("requests.v2.fields.dueDate")}
                  </dt>
                  <dd className="font-semibold text-foreground text-xs mt-1">
                    {date(request.dueDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium text-2xs uppercase tracking-wider">
                    {t("requests.v2.version")}
                  </dt>
                  <dd className="font-semibold text-foreground text-xs mt-1">
                    v{request.version}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium text-2xs uppercase tracking-wider flex items-center gap-1">
                    <Clock className="size-3 opacity-70" />
                    {t("requests.v2.createdAt")}
                  </dt>
                  <dd className="font-semibold text-foreground text-xs mt-1">
                    {date(request.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium text-2xs uppercase tracking-wider flex items-center gap-1">
                    <Clock className="size-3 opacity-70" />
                    {t("requests.v2.updatedAt")}
                  </dt>
                  <dd className="font-semibold text-foreground text-xs mt-1">
                    {date(request.updatedAt)}
                  </dd>
                </div>
              </dl>

              {/* Locked note if cannot edit */}
              {!request.canEdit && (
                <div className="flex items-center gap-2 rounded-xl border border-muted bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Lock className="size-4 shrink-0 opacity-70" />
                  <p>{t("requests.v2.locked")}</p>
                </div>
              )}

              {/* Decision Note Callout */}
              {request.decisionNote && (
                <div
                  className={cn(
                    "space-y-1.5 rounded-xl border p-4 text-xs leading-relaxed",
                    request.status === "DENIED"
                      ? "border-rose-200/80 bg-rose-50/60 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200"
                      : "border-emerald-200/80 bg-emerald-50/60 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200",
                  )}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    {request.status === "DENIED" ? (
                      <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>{t("requests.v2.review.decisionNote")}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {request.decisionNote}
                  </p>
                </div>
              )}

              {/* Linked Task Component */}
              {request.generatedTaskId && (
                <WorkspaceRequestTask
                  workspaceId={request.workspaceId}
                  requestId={request.id}
                />
              )}

              {/* History Timeline */}
              <section className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("requests.v2.history")}
                  </h3>
                </div>

                {!request.history.length ? (
                  <p className="text-muted-foreground text-xs italic">
                    {t("requests.v2.noHistory")}
                  </p>
                ) : (
                  <div className="relative ml-2 space-y-3 border-l-2 border-border/70 pl-4">
                    {request.history.map((event, index) => (
                      <div
                        key={`${event.version}-${index}`}
                        className="relative rounded-xl border border-border/60 bg-muted/15 p-3 text-xs shadow-2xs space-y-1.5"
                      >
                        {/* Bullet point */}
                        <span className="absolute -left-[21px] top-3.5 size-2.5 rounded-full border-2 border-background bg-brand-orange ring-1 ring-brand-orange/40" />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {t(`requests.v2.events.${event.action}`)} · v{event.version}
                          </span>
                          <time
                            dateTime={event.at}
                            className="text-2xs text-muted-foreground flex items-center gap-1"
                          >
                            <Clock className="size-2.5 opacity-70" />
                            {date(event.at)}
                          </time>
                        </div>
                        {event.note && (
                          <p className="whitespace-pre-wrap break-words text-muted-foreground [overflow-wrap:anywhere] pt-0.5">
                            {event.note === "CAMPAIGN_COMPLETED"
                              ? t("requests.cancelledByCompletion")
                              : event.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        {request && !error && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/50 p-4 bg-muted/20">
            {request.canReceive && (
              <Button
                variant="orange"
                size="sm"
                className="gap-1.5 font-medium shadow-2xs"
                onClick={() => onReview(request, "receive")}
              >
                <Inbox className="size-4" />
                <span>{t("requests.v2.review.receive")}</span>
              </Button>
            )}
            {request.canDeny && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 font-medium bg-rose-600 hover:bg-rose-700 shadow-2xs"
                onClick={() => onReview(request, "deny")}
              >
                <X className="size-4" />
                <span>{t("requests.v2.review.deny")}</span>
              </Button>
            )}
            {request.canAccept && (
              <Button
                size="sm"
                className="gap-1.5 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                onClick={() => onReview(request, "accept")}
              >
                <Check className="size-4" />
                <span>{t("requests.v2.review.accept")}</span>
              </Button>
            )}
            {request.canCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 font-medium shadow-2xs"
                onClick={() => onCancel(request)}
              >
                <XCircle className="size-4" />
                <span>{t("requests.v2.cancelRequest")}</span>
              </Button>
            )}
            {request.canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 font-medium"
                onClick={() => onEdit(request)}
              >
                <Pencil className="size-3.5" />
                <span>{t("requests.v2.edit")}</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              {t("requests.v2.close")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
