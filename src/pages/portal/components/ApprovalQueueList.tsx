import { Check, RotateCcw } from "lucide-react";
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
