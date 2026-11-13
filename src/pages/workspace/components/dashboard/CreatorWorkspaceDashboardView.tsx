import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Palette,
  AlertTriangle,
  FolderKanban,
  Sparkles,
  Plus,
  Image,
  Calendar,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { portalService } from "@/services/portalService";
import type { ApprovalQueueItem } from "@/types/portal";
import type { TaskListItem, TaskStatus } from "@/types/task";
import type { Workspace, WorkspaceDashboard } from "@/types/workspace";

interface CreatorWorkspaceDashboardViewProps {
  workspaceId: string;
  workspace: Workspace;
  dashboard: WorkspaceDashboard;
  tasks: TaskListItem[];
  tasksTotal: number;
  tasksLoading: boolean;
}

const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; badgeClass: string }
> = {
  TODO: {
    label: "Cần làm",
    badgeClass: "border-border/80 text-muted-foreground bg-muted/40",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    badgeClass: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  IN_REVIEW: {
    label: "Đang xét duyệt",
    badgeClass: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  FINISHED: {
    label: "Đã hoàn thành",
    badgeClass: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeClass: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
};

export function CreatorWorkspaceDashboardView({
  workspaceId,
  workspace,
  dashboard: _dashboard,
  tasks,
  tasksTotal,
  tasksLoading,
}: CreatorWorkspaceDashboardViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Copy hex code state
  const [copiedHex, setCopiedHex] = useState(false);

  // ── Revision Requests State ──
  const [revisionItems, setRevisionItems] = useState<ApprovalQueueItem[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(true);

  // Load Revision Requests from Portal
  useEffect(() => {
    let cancelled = false;
    setRevisionsLoading(true);

    portalService
      .getApprovalQueue()
      .then((items) => {
        if (cancelled) return;
        // Filter items that have requested revisions
        const needsRevision = items.filter((item) => {
          if (item.status === "REVISION_REQUESTED") return true;
          return item.approvalChain.some((entry) => entry.status === "REVISION_REQUESTED");
        });
        setRevisionItems(needsRevision);
      })
      .catch((err) => {
        console.warn("Failed to load revision requests for creator:", err);
      })
      .finally(() => {
        if (!cancelled) setRevisionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Brand Palette Details
  const primaryBrandColor = workspace.brandColor || "#f05a28";

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(true);
    toast.success(t("workspace.creator.copiedColor", "Đã sao chép mã màu {{hex}}", { hex }));
    setTimeout(() => setCopiedHex(false), 2000);
  };

  // Tone of Voice mapping by industry or defaults
  const toneOfVoice = useMemo(() => {
    switch (workspace.industry) {
      case "FNB":
        return {
          title: "Hấp dẫn, Ấm áp & Trải nghiệm",
          description: "Ngôn từ giàu tính khơi gợi vị giác, gần gũi, tôn vinh nguyên liệu tươi ngon và khoảnh khắc kết nối.",
        };
      case "FASHION":
      case "BEAUTY":
        return {
          title: "Tự tin, Thời thượng & Tinh tế",
          description: "Ngôn từ sang trọng, hiện đại, truyền cảm hứng phong cách sống và khẳng định bản sắc riêng.",
        };
      case "TECHNOLOGY":
        return {
          title: "Chuyên nghiệp, Đổi mới & Đáng tin cậy",
          description: "Rõ ràng, súc tích, làm nổi bật giá trị đột phá và giải pháp tối ưu cho người dùng.",
        };
      case "EDUCATION":
      case "HEALTHCARE":
        return {
          title: "Ân cần, Chuẩn xác & Thấu cảm",
          description: "Ngôn ngữ đáng tin cậy, khoa học, dễ tiếp thu và luôn đặt lợi ích người học/người bệnh lên đầu.",
        };
      default:
        return {
          title: "Hiện đại, Năng động & Rõ ràng",
          description: "Giao tiếp trực diện, truyền tải thông điệp ngắn gọn, giữ thái độ tôn trọng và gắn kết khán giả.",
        };
    }
  }, [workspace.industry]);

  // Sorted tasks by urgent deadline
  const sortedTasks = useMemo(() => {
    const liveTasks = tasks.filter((task) => task.status !== "FINISHED" && task.status !== "CANCELLED");

    return [...liveTasks].sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return timeA - timeB;
    });
  }, [tasks]);

  return (
    <div className="space-y-8">
      {/* ── KHỐI 1: Lối tắt sáng tạo nhanh ── */}
      <section aria-labelledby="creator-shortcuts-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="creator-shortcuts-heading" className="text-foreground text-sm font-bold tracking-tight">
            {t("workspace.creator.quickShortcutsTitle", "Lối tắt sáng tạo nhanh")}
          </h2>
          <span className="text-muted-foreground text-3xs font-medium">
            {t("workspace.creator.creatorHubHint", "Không gian làm việc & công cụ AI")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Action 1: Create Post */}
          <button
            type="button"
            onClick={() => navigate(`/workspaces/${workspaceId}/editor`)}
            className="border-border bg-card hover:border-brand-orange/40 hover:shadow-xs flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="bg-brand-orange text-white flex size-9 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105">
              <Plus className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold leading-tight group-hover:text-brand-orange transition-colors">
                {t("workspace.creator.createPost", "+ Tạo bài viết mới")}
              </p>
              <p className="text-muted-foreground text-3xs mt-0.5">
                {t("workspace.creator.openEditor", "Mở Editor đa kênh")}
              </p>
            </div>
          </button>

          {/* Action 2: AI Studio */}
          <button
            type="button"
            onClick={() => navigate(`/ai-studio/video`)}
            className="border-border bg-card hover:border-purple-500/40 hover:bg-purple-500/5 hover:shadow-xs flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="bg-purple-500/10 text-purple-600 flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold leading-tight group-hover:text-purple-600 transition-colors">
                {t("workspace.creator.aiStudio", "AI Studio")}
              </p>
              <p className="text-muted-foreground text-3xs mt-0.5">
                {t("workspace.creator.aiTools", "Tạo video & ý tưởng")}
              </p>
            </div>
          </button>

          {/* Action 3: Media Library */}
          <button
            type="button"
            onClick={() => navigate(`/workspaces/${workspaceId}/library`)}
            className="border-border bg-card hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-xs flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="bg-blue-500/10 text-blue-600 flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
              <Image className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold leading-tight group-hover:text-blue-600 transition-colors">
                {t("workspace.creator.mediaLibrary", "Thư viện media")}
              </p>
              <p className="text-muted-foreground text-3xs mt-0.5">
                {t("workspace.creator.brandAssets", "Ảnh, video & template")}
              </p>
            </div>
          </button>

          {/* Action 4: Content Calendar */}
          <button
            type="button"
            onClick={() => navigate(`/workspaces/${workspaceId}/calendar`)}
            className="border-border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:shadow-xs flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="bg-emerald-500/10 text-emerald-600 flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
              <Calendar className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold leading-tight group-hover:text-emerald-600 transition-colors">
                {t("workspace.creator.contentCalendar", "Lịch phát sóng")}
              </p>
              <p className="text-muted-foreground text-3xs mt-0.5">
                {t("workspace.creator.viewSchedule", "Lịch đăng & hạn chót")}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ── KHỐI 2: Khối việc khẩn cấp: Bài viết cần chỉnh sửa (Revision Requests) ── */}
      <section aria-labelledby="revision-requests-heading">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 size-4.5" />
            <h2 id="revision-requests-heading" className="text-foreground text-base font-bold tracking-tight">
              {t("workspace.creator.revisionHeading", "Khối việc khẩn cấp: Bài viết cần chỉnh sửa")}
            </h2>
            <span className="bg-amber-500/15 text-amber-600 rounded-full px-2 py-0.5 font-mono text-xs font-bold">
              {revisionItems.length}
            </span>
          </div>

          <span className="text-muted-foreground text-3xs font-medium">
            {t("workspace.creator.revisionHint", "Ưu tiên phản hồi trong 24h")}
          </span>
        </div>

        {revisionsLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : revisionItems.length === 0 ? (
          <div className="border-border bg-card/60 flex items-center gap-4 rounded-2xl border border-dashed p-5">
            <div className="bg-emerald-500/10 text-emerald-600 flex size-10 shrink-0 items-center justify-center rounded-xl">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">
                {t("workspace.creator.noRevisionsTitle", "Không có yêu cầu chỉnh sửa tồn đọng")}
              </p>
              <p className="text-muted-foreground text-3xs mt-0.5">
                {t(
                  "workspace.creator.noRevisionsDesc",
                  "Tất cả các bài viết của bạn đã được thông qua hoặc đang chờ khách hàng duyệt.",
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {revisionItems.map((item) => {
              // Find the latest revision request entry with feedback comment
              const revisionEntry = [...item.approvalChain]
                .reverse()
                .find((entry) => entry.status === "REVISION_REQUESTED");

              const reviewerRole = revisionEntry?.stage === "CLIENT" ? "Khách hàng" : "Quản lý phụ trách";

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/workspaces/${workspaceId}/editor`)}
                  className="border-amber-500/40 bg-card hover:border-brand-orange/40 hover:shadow-xs flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-600 text-3xs font-semibold">
                        {t("workspace.creator.revisionFrom", "Yêu cầu từ: {{reviewer}}", { reviewer: reviewerRole })}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-3xs">
                        {item.revisionRound ? `Vòng ${item.revisionRound}` : "Vòng 1"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-foreground line-clamp-1 text-sm font-bold group-hover:text-brand-orange transition-colors">
                        {item.title}
                      </h3>
                      <div className="bg-amber-500/10 border-amber-500/20 text-foreground mt-2 rounded-xl border p-3 text-xs">
                        <p className="text-amber-600 dark:text-amber-400 text-3xs font-bold uppercase tracking-wider">
                          {t("workspace.creator.feedbackNotes", "Ghi chú góp ý:")}
                        </p>
                        <p className="text-foreground mt-1 line-clamp-3 text-xs italic">
                          "{revisionEntry?.comment || t("workspace.creator.defaultRevisionNote", "Cần điều chỉnh lại hình ảnh và câu chốt theo quy chuẩn thương hiệu.")}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="orange"
                      size="sm"
                      onClick={() => navigate(`/workspaces/${workspaceId}/editor`)}
                      className="gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="size-3.5" />
                      <span>{t("workspace.creator.openToEdit", "Mở Editor sửa ngay")}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── KHỐI 3: Quy chuẩn thương hiệu tóm tắt (Brand Guidelines) ── */}
      <section aria-labelledby="brand-guidelines-heading">
        <div className="border-border bg-card rounded-2xl border p-6 shadow-2xs space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Palette className="text-brand-orange size-5" />
              <div>
                <h2 id="brand-guidelines-heading" className="text-foreground text-base font-bold tracking-tight">
                  {t("workspace.creator.brandGuidelinesTitle", "Quy chuẩn thương hiệu (Brand Guidelines)")}
                </h2>
                <p className="text-muted-foreground text-2xs mt-0.5">
                  {t("workspace.creator.guidelinesSubtitle", "Sổ tay quy chuẩn nhanh giúp nội dung luôn chuẩn nhận diện {{brand}}", {
                    brand: workspace.name,
                  })}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
              className="hover:border-brand-orange/40 self-start text-xs font-medium sm:self-center"
            >
              <span>{t("workspace.creator.viewFullGuidelines", "Xem toàn bộ hồ sơ")}</span>
              <ExternalLink className="ml-1 size-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Cột 1: Bảng màu & Kiểu chữ */}
            <div className="space-y-4">
              <h3 className="text-foreground text-xs font-bold uppercase tracking-wider">
                {t("workspace.creator.colorsAndType", "1. Bảng màu & Kiểu chữ")}
              </h3>

              {/* Color swatches */}
              <div className="space-y-2">
                <span className="text-muted-foreground text-3xs font-medium uppercase">
                  {t("workspace.creator.primaryColor", "Màu chủ đạo")}
                </span>
                <div className="flex items-center justify-between rounded-xl border border-border/70 p-2.5 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-7 rounded-lg border border-border/80 shadow-2xs"
                      style={{ backgroundColor: primaryBrandColor }}
                    />
                    <div>
                      <p className="font-mono text-xs font-bold text-foreground uppercase">
                        {primaryBrandColor}
                      </p>
                      <p className="text-muted-foreground text-3xs">
                        {t("workspace.creator.accentBrandColor", "Màu nhấn thương hiệu")}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0"
                    onClick={() => handleCopyColor(primaryBrandColor)}
                  >
                    {copiedHex ? (
                      <Check className="text-emerald-500 size-3.5" />
                    ) : (
                      <Copy className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Typography specs */}
              <div className="space-y-2 pt-1">
                <span className="text-muted-foreground text-3xs font-medium uppercase">
                  {t("workspace.creator.fontRules", "Phông chữ quy định")}
                </span>
                <div className="border-border/70 bg-muted/20 rounded-xl border p-3 space-y-1 text-xs">
                  <p className="text-foreground font-semibold">
                    Nội dung chính: <span className="text-muted-foreground font-normal">Inter (14px - 16px)</span>
                  </p>
                  <p className="text-foreground font-semibold">
                    Số liệu & Mã: <span className="font-mono text-muted-foreground font-normal">Geist Mono</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Cột 2: Giọng điệu thương hiệu */}
            <div className="space-y-3">
              <h3 className="text-foreground text-xs font-bold uppercase tracking-wider">
                {t("workspace.creator.toneOfVoice", "2. Giọng điệu thương hiệu (Tone of Voice)")}
              </h3>

              <div className="border-border/70 bg-muted/20 rounded-xl border p-4 space-y-2">
                <span className="bg-brand-orange-soft text-brand-orange rounded-md px-2 py-0.5 text-3xs font-bold uppercase">
                  {workspace.industry || "THƯƠNG HIỆU"}
                </span>
                <h4 className="text-foreground text-xs font-bold">
                  {toneOfVoice.title}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {toneOfVoice.description}
                </p>
              </div>
            </div>

            {/* Cột 3: Quy tắc Nên làm & Cần tránh (Do's & Don'ts) */}
            <div className="space-y-3">
              <h3 className="text-foreground text-xs font-bold uppercase tracking-wider">
                {t("workspace.creator.dosAndDonts", "3. Quy tắc Nên làm & Cần tránh (Do's & Don'ts)")}
              </h3>

              <div className="space-y-2 text-xs">
                {/* Do items */}
                <div className="border-emerald-500/20 bg-emerald-500/5 rounded-xl border p-2.5 flex items-start gap-2">
                  <CheckCircle2 className="text-emerald-500 size-4 shrink-0 mt-0.5" />
                  <p className="text-foreground text-xs leading-snug">
                    <strong className="text-emerald-600 dark:text-emerald-400">Nên làm:</strong> Giữ đúng tỷ lệ logo, dùng chuẩn mã màu hex, kiểm tra kỹ chính tả & hashtag chiến dịch.
                  </p>
                </div>

                {/* Don't items */}
                <div className="border-rose-500/20 bg-rose-500/5 rounded-xl border p-2.5 flex items-start gap-2">
                  <XCircle className="text-rose-500 size-4 shrink-0 mt-0.5" />
                  <p className="text-foreground text-xs leading-snug">
                    <strong className="text-rose-600 dark:text-rose-400">Cần tránh:</strong> Tự ý đổi sắc độ màu, kéo méo ảnh logo, sử dụng hình ảnh chưa giải phóng bản quyền thương mại.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KHỐI 4: Danh sách nhiệm vụ được giao theo thứ tự ưu tiên hạn chót ── */}
      <section aria-labelledby="creator-tasks-heading">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="text-brand-orange size-4.5" />
            <h2 id="creator-tasks-heading" className="text-foreground text-base font-bold tracking-tight">
              {t("workspace.creator.assignedTasksTitle", "Nhiệm vụ ưu tiên theo hạn chót (Deadline)")}
            </h2>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-xs font-medium">
              {sortedTasks.length} / {tasksTotal || sortedTasks.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
            className="hover:text-brand-orange text-xs font-semibold"
          >
            <span>{t("workspace.dashboard.viewAllTasks", "Xem tất cả nhiệm vụ")}</span>
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="border-border bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
            <CheckCircle2 className="text-emerald-500 size-10 mb-2" />
            <h3 className="text-foreground text-sm font-semibold">
              {t("workspace.creator.noTasksTitle", "Hiện bạn đã hoàn thành hết các nhiệm vụ!")}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("workspace.creator.noTasksDesc", "Bạn có thể chủ động tạo bài viết mới hoặc nghiên cứu xu hướng trên AI Studio.")}
            </p>
          </div>
        ) : (
          <div className="border-border bg-card divide-border/60 divide-y overflow-hidden rounded-2xl border">
            {sortedTasks.slice(0, 6).map((task) => {
              const hasDue = Boolean(task.dueDate);
              const dueTime = hasDue ? new Date(task.dueDate!).getTime() : null;
              const isOverdue = dueTime !== null && dueTime < new Date().getTime();
              const statusConfig = TASK_STATUS_CONFIG[task.status] || {
                label: task.status,
                badgeClass: "border-border text-muted-foreground bg-muted",
              };

              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}/detail`)}
                  className="cursor-pointer hover:bg-muted/40 hover:border-brand-orange/40 transition-all flex items-center justify-between p-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="bg-brand-orange/10 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg group-hover:bg-brand-orange group-hover:text-white transition-colors">
                      <Clock className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-foreground truncate text-xs font-semibold sm:text-sm group-hover:text-brand-orange transition-colors">
                        {task.name}
                      </p>
                      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-2xs">
                        <span className="font-mono">#{task.id.slice(-6)}</span>
                        <span>•</span>
                        <Badge variant="outline" className={`font-mono text-3xs ${statusConfig.badgeClass}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {hasDue ? (
                      <Badge
                        variant={isOverdue ? "destructive" : "secondary"}
                        className="font-mono text-3xs"
                      >
                        {isOverdue ? "Quá hạn" : new Date(task.dueDate!).toLocaleDateString("vi-VN")}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-3xs">Chưa đặt hạn</span>
                    )}

                    <Button variant="ghost" size="sm" className="size-7 p-0 group-hover:text-brand-orange transition-colors">
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default CreatorWorkspaceDashboardView;
