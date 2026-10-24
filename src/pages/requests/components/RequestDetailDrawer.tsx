import React, { useRef } from "react";
import {
  X,
  FileEdit,
  Ban,
  Clock,
  Share2,
  Globe,
  Video,
  AtSign,
  Building2,
  Calendar,
  User,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentRequest, SocialPlatform } from "@/types/contentRequest";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useResizablePanelWidth } from "@/pages/tasks/hooks/useResizablePanelWidth";

interface RequestDetailDrawerProps {
  request: ContentRequest | null;
  onClose: () => void;
  onRevise: (request: ContentRequest) => void;
  onCancel: (request: ContentRequest) => void;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  FACEBOOK: <Share2 className="size-3" />,
  INSTAGRAM: <Globe className="size-3" />,
  TIKTOK: <Video className="size-3" />,
  THREADS: <AtSign className="size-3" />,
};

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  request,
  onClose,
  onRevise,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { width, panelRef, onMouseDown } = useResizablePanelWidth(
    520,
    380,
    800,
    "brandhub_request_panel_width",
  );

  // Giữ lại request gần nhất khi animation đóng đang trượt ra
  // để nội dung không bị biến mất đột ngột làm giật layout
  const lastActiveRequest = useRef<ContentRequest | null>(request);
  if (request) {
    lastActiveRequest.current = request;
  }
  const displayRequest = request || lastActiveRequest.current;

  if (!displayRequest) return null;

  const history = displayRequest.statusHistory ?? [];
  const canModify =
    displayRequest.status !== "APPROVED" &&
    displayRequest.status !== "REJECTED" &&
    displayRequest.status !== "CANCELLED";

  // Tính số ngày còn lại đến hạn
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(displayRequest.deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Sheet
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        ref={panelRef}
        side="right"
        showOverlay={false}
        id="request-detail-panel"
        style={{ width: `${width}px`, maxWidth: "90vw" }}
        className="border-border bg-card fixed inset-y-0 right-0 z-[60] flex h-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-none md:max-w-none lg:max-w-none [&>button]:hidden !duration-300 !transition-transform"
      >
        {/* Resize Handle ở mép trái kéo giãn tương tự task detail */}
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

        {/* Header Drawer */}
        <SheetHeader className="border-border bg-card shrink-0 flex-row items-center justify-between gap-3 border-b px-6 py-4 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-brand-orange/10 text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-xl">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-foreground text-sm font-semibold truncate">
                {t("requests.detail.title")}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-2xs font-mono">
                  ID: {displayRequest.id.slice(0, 8)}...
                </span>
                <span className="text-muted-foreground text-2xs">•</span>
                <span className="text-brand-orange font-semibold text-2xs">
                  {t(`requests.status.${displayRequest.status}`)}
                </span>
              </div>
              <SheetDescription className="sr-only">
                {displayRequest.topic}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-8 rounded-lg"
              aria-label={t("requests.detail.close")}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          {/* Main Info Card */}
          <div className="border-border/80 bg-muted/20 space-y-3.5 rounded-xl border p-4.5">
            <h4 className="text-foreground text-base leading-snug font-bold">
              {displayRequest.topic}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-muted-foreground flex items-center gap-2">
                <Building2 className="text-muted-foreground size-4 shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {displayRequest.clientName}
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 font-mono">
                <Calendar className="text-muted-foreground size-4 shrink-0" />
                <span className="text-foreground font-medium">
                  {displayRequest.deadline}
                </span>
                {diffDays < 0 ? (
                  <span className="bg-destructive/10 text-destructive border-destructive/20 inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-2xs font-medium border">
                    <AlertCircle className="size-2.5" />
                    Quá hạn
                  </span>
                ) : diffDays === 0 ? (
                  <span className="bg-amber-500/10 text-amber-600 border-amber-500/20 inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-2xs font-medium border">
                    Hôm nay
                  </span>
                ) : diffDays <= 2 ? (
                  <span className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-2xs font-medium border">
                    Còn {diffDays} ngày
                  </span>
                ) : null}
              </div>
            </div>

            {/* Platforms */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
              <span className="text-muted-foreground text-2xs font-medium">
                {t("requests.filter.platforms")}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {displayRequest.platforms.map((p) => (
                  <span
                    key={p}
                    className="text-2xs border-border bg-card text-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium shadow-2xs"
                  >
                    {PLATFORM_ICONS[p]}
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assignee Card */}
          <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              {displayRequest.assignee?.avatarUrl ? (
                <img
                  src={displayRequest.assignee.avatarUrl}
                  alt={displayRequest.assignee.name}
                  className="border-border size-9 rounded-full border object-cover shadow-2xs"
                />
              ) : (
                <div className="bg-brand-orange/15 text-brand-orange flex size-9 items-center justify-center rounded-full text-xs font-bold">
                  {displayRequest.assignee ? (
                    displayRequest.assignee.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-2xs uppercase tracking-wider font-semibold">
                  {t("requests.table.assignee")}
                </p>
                <p className="text-foreground text-xs font-semibold">
                  {displayRequest.assignee?.name || t("requests.table.unassigned")}
                </p>
              </div>
            </div>
          </div>

          {/* Brief Note */}
          {displayRequest.briefNote && (
            <div className="space-y-1.5">
              <h5 className="text-muted-foreground text-2xs font-bold tracking-wider uppercase">
                {t("requests.detail.briefLabel")}
              </h5>
              <div className="border-border/80 bg-muted/20 text-foreground rounded-xl border p-4 text-xs leading-relaxed italic">
                "{displayRequest.briefNote}"
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="space-y-3 pt-2">
            <h5 className="text-muted-foreground text-2xs font-bold tracking-wider uppercase">
              {t("requests.detail.statusHistoryTitle")}
            </h5>

            {history.length === 0 ? (
              <p className="text-muted-foreground text-xs italic">
                {t("requests.v2.noHistory", { defaultValue: "Chưa có lịch sử thay đổi." })}
              </p>
            ) : (
              <div className="border-border/80 relative ml-3 space-y-4 border-l-2 pl-4 py-1">
                {history.map((entry, i) => (
                  <div key={i} className="relative">
                    <span className="border-card bg-brand-orange ring-brand-orange/30 absolute top-1 -left-[23px] size-2.5 rounded-full ring-2" />
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-foreground text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-brand-orange" />
                        {t(`requests.status.${entry.status}`)}
                      </span>
                      <span className="text-muted-foreground font-mono text-2xs">
                        {new Date(entry.changedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      <span className="font-medium text-foreground/85">{entry.changedBy}</span>
                      {entry.note ? ` — ${entry.note}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        {canModify && (
          <div className="border-border bg-card/90 backdrop-blur-sm shrink-0 flex gap-2.5 border-t p-4 px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevise(displayRequest)}
              className="flex-1 text-xs"
            >
              <FileEdit className="size-3.5 mr-1.5" />
              {t("requests.detail.reviseButton")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(displayRequest)}
              className="flex-1 text-xs"
            >
              <Ban className="size-3.5 mr-1.5" />
              {t("requests.detail.cancelButton")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
