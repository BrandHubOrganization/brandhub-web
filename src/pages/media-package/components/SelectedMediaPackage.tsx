import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock, Layers, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/shared/HelpHint";
import { applyEffectiveTerms } from "../lib/formatMediaPackage";
import { mediaPackageService } from "../services/mediaPackageService";
import type {
  NegotiateTermsRequest,
  WorkspaceMediaPackage,
} from "../types/mediaPackage";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { packageMutationError } from "../lib/packageMutationError";
import { NegotiateTermsForm } from "./NegotiateTermsForm";
import { OfferingSummary } from "./OfferingSummary";
import { PackageTermsDiff } from "./PackageTermsDiff";
import { PackageNegotiationHistory } from "./PackageNegotiationHistory";

export interface SelectedMediaPackageProps {
  selection: WorkspaceMediaPackage | null;
  workspaceId?: string;
  onRefresh?: () => Promise<void> | void;
  onNegotiate?: (terms: NegotiateTermsRequest) => Promise<boolean>;
  onApprove?: () => Promise<boolean>;
  negotiating?: boolean;
  approving?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

function ApprovalStatus({
  label,
  approvedAt,
}: {
  label: string;
  approvedAt: string | null;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        approvedAt
          ? "border-emerald-500/25 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/10"
          : "border-border/70 bg-muted/20"
      }`}
    >
      {approvedAt ? (
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
      ) : (
        <Clock
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
      )}
      <div className="min-w-0">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-5">
          {approvedAt
            ? t("mediaPackage.approval.approvedAt", {
                time: new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(approvedAt)),
              })
            : t("mediaPackage.approval.waiting")}
        </p>
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
  onEditingChange,
}: SelectedMediaPackageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const changeNegotiationOpen = (open: boolean) => {
    setNegotiationOpen(open);
    onEditingChange?.(open);
  };
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

  if (!selection)
    return (
      <section className="border-border bg-muted/20 rounded-lg border border-dashed px-4 py-3 text-sm">
        <h2 className="font-medium">{t("mediaPackage.selected.emptyTitle")}</h2>
      </section>
    );

  const mediaPackage = applyEffectiveTerms(
    selection.mediaPackage,
    selection.finalTerms,
  );
  const maxClientProposals = mediaPackage.offeringDetails?.maxChanges;
  const clientProposalLimitReached =
    isClient &&
    maxClientProposals != null &&
    (selection.clientProposalCount ?? 0) >= maxClientProposals;

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
      await mediaPackageService.approvePackage(
        targetWorkspaceId,
        selection.termsVersion,
      );
      toast.success(
        t(
          "mediaPackage.messages.approveSuccess",
          "Đã chấp thuận gói dịch vụ thành công.",
        ),
      );
      if (onRefresh) await onRefresh();
    } catch (requestError: unknown) {
      toast.error(
        packageMutationError(
          requestError,
          t("mediaPackage.errors.approve", "Không thể chấp thuận gói dịch vụ."),
          t,
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
        packageMutationError(
          requestError,
          t(
            "mediaPackage.errors.negotiate",
            "Không thể gửi đề xuất điều chỉnh.",
          ),
          t,
        ),
      );
      return false;
    } finally {
      setInternalLoading(false);
    }
  };

  const isActionLoading = approving || negotiating || internalLoading;

  const mineApproved = isClient ? isClientApproved : isAgencyApproved;
  if (negotiationOpen)
    return (
      <NegotiateTermsForm
        open={negotiationOpen}
        onOpenChange={changeNegotiationOpen}
        mediaPackage={mediaPackage}
        currentTermsVersion={selection.termsVersion}
        loading={isActionLoading}
        clientNegotiation={isClient}
        onSubmit={handleNegotiate}
      />
    );
  return (
    <>
      <section className="border-border/80 bg-card relative space-y-5 rounded-2xl border p-5 shadow-xs ring-1 ring-border/50 ring-offset-2 ring-offset-background sm:p-6">
        {/* Bento Grid Header & Facts */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Main Hero Header Tile */}
          <div className="border-border/70 bg-muted/15 flex flex-col justify-between rounded-xl border p-4 sm:col-span-2 lg:col-span-3">
            <div>
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <Badge
                  variant={isDualApproved ? "APPROVED" : "secondary"}
                  className="text-xs"
                >
                  {t(`mediaPackage.status.${selection.negotiationStatus}`)}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {t("mediaPackage.selected.termsVersion", {
                    version: selection.termsVersion,
                  })}
                </Badge>
              </div>
              <h2 className="text-foreground text-xl font-bold tracking-tight break-words sm:text-2xl">
                {mediaPackage.name}
              </h2>
            </div>
            {mediaPackage.scopeDescription && (
              <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed break-words whitespace-pre-line">
                {mediaPackage.scopeDescription}
              </p>
            )}
          </div>

          {/* Fact 1: Budget */}
          <div className="border-border/70 bg-muted/15 flex flex-col justify-between rounded-xl border p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {t("mediaPackage.form.budgetLabel")}
              </span>
              <Wallet className="text-brand-orange size-4 shrink-0" aria-hidden="true" />
            </div>
            <p className="text-foreground mt-3 text-lg font-bold tracking-tight break-words">
              {mediaPackage.budgetAmount == null
                ? t("mediaPackage.compact.agreeLater")
                : new Intl.NumberFormat(i18n.language, {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(mediaPackage.budgetAmount)}
            </p>
          </div>

          {/* Fact 2: Duration */}
          <div className="border-border/70 bg-muted/15 flex flex-col justify-between rounded-xl border p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {t("mediaPackage.compact.duration")}
              </span>
              <Clock className="text-brand-orange size-4 shrink-0" aria-hidden="true" />
            </div>
            <p className="text-foreground mt-3 text-lg font-bold tracking-tight">
              {mediaPackage.durationWeeks == null
                ? t("mediaPackage.compact.agreeLater")
                : t("mediaPackage.values.duration", {
                    count: mediaPackage.durationWeeks,
                  })}
            </p>
          </div>

          {/* Fact 3: Deliverables summary */}
          <div className="border-border/70 bg-muted/15 flex flex-col justify-between rounded-xl border p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {t("mediaPackage.ui.deliverables")}
              </span>
              <Layers className="text-brand-orange size-4 shrink-0" aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-foreground text-lg font-bold tracking-tight">
                {mediaPackage.offeringDetails?.deliverables?.length ?? 0}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("mediaPackage.ui.deliverablesCountUnit", {
                    defaultValue: "hạng mục",
                  })}
                </span>
              </p>
              {mediaPackage.offeringDetails?.maxChanges != null && (
                <span className="text-muted-foreground text-xs">
                  · {t("mediaPackage.offering.revisions")}: {mediaPackage.offeringDetails.maxChanges}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18.5rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-5">
            <OfferingSummary value={mediaPackage} />
            {selection.previousTerms && (
              <PackageTermsDiff
                before={selection.previousTerms}
                after={selection.finalTerms}
              />
            )}
          </div>
          <aside className="border-border/80 bg-muted/10 space-y-4 rounded-xl border p-4 lg:sticky lg:top-4">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm">
                {t("mediaPackage.selected.dualApprovalTitle")}
              </h3>
              <HelpHint label={t("mediaPackage.selected.dualApprovalTitle")}>
                {t("mediaPackage.ui.approvalHint")}
              </HelpHint>
            </div>
            <ApprovalStatus
              label={t("mediaPackage.selected.clientApprovalTitle")}
              approvedAt={selection.approvedByClientAt}
            />
            <ApprovalStatus
              label={t("mediaPackage.selected.agencyApprovalTitle")}
              approvedAt={selection.approvedByAgencyAt}
            />
            {!isDualApproved && (isClient || isAgency) && !mineApproved && (
              <Button
                variant="orange"
                className="w-full font-medium"
                loading={isActionLoading}
                onClick={handleApprove}
              >
                {t(
                  isClient
                    ? "mediaPackage.actions.clientApprove"
                    : "mediaPackage.actions.agencyApprove",
                )}
              </Button>
            )}
            {!isDualApproved && (
              <Button
                variant="outline"
                className="w-full font-medium"
                disabled={isActionLoading || clientProposalLimitReached}
                data-package-negotiate
                onClick={() => changeNegotiationOpen(true)}
              >
                {t("mediaPackage.actions.proposeAdjustment")}
              </Button>
            )}
            {maxClientProposals != null && (
              <p className="text-muted-foreground text-xs leading-5">
                {t("mediaPackage.ui.clientProposals", {
                  count: selection.clientProposalCount ?? 0,
                  limit: maxClientProposals,
                })}
              </p>
            )}
            {clientProposalLimitReached && (
              <p
                role="status"
                className="text-muted-foreground text-xs leading-5"
              >
                {t("mediaPackage.ui.proposalLimit")}
              </p>
            )}
            <Button
              variant="ghost"
              className="w-full font-medium"
              onClick={handleChatNavigate}
            >
              {t("mediaPackage.actions.chatNegotiate")}
            </Button>
            {isDualApproved && (
              <div className="border-border space-y-3 border-t pt-4">
                <Button asChild variant="orange" className="w-full font-medium">
                  <Link to={`/workspaces/${targetWorkspaceId}/campaigns`}>
                    {t("mediaPackage.ui.openCampaign")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      </section>
      <PackageNegotiationHistory
        key={packageContextId}
        workspaceId={targetWorkspaceId}
        currentVersion={selection.termsVersion}
        currentTerms={selection.finalTerms}
      />
    </>
  );
}
