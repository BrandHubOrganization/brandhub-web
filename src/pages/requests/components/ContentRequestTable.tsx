import React from "react";
import type {
  ContentRequest,
  ContentRequestStatus,
  SocialPlatform,
} from "@/types/contentRequest";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, UserPlus, ArrowRight } from "lucide-react";

interface ContentRequestTableProps {
  requests: ContentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  userRole?: string;
  onPageChange: (newPage: number) => void;
  onOpenAssignModal: (req: ContentRequest) => void;
}

const STATUS_BADGE_MAP: Record<
  ContentRequestStatus,
  { label: string; className: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-muted text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  },
  ASSIGNED: {
    label: "Assigned",
    className:
      "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className:
      "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
  SENT_TO_CLIENT: {
    label: "Sent to Client",
    className:
      "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

const PLATFORM_COLOR_MAP: Record<
  SocialPlatform,
  { bg: string; text: string; label: string }
> = {
  FACEBOOK: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-600 dark:text-blue-400",
    label: "FB",
  },
  INSTAGRAM: {
    bg: "bg-pink-100 dark:bg-pink-950",
    text: "text-pink-600 dark:text-pink-400",
    label: "IG",
  },
  TIKTOK: {
    bg: "bg-zinc-900 dark:bg-zinc-800",
    text: "text-white",
    label: "TT",
  },
  THREADS: {
    bg: "bg-zinc-800 dark:bg-zinc-700",
    text: "text-white",
    label: "TH",
  },
  YOUTUBE: {
    bg: "bg-red-100 dark:bg-red-950",
    text: "text-red-600 dark:text-red-400",
    label: "YT",
  },
};

export const ContentRequestTable: React.FC<ContentRequestTableProps> = ({
  requests,
  total,
  page,
  totalPages,
  userRole = "ACCOUNT",
  onPageChange,
  onOpenAssignModal,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (req: ContentRequest) => {
    navigate("/editor", {
      state: {
        templateTitle: req.topic,
        prefilledCaption: `[Client: ${req.clientName}] ${req.topic}\n\nHạn hoàn thành: ${req.deadline}`,
      },
    });
  };

  return (
    <div className="bg-card border-border/80 flex min-h-[500px] flex-col justify-between overflow-hidden rounded-xl border shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted/60 border-border/80 text-muted-foreground border-b text-2xs font-bold tracking-wider uppercase">
              <th className="px-4 py-3.5">Topic / Chủ Đề</th>
              <th className="px-3 py-3.5">Platforms</th>
              <th className="px-4 py-3.5">Khách Hàng (Client)</th>
              <th className="px-3 py-3.5">Deadline</th>
              <th className="px-3 py-3.5">Trạng Thái</th>
              <th className="px-4 py-3.5">Người Phân Công</th>
              <th className="px-4 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800/80">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400">
                  Không tìm thấy yêu cầu nội dung nào phù hợp.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const statusInfo =
                  STATUS_BADGE_MAP[req.status] || STATUS_BADGE_MAP.SUBMITTED;
                return (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req)}
                    className="group cursor-pointer transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    {/* Topic */}
                    <td className="text-foreground group-hover:text-brand-orange dark:group-hover:text-brand-orange/80 max-w-xs truncate px-4 py-3.5 font-semibold transition-colors">
                      {req.topic}
                    </td>

                    {/* Platforms Icons */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        {req.platforms.map((p) => {
                          const pInfo = PLATFORM_COLOR_MAP[p] || {
                            bg: "bg-zinc-100",
                            text: "text-zinc-700",
                            label: p,
                          };
                          return (
                            <span
                              key={p}
                              className={`rounded-xl px-1.5 py-0.5 font-mono text-3xs font-bold ${pInfo.bg} ${pInfo.text}`}
                              title={p}
                            >
                              {pInfo.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Client Name */}
                    <td className="px-4 py-3.5 font-medium text-zinc-700 dark:text-zinc-300">
                      {req.clientName}
                    </td>

                    {/* Deadline */}
                    <td className="px-3 py-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                      {req.deadline}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-2xs font-semibold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5">
                      {req.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={req.assignee.avatarUrl}
                            alt={req.assignee.name}
                            className="size-6 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                          />
                          <span className="text-foreground max-w-[120px] truncate font-medium">
                            {req.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xs text-zinc-400 italic">
                          Chưa phân công
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {/* Assign Button for Account Manager */}
                        {userRole === "ACCOUNT" && (
                          <button
                            onClick={() => onOpenAssignModal(req)}
                            className="bg-brand-orange-soft dark:bg-brand-orange/20 hover:bg-brand-orange dark:hover:bg-brand-orange text-brand-orange dark:text-brand-orange/80 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:text-white"
                            title="Phân công nhân sự"
                          >
                            <UserPlus className="size-3.5" />
                            <span>Assign</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRowClick(req)}
                          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          title="Chuyển đến Editor"
                        >
                          <ArrowRight className="size-4" />
                        </button>
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
      <div className="border-border/80 text-muted-foreground flex flex-col items-center justify-between gap-3 border-t bg-zinc-50 p-4 text-xs sm:flex-row dark:bg-zinc-900/50">
        <div>
          Hiển thị{" "}
          <span className="text-foreground font-semibold">
            {requests.length}
          </span>{" "}
          / <span className="text-foreground font-semibold">{total}</span> yêu
          cầu nội dung (20 dòng/trang)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-zinc-200 p-1.5 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-foreground px-2 font-mono font-semibold">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-zinc-200 p-1.5 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
