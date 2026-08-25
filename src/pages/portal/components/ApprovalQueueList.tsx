import { useState } from "react";
import { Check, MessageSquare, RotateCcw, Send, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ApprovalQueueItem,
  ApprovalQueueStatus,
  ApprovalStageStatus,
} from "@/types/portal";

interface ApprovalQueueListProps {
  items: ApprovalQueueItem[];
  onApprove: (id: string) => void;
  onRequestRevision: (id: string, comment: string) => void;
  onResubmit: (id: string) => void;
}

const STATUS_BADGE_VARIANT: Record<ApprovalQueueStatus, BadgeProps["variant"]> =
  {
    AWAITING_APPROVAL: "PENDING_REVIEW",
    APPROVED: "PUBLISHED",
    REVISION_REQUESTED: "REJECTED",
  };

const STAGE_DOT: Record<ApprovalStageStatus, string> = {
  PENDING: "bg-muted-foreground/30",
  APPROVED: "bg-emerald-500",
  REVISION_REQUESTED: "bg-rose-500",
};

export function ApprovalQueueList({
  items,
  onApprove,
  onRequestRevision,
  onResubmit,
}: ApprovalQueueListProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function handleReject(id: string) {
    const text = drafts[id]?.trim();
    if (!text) {
      return;
    }
    onRequestRevision(id, text);
    setDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border bg-muted/10 border-b p-4 text-sm font-bold">
        {t("dashboard.portal.queueTitle")}
      </div>
      <div className="divide-border divide-y">
        {items.map((item) => {
          const pendingStage = item.approvalChain.find(
            (e) => e.status === "PENDING",
          );
          const lastRevisionEntry = [...item.approvalChain]
            .reverse()
            .find((e) => e.status === "REVISION_REQUESTED");

          return (
            <div
              key={item.id}
              className="hover:bg-muted/5 flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-start"
            >
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span>{item.workspaceName}</span>
                    <span>•</span>
                    <span>
                      {t("dashboard.portal.createdOn", {
                        date: item.createdAt,
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {t("dashboard.portal.revisionRound", {
                        round: item.revisionRound,
                      })}
                    </span>
                  </div>
                </div>

                {/* Approval Chain (Creator -> Manager -> Client) */}
                <div>
                  <div className="text-muted-foreground text-2xs mb-1.5 font-semibold tracking-wider uppercase">
                    {t("dashboard.portal.chainTitle")}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.approvalChain.map((entry, i) => (
                      <div
                        key={entry.stage}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`size-2.5 rounded-full ${STAGE_DOT[entry.status]}`}
                          />
                          <div className="leading-tight">
                            <div className="text-foreground text-3xs font-semibold">
                              {t(`dashboard.portal.stage.${entry.stage}`)}
                            </div>
                            <div className="text-muted-foreground text-3xs">
                              {t(
                                `dashboard.portal.stageStatus.${entry.status}`,
                              )}
                            </div>
                          </div>
                        </div>
                        {i < item.approvalChain.length - 1 && (
                          <span className="text-muted-foreground/40 text-xs">
                            →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {lastRevisionEntry?.comment && (
                  <div className="border-border w-full rounded-lg border p-3 sm:w-96">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                      <MessageSquare className="text-brand-orange size-3.5" />
                      {t("dashboard.portal.comments", { count: 1 })}
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-lg px-3 py-1.5 text-xs">
                      {lastRevisionEntry.comment}
                    </div>
                  </div>
                )}

                {pendingStage && (
                  <div className="border-border w-full rounded-lg border p-3 sm:w-96">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                      {t("dashboard.portal.rejectPlaceholder")}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={drafts[item.id] ?? ""}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleReject(item.id);
                        }}
                        placeholder={t("dashboard.portal.commentPlaceholder")}
                        className="border-border bg-card text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        className="bg-muted text-foreground hover:bg-muted/80 flex shrink-0 cursor-pointer items-center justify-center rounded-lg px-2.5 py-1.5"
                        title={t("dashboard.portal.sendComment")}
                      >
                        <Send className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <Badge
                  className="text-3xs rounded-full px-2 py-0.5 font-mono uppercase"
                  variant={STATUS_BADGE_VARIANT[item.status]}
                >
                  {t(`dashboard.portal.status.${item.status}`)}
                </Badge>

                {pendingStage && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleReject(item.id)}
                    >
                      <RotateCcw className="size-3.5" />
                      {t("dashboard.portal.requestRevision")}
                    </Button>
                    <Button
                      variant="orange"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => onApprove(item.id)}
                    >
                      <Check className="size-3.5" />
                      {t("dashboard.portal.approve")}
                    </Button>
                  </div>
                )}

                {item.status === "REVISION_REQUESTED" && (
                  <Button
                    variant="orange"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => onResubmit(item.id)}
                  >
                    <RefreshCw className="size-3.5" />
                    {t("dashboard.portal.resubmit")}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
