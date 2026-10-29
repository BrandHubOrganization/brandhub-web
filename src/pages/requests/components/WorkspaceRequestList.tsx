import { useTranslation } from "react-i18next";
import { FileText, SearchX, RotateCcw, Check, CheckCircle2, Ban, Eye, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocialPlatformBadge } from "@/components/common/SocialPlatformBadge";
import type { RequestPage, ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

interface WorkspaceRequestListProps {
  result: RequestPage;
  hasActiveFilters?: boolean;
  onSelect: (id: string) => void;
  onPage: (page: number) => void;
  onResetFilters?: () => void;
  onReview?: (request: WorkspaceRequest, action: ReviewAction) => void;
  onEdit?: (request: WorkspaceRequest) => void;
}

export function WorkspaceRequestList({
  result,
  hasActiveFilters = false,
  onSelect,
  onPage,
  onResetFilters,
  onReview,
  onEdit,
}: WorkspaceRequestListProps) {
  const { t, i18n } = useTranslation();

  // P1: Xử lý trạng thái trống (Empty State)
  if (!result.items.length) {
    return (
      <div className="bg-card border-border/80 flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-2xs">
        {hasActiveFilters ? (
          <>
            <div className="bg-brand-orange/10 text-brand-orange mb-4 flex size-12 items-center justify-center rounded-2xl">
              <SearchX aria-hidden="true" className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {t("requests.v2.emptyFilteredTitle")}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm">
              {t("requests.v2.emptyFilteredHelp")}
            </p>
            {onResetFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="mt-5 text-xs rounded-xl"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                {t("requests.v2.resetFilters")}
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-2xl">
              <FileText aria-hidden="true" className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {t("requests.v2.empty")}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm">
              {t("requests.v2.emptyHelp")}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label={t("requests.v2.title")}>
      <div className="bg-card border-border/80 divide-border divide-y overflow-hidden rounded-2xl border shadow-2xs">
        {result.items.map((request) => (
          <div
            key={request.id}
            className="hover:bg-muted/30 group flex flex-col gap-4 p-4.5 transition-colors sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Title & Metadata */}
            <div className="min-w-0 flex-1 space-y-2">
              <Button
                variant="link"
                className="text-foreground hover:text-brand-orange h-auto max-w-full justify-start whitespace-normal break-words p-0 text-left text-sm font-semibold"
                onClick={() => onSelect(request.id)}
              >
                {request.title}
              </Button>
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="font-medium border-border/80 bg-background/50"
                >
                  {t(`requests.v2.status.${request.status}`)}
                </Badge>
                <span className="bg-muted/50 rounded px-2 py-0.5 text-2xs font-medium">
                  {t(`requests.v2.types.${request.type}`)}
                </span>
                {request.type === "POST" && request.targetPlatforms && request.targetPlatforms.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1">
                    {request.targetPlatforms.map((platform) => (
                      <SocialPlatformBadge key={platform} platform={platform} size="xs" />
                    ))}
                  </span>
                )}
                <span className="font-mono text-2xs">
                  {t("requests.v2.due", {
                    date: new Date(request.dueDate).toLocaleDateString(i18n.language),
                  })}
                </span>
              </div>
            </div>

            {/* P3: Quick Actions trên từng dòng danh sách */}
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {/* Quick Actions cho quản lý xét duyệt */}
              {onReview && request.canReceive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(request, "receive")}
                  className="h-8 text-xs rounded-lg"
                  title={t("requests.v2.review.receive")}
                >
                  <Check className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">{t("requests.v2.review.receive")}</span>
                </Button>
              )}
              {onReview && request.canAccept && (
                <Button
                  variant="orange"
                  size="sm"
                  onClick={() => onReview(request, "accept")}
                  className="h-8 text-xs rounded-lg"
                  title={t("requests.v2.review.accept")}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">{t("requests.v2.review.accept")}</span>
                </Button>
              )}
              {onReview && request.canDeny && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReview(request, "deny")}
                  className="text-muted-foreground hover:text-destructive h-8 text-xs rounded-lg"
                  title={t("requests.v2.review.deny")}
                >
                  <Ban className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">{t("requests.v2.review.deny")}</span>
                </Button>
              )}

              {/* Quick Action chỉnh sửa cho requester */}
              {onEdit && request.canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(request)}
                  className="text-muted-foreground hover:text-foreground h-8 text-xs rounded-lg"
                  title={t("requests.v2.edit")}
                >
                  <Edit3 className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">{t("requests.v2.edit")}</span>
                </Button>
              )}

              {/* Nút Xem chi tiết chuẩn */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(request.id)}
                className="h-8 text-xs rounded-lg"
              >
                <Eye className="size-3.5 mr-1 text-muted-foreground" />
                {t("requests.v2.detail")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
        <p className="text-muted-foreground text-xs">
          {t("requests.v2.count", { count: result.total })}
        </p>
        <nav className="flex items-center gap-2" aria-label={t("requests.v2.pagination")}>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page === 0}
            onClick={() => onPage(result.page - 1)}
            className="h-8 text-xs rounded-lg"
          >
            {t("requests.v2.previous")}
          </Button>
          <span className="text-muted-foreground px-1 text-xs">
            {t("requests.v2.page", {
              page: result.page + 1,
              total: Math.max(1, result.totalPages),
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page + 1 >= result.totalPages}
            onClick={() => onPage(result.page + 1)}
            className="h-8 text-xs rounded-lg"
          >
            {t("requests.v2.next")}
          </Button>
        </nav>
      </div>
    </section>
  );
}
