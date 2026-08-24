import { useTranslation } from "react-i18next";
import { Check, X, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModerationItem } from "../types/admin";

const STATUS_VARIANT: Record<
  ModerationItem["status"],
  "PENDING_REVIEW" | "PUBLISHED" | "FAILED"
> = {
  PENDING: "PENDING_REVIEW",
  APPROVED: "PUBLISHED",
  REMOVED: "FAILED",
};

export interface ModerationQueueListProps {
  items: ModerationItem[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ModerationQueueList({
  items,
  onApprove,
  onRemove,
}: ModerationQueueListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {item.contentTitle}
              </span>
              <Badge variant={STATUS_VARIANT[item.status]}>
                {t(`dashboard.admin.moderation.statuses.${item.status}`)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {item.workspaceName}
            </p>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Flag className="text-destructive size-3.5 shrink-0" />
              {item.flagReason}
            </p>
            <p className="text-muted-foreground text-3xs">
              {new Date(item.submittedAt).toLocaleString("vi-VN")}
            </p>
          </div>

          {item.status === "PENDING" && (
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onApprove(item.id)}
              >
                <Check className="size-3.5" />
                {t("dashboard.admin.moderation.approve")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5 text-xs"
                onClick={() => onRemove(item.id)}
              >
                <X className="size-3.5" />
                {t("dashboard.admin.moderation.remove")}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ModerationQueueList;
