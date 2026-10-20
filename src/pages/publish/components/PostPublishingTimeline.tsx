import { useTranslation } from "react-i18next";
import { CheckCircle2, Info, AlertTriangle, History } from "lucide-react";
import type { PostExecutionLog, PostAuditItem } from "../types/postDetail";

interface PostPublishingTimelineProps {
  executionLogs: PostExecutionLog[];
  auditHistory: PostAuditItem[];
}

export function PostPublishingTimeline({
  executionLogs,
  auditHistory,
}: PostPublishingTimelineProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Execution Logs */}
      <div className="bg-card border-border rounded-xl border p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-sm font-bold">
              {t("publish.detail.logs.title", "Nhật ký hệ thống & RabbitMQ")}
            </h2>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t("publish.detail.logs.subtitle", "Tiến trình gửi, xử lý hàng đợi và API MXH")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {executionLogs.map((log) => (
            <div
              key={log.id}
              className="border-border bg-muted/30 flex items-start gap-3 rounded-lg border p-3 text-xs"
            >
              <div className="mt-0.5 shrink-0">
                {log.status === "SUCCESS" && (
                  <CheckCircle2 className="text-success size-4" />
                )}
                {log.status === "INFO" && (
                  <Info className="text-primary size-4" />
                )}
                {log.status === "FAILED" && (
                  <AlertTriangle className="text-destructive size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground font-semibold uppercase text-3xs tracking-wider">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground font-mono text-3xs">
                    {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <p className="text-muted-foreground text-2xs mt-1 leading-relaxed break-all">
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Audit History */}
      <div className="bg-card border-border rounded-xl border p-5">
        <div className="mb-4 flex items-center gap-2">
          <History className="text-brand-orange size-4" />
          <div>
            <h2 className="text-foreground text-sm font-bold">
              {t("publish.detail.audit.title", "Lịch sử kiểm toán nội dung")}
            </h2>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t("publish.detail.audit.subtitle", "Ghi nhận thao tác của các thành viên trong Workspace")}
            </p>
          </div>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
          {auditHistory.map((item) => (
            <div key={item.id} className="relative">
              <span className="bg-brand-orange ring-background absolute -left-6 top-1 size-2 rounded-full ring-4" />
              <div className="text-xs">
                <p className="text-foreground font-medium">{item.action}</p>
                <div className="text-muted-foreground text-2xs mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-foreground/80">{item.userName}</span>
                  <span>•</span>
                  <span>{item.userRole}</span>
                  <span>•</span>
                  <span className="font-mono">
                    {new Date(item.timestamp).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
