import { useState } from "react";
import { Check, MessageSquare, RotateCcw, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApprovalQueueItem, ApprovalQueueStatus } from "@/types/portal";

interface ApprovalQueueListProps {
  items: ApprovalQueueItem[];
  onApprove: (id: string) => void;
  onRequestRevision: (id: string) => void;
}

const STATUS_BADGE_VARIANT: Record<ApprovalQueueStatus, BadgeProps["variant"]> =
  {
    AWAITING_APPROVAL: "PENDING_REVIEW",
    APPROVED: "PUBLISHED",
    REVISION_REQUESTED: "REJECTED",
  };

export function ApprovalQueueList({
  items,
  onApprove,
  onRequestRevision,
}: ApprovalQueueListProps) {
  const { t } = useTranslation();

  const [threads, setThreads] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      items.map((i) => [
        i.id,
        [
          "Cần bổ sung CTA rõ ràng hơn ở cuối bài.",
          "Màu sắc ổn, nhưng caption hơi dài — nên rút gọn.",
        ],
      ]),
    ),
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function addComment(id: string) {
    const text = drafts[id]?.trim();
    if (!text) return;
    setThreads((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), text] }));
    setDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border bg-muted/10 border-b p-4 text-sm font-bold">
        {t("dashboard.portal.queueTitle")}
      </div>
      <div className="divide-border divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            className="hover:bg-muted/5 flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>{item.workspaceName}</span>
                <span>•</span>
                <span>
                  {t("dashboard.portal.createdOn", { date: item.createdAt })}
                </span>
              </div>

              <div className="border-border mt-3 w-full rounded-lg border p-3 sm:w-96">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                  <MessageSquare className="text-brand-orange size-3.5" />
                  {t("dashboard.portal.comments", {
                    count: (threads[item.id] ?? []).length,
                  })}
                </div>
                <div className="space-y-2">
                  {(threads[item.id] ?? []).map((comment, idx) => (
                    <div
                      key={idx}
                      className="bg-muted text-muted-foreground rounded-lg px-3 py-1.5 text-xs"
                    >
                      {comment}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={drafts[item.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addComment(item.id);
                    }}
                    placeholder={t("dashboard.portal.commentPlaceholder")}
                    className="border-border bg-card text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addComment(item.id)}
                    className="bg-brand-orange flex shrink-0 cursor-pointer items-center justify-center rounded-lg px-2.5 py-1.5 text-white"
                    title={t("dashboard.portal.sendComment")}
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className="text-3xs rounded-full px-2 py-0.5 font-mono uppercase"
                variant={STATUS_BADGE_VARIANT[item.status]}
              >
                {t(`dashboard.portal.status.${item.status}`)}
              </Badge>
              {item.status === "AWAITING_APPROVAL" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => onRequestRevision(item.id)}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
