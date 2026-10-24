import React from "react";
import type {
  ContentRequest,
  ContentRequestStatus,
  SocialPlatform,
} from "@/types/contentRequest";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ArrowRight,
  Share2,
  Globe,
  Video,
  AtSign,
  Clock,
  AlertTriangle,
  Eye,
  Inbox,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Button } from "@/components/ui/button";

interface ContentRequestTableProps {
  requests: ContentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  userRole?: string;
  onPageChange: (newPage: number) => void;
  onOpenAssignModal: (req: ContentRequest) => void;
  onOpenDetail: (req: ContentRequest) => void;
  onCreateNew?: () => void;
}

const STATUS_BADGE_MAP: Record<
  ContentRequestStatus,
  { labelClass: string; dotClass: string }
> = {
  SUBMITTED: {
    labelClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
  ASSIGNED: {
    labelClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  IN_PROGRESS: {
    labelClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500 animate-pulse",
  },
  PENDING_REVIEW: {
    labelClass:
      "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    dotClass: "bg-brand-orange",
  },
  SENT_TO_CLIENT: {
    labelClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  APPROVED: {
    labelClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  REJECTED: {
    labelClass:
      "bg-destructive/10 text-destructive border-destructive/20",
    dotClass: "bg-destructive",
  },
  CANCELLED: {
    labelClass: "bg-muted text-muted-foreground border-border line-through opacity-70",
    dotClass: "bg-muted-foreground",
  },
};

const PLATFORM_ICONS: Record<
  SocialPlatform,
  { icon: React.ReactNode; bgClass: string; textClass: string; label: string }
> = {
  FACEBOOK: {
    icon: <Share2 className="size-3" />,
    bgClass: "bg-blue-500/10 border-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
    label: "FB",
  },
  INSTAGRAM: {
    icon: <Globe className="size-3" />,
    bgClass: "bg-pink-500/10 border-pink-500/20",
    textClass: "text-pink-600 dark:text-pink-400",
    label: "IG",
  },
  TIKTOK: {
    icon: <Video className="size-3" />,
    bgClass: "bg-foreground/10 border-foreground/20",
    textClass: "text-foreground",
    label: "TT",
  },
  THREADS: {
    icon: <AtSign className="size-3" />,
    bgClass: "bg-foreground/10 border-foreground/20",
    textClass: "text-foreground",
    label: "TH",
  },
};

export const ContentRequestTable: React.FC<ContentRequestTableProps> = ({
  requests,
  total,
  page,
  totalPages,
  userRole = "MANAGER",
  onPageChange,
  onOpenAssignModal,
  onOpenDetail,
  onCreateNew,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const handleGoToEditor = (req: ContentRequest) => {
    if (!currentWorkspace) return;
    navigate(`/workspaces/${currentWorkspace.id}/editor`, {
      state: {
        templateTitle: req.topic,
        prefilledCaption: `[Client: ${req.clientName}] ${req.topic}\n\n${t("requests.table.deadlineLabel")}: ${req.deadline}`,
      },
    });
  };

  const getSmartDeadline = (deadlineStr: string, status: ContentRequestStatus) => {
    if (status === "APPROVED" || status === "CANCELLED") {
      return { text: deadlineStr, badgeClass: "text-muted-foreground" };
    }
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) {
      return { text: deadlineStr, badgeClass: "text-muted-foreground" };
    }
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `${deadlineStr} (${t("requests.smartDeadline.overdue")})`,
        badgeClass: "text-destructive font-semibold flex items-center gap-1",
        isAlert: true,
      };
    }
    if (diffDays === 0) {
      return {
        text: `${deadlineStr} (${t("requests.smartDeadline.today")})`,
        badgeClass: "text-brand-orange font-semibold flex items-center gap-1",
        isWarning: true,
      };
    }
    if (diffDays <= 2) {
      return {
        text: `${deadlineStr} (${t("requests.smartDeadline.daysLeft", { count: diffDays })})`,
        badgeClass: "text-amber-600 dark:text-amber-400 font-medium",
      };
    }
    return { text: deadlineStr, badgeClass: "text-muted-foreground font-mono" };
  };

  return (
    <div className="bg-card border-border/80 flex min-h-[460px] flex-col justify-between overflow-hidden rounded-xl border shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted/50 border-border text-muted-foreground text-2xs border-b font-bold tracking-wider uppercase">
              <th className="px-5 py-3.5">{t("requests.table.topic")}</th>
              <th className="px-3.5 py-3.5">{t("requests.table.platforms")}</th>
              <th className="px-4 py-3.5">{t("requests.table.client")}</th>
              <th className="px-4 py-3.5">{t("requests.table.deadline")}</th>
              <th className="px-3.5 py-3.5">{t("requests.table.status")}</th>
              <th className="px-4 py-3.5">{t("requests.table.assignee")}</th>
              <th className="px-5 py-3.5 text-right">
                {t("requests.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y text-xs">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                    <div className="border-border bg-muted/60 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
                      <Inbox className="text-muted-foreground size-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-foreground text-sm font-semibold">
                        {t("requests.emptyState.title")}
                      </h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t("requests.emptyState.description")}
                      </p>
                    </div>
                    {onCreateNew && (
                      <Button
                        variant="orange"
                        size="sm"
                        onClick={onCreateNew}
                        className="mt-2 text-xs"
                      >
                        <Sparkles className="size-3.5 mr-1.5" />
                        {t("requests.emptyState.createFirst")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const statusInfo =
                  STATUS_BADGE_MAP[req.status] || STATUS_BADGE_MAP.SUBMITTED;
                const deadlineInfo = getSmartDeadline(req.deadline, req.status);

                return (
                  <tr
                    key={req.id}
                    onClick={() => onOpenDetail(req)}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    {/* Topic (2 Tầng) */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-foreground group-hover:text-brand-orange line-clamp-1 font-semibold transition-colors">
                          {req.topic}
                        </span>
                        {req.briefNote && (
                          <p className="text-muted-foreground text-2xs line-clamp-1 italic">
                            "{req.briefNote}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Platforms Icons */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {req.platforms.map((p) => {
                          const pInfo = PLATFORM_ICONS[p] || {
                            icon: <Share2 className="size-3" />,
                            bgClass: "bg-muted border-border",
                            textClass: "text-muted-foreground",
                            label: p,
                          };
                          return (
                            <span
                              key={p}
                              className={`flex size-6 items-center justify-center rounded-lg border ${pInfo.bgClass} ${pInfo.textClass} shadow-2xs`}
                              title={p}
                            >
                              {pInfo.icon}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Client Name */}
                    <td className="px-4 py-3.5">
                      <span className="border-border bg-muted/40 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 font-medium">
                        {req.clientName}
                      </span>
                    </td>

                    {/* Smart Deadline */}
                    <td className="px-4 py-3.5 font-mono text-xs">
                      <span className={deadlineInfo.badgeClass}>
                        {deadlineInfo.isAlert && (
                          <AlertTriangle className="size-3 shrink-0" />
                        )}
                        {deadlineInfo.isWarning && (
                          <Clock className="size-3 shrink-0" />
                        )}
                        {deadlineInfo.text}
                      </span>
                    </td>

                    {/* Status Badge with Dot */}
                    <td className="px-3.5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${statusInfo.labelClass}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${statusInfo.dotClass}`}
                        />
                        {t(`requests.status.${req.status}`)}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5">
                      {req.assignee ? (
                        <div className="flex items-center gap-2">
                          {req.assignee.avatarUrl ? (
                            <img
                              src={req.assignee.avatarUrl}
                              alt={req.assignee.name}
                              className="border-border size-6 rounded-full border object-cover shadow-2xs"
                            />
                          ) : (
                            <div className="bg-brand-orange/15 text-brand-orange flex size-6 items-center justify-center rounded-full text-2xs font-bold">
                              {req.assignee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-foreground max-w-[120px] truncate font-medium">
                            {req.assignee.name}
                          </span>
                        </div>
                      ) : userRole === "MANAGER" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAssignModal(req);
                          }}
                          className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-white h-6 rounded-md px-2 text-2xs font-medium transition-all"
                        >
                          <UserPlus className="size-3 mr-1" />
                          <span>{t("requests.table.assignButton")}</span>
                        </Button>
                      ) : (
                        <span className="text-2xs text-muted-foreground italic">
                          {t("requests.table.unassigned")}
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenDetail(req)}
                          aria-label={t("requests.detail.title")}
                          className="text-muted-foreground hover:text-foreground h-7 w-7 p-0 cursor-pointer"
                          title={t("requests.detail.title")}
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {(userRole === "MANAGER" || userRole === "CREATOR") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGoToEditor(req)}
                            aria-label={t("requests.table.goToEditor")}
                            className="text-brand-orange hover:bg-brand-orange/10 h-7 w-7 p-0 cursor-pointer"
                            title={t("requests.table.goToEditor")}
                          >
                            <ArrowRight className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-border/80 text-muted-foreground bg-muted/40 flex flex-col items-center justify-between gap-3 border-t p-3.5 text-xs sm:flex-row">
        <div>
          {t("requests.table.showing", {
            shown: requests.length,
            total,
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t("requests.v2.previous", { defaultValue: "Trang trước" })}
            className="h-7 w-7 p-0 cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="text-foreground px-2 font-mono font-semibold">
            {t("requests.table.page", { page, totalPages: Math.max(1, totalPages) })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={t("requests.v2.next", { defaultValue: "Trang sau" })}
            className="h-7 w-7 p-0 cursor-pointer"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
