import React from 'react';
import type { ContentRequest, ContentRequestStatus, SocialPlatform } from '@/types/contentRequest';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

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

const STATUS_BADGE_MAP: Record<ContentRequestStatus, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' },
  ASSIGNED: { label: 'Assigned', className: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  PENDING_REVIEW: { label: 'Pending Review', className: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  SENT_TO_CLIENT: { label: 'Sent to Client', className: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  REJECTED: { label: 'Rejected', className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
};

const PLATFORM_COLOR_MAP: Record<SocialPlatform, { bg: string; text: string; label: string }> = {
  FACEBOOK: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', label: 'FB' },
  INSTAGRAM: { bg: 'bg-pink-100 dark:bg-pink-950', text: 'text-pink-600 dark:text-pink-400', label: 'IG' },
  TIKTOK: { bg: 'bg-zinc-900 dark:bg-zinc-800', text: 'text-white', label: 'TT' },
  THREADS: { bg: 'bg-zinc-800 dark:bg-zinc-700', text: 'text-white', label: 'TH' },
  YOUTUBE: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', label: 'YT' },
};

export const ContentRequestTable: React.FC<ContentRequestTableProps> = ({
  requests,
  total,
  page,
  totalPages,
  userRole = 'ACCOUNT',
  onPageChange,
  onOpenAssignModal,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (req: ContentRequest) => {
    navigate('/editor', {
      state: {
        templateTitle: req.topic,
        prefilledCaption: `[Client: ${req.clientName}] ${req.topic}\n\nHạn hoàn thành: ${req.deadline}`,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between min-h-[500px]">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Topic / Chủ Đề</th>
              <th className="py-3.5 px-3">Platforms</th>
              <th className="py-3.5 px-4">Khách Hàng (Client)</th>
              <th className="py-3.5 px-3">Deadline</th>
              <th className="py-3.5 px-3">Trạng Thái</th>
              <th className="py-3.5 px-4">Người Phân Công</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-zinc-400">
                  Không tìm thấy yêu cầu nội dung nào phù hợp.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const statusInfo = STATUS_BADGE_MAP[req.status] || STATUS_BADGE_MAP.SUBMITTED;
                return (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Topic */}
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-xs truncate">
                      {req.topic}
                    </td>

                    {/* Platforms Icons */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        {req.platforms.map((p) => {
                          const pInfo = PLATFORM_COLOR_MAP[p] || { bg: 'bg-zinc-100', text: 'text-zinc-700', label: p };
                          return (
                            <span
                              key={p}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${pInfo.bg} ${pInfo.text}`}
                              title={p}
                            >
                              {pInfo.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Client Name */}
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {req.clientName}
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {req.deadline}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4">
                      {req.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={req.assignee.avatarUrl}
                            alt={req.assignee.name}
                            className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[120px]">
                            {req.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">Chưa phân công</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Assign Button for Account Manager */}
                        {userRole === 'ACCOUNT' && (
                          <button
                            onClick={() => onOpenAssignModal(req)}
                            className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                            title="Phân công nhân sự"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRowClick(req)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Chuyển đến Editor"
                        >
                          <ArrowRight className="w-4 h-4" />
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
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Hiển thị <span className="font-semibold text-zinc-800 dark:text-zinc-200">{requests.length}</span> / <span className="font-semibold text-zinc-800 dark:text-zinc-200">{total}</span> yêu cầu nội dung (20 dòng/trang)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold px-2">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
