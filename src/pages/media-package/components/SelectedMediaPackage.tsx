import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  applyEffectiveTerms,
  formatPackageValue,
} from "../lib/formatMediaPackage";
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
    <div className="border-border flex items-start gap-3 rounded-lg border p-3">
      {approvedAt ? (
        <CheckCircle2
          className="text-success mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <Clock
          className="text-muted-foreground mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
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
      <section className="border-border bg-card rounded-xl border border-dashed px-6 py-10 text-center">
        <h2 className="font-semibold">
          {t("mediaPackage.selected.emptyTitle")}
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-6">
          {t("mediaPackage.selected.emptyDescription")}
        </p>
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
      <section className="border-border bg-card space-y-6 rounded-xl border p-4 sm:p-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={isDualApproved ? "APPROVED" : "secondary"}>
                {t(`mediaPackage.status.${selection.negotiationStatus}`)}
              </Badge>
              <Badge variant="outline">
                {t("mediaPackage.selected.termsVersion", {
                  version: selection.termsVersion,
                })}
              </Badge>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight break-words">
              {mediaPackage.name}
            </h2>
          </div>
          <p className="shrink-0 text-2xl font-semibold tracking-tight">
            {formatPackageValue(mediaPackage, i18n.language, t)}
          </p>
        </header>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                {t("mediaPackage.selected.scopeTitle")}
              </h3>
              <p className="text-muted-foreground text-sm leading-7 break-words whitespace-pre-line">
                {mediaPackage.scopeDescription ||
                  t("mediaPackage.catalog.noDescription")}
              </p>
            </section>
            <OfferingSummary value={mediaPackage} />
            {selection.previousTerms && (
              <PackageTermsDiff
                before={selection.previousTerms}
                after={selection.finalTerms}
              />
            )}
          </div>
          <aside className="border-border space-y-4 rounded-xl border p-4 xl:sticky xl:top-4">
            <div>
              <h3 className="font-semibold">
                {t("mediaPackage.selected.dualApprovalTitle")}
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {t("mediaPackage.ui.approvalHint")}
              </p>
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
                className="h-auto min-h-10 w-full whitespace-normal"
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
                className="h-auto min-h-10 w-full whitespace-normal"
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
              className="w-full"
              onClick={handleChatNavigate}
            >
              {t("mediaPackage.actions.chatNegotiate")}
            </Button>
            {isDualApproved && (
              <div className="border-border space-y-3 border-t pt-4">
                <p className="text-muted-foreground text-sm leading-6">
                  {t("mediaPackage.ui.campaignReady")}
                </p>
                <Button asChild variant="orange" className="w-full">
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
