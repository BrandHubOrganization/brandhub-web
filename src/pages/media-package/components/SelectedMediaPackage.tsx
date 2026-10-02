import { useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileEdit,
  Loader2,
  MessageCircleMore,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  applyEffectiveTerms,
  formatPackageType,
  formatPackageValue,
} from "@/pages/media-package/lib/formatMediaPackage";
import { mediaPackageService } from "@/pages/media-package/services/mediaPackageService";
import type {
  NegotiateTermsRequest,
  WorkspaceMediaPackage,
} from "@/pages/media-package/types/mediaPackage";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage } from "@/utils/error";
import { NegotiateTermsModal } from "./NegotiateTermsModal";

export interface SelectedMediaPackageProps {
  selection: WorkspaceMediaPackage | null;
  workspaceId?: string;
  onRefresh?: () => Promise<void> | void;
  onNegotiate?: (terms: NegotiateTermsRequest) => Promise<boolean>;
  onApprove?: () => Promise<boolean>;
  negotiating?: boolean;
  approving?: boolean;
}

interface DualApprovalCardProps {
  label: string;
  roleType: "CLIENT" | "AGENCY";
  approvedAt: string | null;
}

function formatApprovalTime(
  approvedAt: string | null,
  language: string,
): string {
  if (!approvedAt) return "";
  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(approvedAt));
  } catch {
    return approvedAt;
  }
}

function DualApprovalCard({
  label,
  roleType,
  approvedAt,
}: DualApprovalCardProps) {
  const { t, i18n } = useTranslation();
  const isApproved = Boolean(approvedAt);
  const RoleIcon = roleType === "CLIENT" ? UserCheck : Building2;

  return (
    <div
      className={`relative flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
        isApproved
          ? "border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-border bg-background/80"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 items-center justify-center rounded-lg ${
            isApproved
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <RoleIcon className="size-5" />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">{label}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {isApproved ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t("mediaPackage.approval.approvedAt", {
                  defaultValue: `Đã duyệt lúc ${formatApprovalTime(approvedAt, i18n.language)}`,
                  time: formatApprovalTime(approvedAt, i18n.language),
                })}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {t("mediaPackage.approval.waiting", {
                  defaultValue: "Chờ duyệt",
                })}
              </span>
            )}
          </p>
        </div>
      </div>

      <div>
        {isApproved ? (
          <Badge
            variant="secondary"
            className="gap-1 border-emerald-500/30 bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{t("mediaPackage.approval.approvedStatus", "Đã duyệt")}</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 text-amber-700 bg-amber-50/50 dark:border-amber-700/50 dark:text-amber-400 dark:bg-amber-950/30"
          >
            <Clock className="size-3.5" />
            <span>{t("mediaPackage.approval.pendingStatus", "Chờ duyệt")}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

export function SelectedMediaPackage({
  selection,
  workspaceId: propWorkspaceId,
  onRefresh,
  onNegotiate,
  onApprove,
  negotiating = false,
  approving = false,
}: SelectedMediaPackageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const targetWorkspaceId =
    propWorkspaceId || selection?.workspaceId || routeWorkspaceId || "";

  const currentMemberRole = useWorkspaceStore(
    (state) => state.currentMemberRole,
  );
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceList = useWorkspaceStore((state) => state.workspaceList);
  const systemRole = useAuthStore((state) => state.systemRole);

  const effectiveRole =
    currentMemberRole ??
    (targetWorkspaceId
      ? workspaceList.find((w) => w.id === targetWorkspaceId)?.myRole
      : null) ??
    currentWorkspace?.myRole ??
    null;

  const isClient = effectiveRole === "CLIENT";
  const isAgency =
    effectiveRole === "OWNER" ||
    effectiveRole === "MANAGER" ||
    systemRole === "ADMIN";

  if (!selection) {
    return (
      <section className="border-border bg-card rounded-xl border border-dashed p-8 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted/60">
          <FileCheck2 className="text-muted-foreground size-7" />
        </div>
        <h2 className="text-foreground mt-4 text-base font-semibold">
          {t("mediaPackage.selected.emptyTitle")}
        </h2>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xl text-sm leading-relaxed">
          {t("mediaPackage.selected.emptyDescription")}
        </p>
      </section>
    );
  }

  const mediaPackage = applyEffectiveTerms(
    selection.mediaPackage,
    selection.finalTerms,
  );

  const isClientApproved = Boolean(selection.approvedByClientAt);
  const isAgencyApproved = Boolean(selection.approvedByAgencyAt);
  const isDualApproved =
    (isClientApproved && isAgencyApproved) ||
    selection.negotiationStatus === "APPROVED";

  const packageContextId =
    selection.workspaceMediaPackageId || selection.id || "";

  const handleChatNavigate = () => {
    if (!targetWorkspaceId) return;
    navigate(
      `/workspaces/${targetWorkspaceId}/chat?contextType=MEDIA_PACKAGE&contextId=${packageContextId}`,
    );
  };

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove();
      return;
    }

    if (!targetWorkspaceId) return;
    setInternalLoading(true);
    try {
      await mediaPackageService.approvePackage(targetWorkspaceId);
      toast.success(
        t(
          "mediaPackage.messages.approveSuccess",
          "Đã chấp thuận gói dịch vụ thành công.",
        ),
      );
      if (onRefresh) await onRefresh();
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t(
            "mediaPackage.errors.approve",
            "Không thể chấp thuận gói dịch vụ.",
          ),
        ),
      );
    } finally {
      setInternalLoading(false);
    }
  };

  const handleNegotiate = async (
    terms: NegotiateTermsRequest,
  ): Promise<boolean> => {
    if (onNegotiate) {
      return onNegotiate(terms);
    }

    if (!targetWorkspaceId) return false;
    setInternalLoading(true);
    try {
      await mediaPackageService.negotiateTerms(targetWorkspaceId, terms);
      toast.success(
        t(
          "mediaPackage.messages.negotiateSuccess",
          "Đã gửi đề xuất điều chỉnh điều khoản thành công.",
        ),
      );
      if (onRefresh) await onRefresh();
      return true;
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t(
            "mediaPackage.errors.negotiate",
            "Không thể gửi đề xuất điều chỉnh.",
          ),
        ),
      );
      return false;
    } finally {
      setInternalLoading(false);
    }
  };

  const isActionLoading = approving || negotiating || internalLoading;

  return (
    <>
      <section className="border-border bg-card rounded-xl border p-5 shadow-xs md:p-6 transition-all">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {mediaPackage.isTemplate
                  ? t("mediaPackage.badges.template")
                  : t("mediaPackage.badges.custom")}
              </Badge>
              <Badge variant="secondary">
                {t(`mediaPackage.status.${selection.negotiationStatus}`)}
              </Badge>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
              >
                Phiên bản v{selection.termsVersion}
              </Badge>
            </div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {mediaPackage.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              {formatPackageType(mediaPackage.type, t)}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-brand-orange text-2xl font-black">
              {formatPackageValue(mediaPackage, i18n.language, t)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("mediaPackage.selected.termsVersion", {
                version: selection.termsVersion,
              })}
            </p>
          </div>
        </div>

        {/* Dual Approval Banner if complete */}
        {isDualApproved ? (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base">
                    {t(
                      "mediaPackage.selected.approvedCompleted",
                      "Đã phê duyệt hoàn tất (APPROVED)",
                    )}
                  </span>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[11px] px-2 py-0.5">
                    APPROVED
                  </Badge>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                  {t(
                    "mediaPackage.selected.approvedCompletedDescription",
                    "Cả hai bên đã đồng thuận các điều khoản của gói phiên bản v{{version}}. Gói đã có hiệu lực chính thức.",
                    { version: selection.termsVersion },
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {/* Action 1: Đàm phán qua Chat */}
          <Button
            type="button"
            variant="outline"
            onClick={handleChatNavigate}
            className="gap-2 border-border/80 hover:bg-accent hover:text-accent-foreground text-sm font-medium shadow-2xs"
          >
            <MessageCircleMore className="size-4 text-primary" />
            <span>
              {t("mediaPackage.actions.chatNegotiate", "Đàm phán qua Chat")}
            </span>
          </Button>

          {/* Action 2: Đề xuất điều chỉnh điều khoản */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setNegotiateModalOpen(true)}
            className="gap-2 border-border/80 hover:bg-accent hover:text-accent-foreground text-sm font-medium shadow-2xs"
          >
            <FileEdit className="size-4 text-orange-600 dark:text-orange-400" />
            <span>
              {t(
                "mediaPackage.actions.proposeAdjustment",
                "Đề xuất điều chỉnh điều khoản",
              )}
            </span>
          </Button>

          {/* Action 3: Chấp thuận gói dịch vụ (Approve) */}
          {!isDualApproved && (
            <>
              {/* Branch Client */}
              {isClient && (
                <>
                  {!isClientApproved ? (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={isActionLoading}
                      className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs font-semibold text-sm"
                    >
                      {isActionLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      <span>
                        {t(
                          "mediaPackage.actions.clientApprove",
                          "Client: Chấp thuận gói",
                        )}
                      </span>
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1.5 py-1.5 px-3 border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium text-xs"
                    >
                      <Check className="size-3.5 text-emerald-600" />
                      <span>
                        {t(
                          "mediaPackage.approval.clientAlreadyApproved",
                          "Client: Đã chấp thuận (Chờ Agency)",
                        )}
                      </span>
                    </Badge>
                  )}
                </>
              )}

              {/* Branch Agency (Manager / Owner) */}
              {isAgency && (
                <>
                  {!isAgencyApproved ? (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={isActionLoading}
                      className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs font-semibold text-sm"
                    >
                      {isActionLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      <span>
                        {t(
                          "mediaPackage.actions.agencyApprove",
                          "Agency: Chấp thuận gói",
                        )}
                      </span>
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1.5 py-1.5 px-3 border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium text-xs"
                    >
                      <Check className="size-3.5 text-emerald-600" />
                      <span>
                        {t(
                          "mediaPackage.approval.agencyAlreadyApproved",
                          "Agency: Đã chấp thuận (Chờ Khách hàng)",
                        )}
                      </span>
                    </Badge>
                  )}
                </>
              )}
            </>
          )}

          {isDualApproved && (
            <Badge className="bg-emerald-600 text-white gap-1.5 py-1.5 px-3 font-semibold text-xs shadow-2xs">
              <CheckCircle2 className="size-4" />
              <span>
                {t(
                  "mediaPackage.selected.approvedCompletedBadge",
                  "Đã phê duyệt hoàn tất (APPROVED)",
                )}
              </span>
            </Badge>
          )}
        </div>

        {/* Dual Approval Checklist & Timeline */}
        <div className="border-border mt-6 border-t pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-foreground text-sm font-semibold flex items-center gap-2">
                <span>
                  {t(
                    "mediaPackage.selected.dualApprovalTitle",
                    "Quy trình phê duyệt hai phía (Dual Approval)",
                  )}
                </span>
                <Badge variant="outline" className="text-[11px] font-normal">
                  Phiên bản v{selection.termsVersion}
                </Badge>
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t(
                  "mediaPackage.selected.dualApprovalDesc",
                  "Cần sự phê duyệt từ cả Khách hàng và Agency để các điều khoản gói có hiệu lực chính thức.",
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DualApprovalCard
              label={t(
                "mediaPackage.selected.clientApprovalTitle",
                "Phía Khách hàng (Client)",
              )}
              roleType="CLIENT"
              approvedAt={selection.approvedByClientAt}
            />
            <DualApprovalCard
              label={t(
                "mediaPackage.selected.agencyApprovalTitle",
                "Phía Agency (Manager)",
              )}
              roleType="AGENCY"
              approvedAt={selection.approvedByAgencyAt}
            />
          </div>
        </div>

        {/* Scope of Work Section */}
        <div className="border-border mt-6 border-t pt-5">
          <h3 className="text-foreground text-sm font-semibold">
            {t("mediaPackage.selected.scopeTitle")}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6 whitespace-pre-line rounded-lg bg-muted/30 p-3.5 border border-border/50">
            {mediaPackage.scopeDescription ||
              t("mediaPackage.catalog.noDescription")}
          </p>
        </div>
      </section>

      {/* Modal Đề xuất điều chỉnh điều khoản */}
      <NegotiateTermsModal
        open={negotiateModalOpen}
        onOpenChange={setNegotiateModalOpen}
        mediaPackage={mediaPackage}
        currentTermsVersion={selection.termsVersion}
        loading={isActionLoading}
        onSubmit={handleNegotiate}
      />
    </>
  );
}
