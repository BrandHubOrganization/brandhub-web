import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  History,
  Info,
  Layers,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/ui/rich-text-input";
import { Button } from "@/components/ui/button";
import { HoldButton, RubberSegment } from "@/components/micro";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState<
    "deliverables" | "termsDiff" | "history"
  >("deliverables");
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
  const isClientApproved = Boolean(selection.approvedByClientAt);
  const isAgencyApproved = Boolean(selection.approvedByAgencyAt);
  const isDualApproved =
    (isClientApproved && isAgencyApproved) ||
    selection.negotiationStatus === "APPROVED";

  const handleChatNavigate = () => {
    if (!targetWorkspaceId) return;
    navigate(`/workspaces/${targetWorkspaceId}/chat`);
  };
  const packageContextId =
    selection.workspaceMediaPackageId || selection.id || "";

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

  const formattedBudget =
    mediaPackage.budgetAmount == null
      ? t("mediaPackage.compact.agreeLater")
      : new Intl.NumberFormat(i18n.language, {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(mediaPackage.budgetAmount);

  const formattedDuration =
    mediaPackage.durationWeeks == null
      ? t("mediaPackage.compact.agreeLater")
      : t("mediaPackage.values.duration", {
          count: mediaPackage.durationWeeks,
        });

  const deliverablesCount =
    mediaPackage.offeringDetails?.deliverables?.length ?? 0;

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
    <div className="space-y-4">
      {/* A. Compact Header Strip */}
      <div className="border border-border/70 bg-card rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Package Name, Status Badge, Version Badge */}
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <h2
            className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate max-w-xs sm:max-w-md"
            title={mediaPackage.name}
          >
            {mediaPackage.name}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
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
        </div>

        {/* Right: Compact stats pills inline */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-muted/60 text-muted-foreground">
            <Wallet className="size-3.5 text-brand-orange" aria-hidden="true" />
            <b className="text-foreground font-mono tabular-nums">{formattedBudget}</b>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-muted/60 text-muted-foreground">
            <Clock className="size-3.5 text-brand-orange" aria-hidden="true" />
            <b className="text-foreground font-mono tabular-nums">{formattedDuration}</b>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-muted/60 text-muted-foreground">
            <Layers className="size-3.5 text-brand-orange" aria-hidden="true" />
            <b className="text-foreground font-mono tabular-nums">{deliverablesCount}</b>{" "}
            {t("mediaPackage.ui.deliverablesCountUnit", { defaultValue: "hạng mục" })}
          </span>
        </div>
      </div>

      {/* B. Main Layout: 2 Columns */}
      <div className="grid items-start gap-5 lg:grid-cols-12">
        {/* Left Column: Master Canvas */}
        <div className="min-w-0 lg:col-span-8 space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={(next) =>
              setActiveTab(next as "deliverables" | "termsDiff" | "history")
            }
            className="w-full"
          >
            <RubberSegment
              size="sm"
              variant="solid"
              ariaLabel={t("mediaPackage.ui.deliverables", "Hạng mục & Gói dịch vụ")}
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full overflow-x-auto sm:w-auto"
              options={[
                {
                  value: "deliverables" as const,
                  icon: <Layers className="size-3.5" aria-hidden="true" />,
                  label: t("mediaPackage.ui.deliverables", "Hạng mục & Gói dịch vụ"),
                },
                {
                  value: "termsDiff" as const,
                  icon: <ArrowLeftRight className="size-3.5" aria-hidden="true" />,
                  label: t("mediaPackage.ui.compare", "So sánh điều khoản"),
                  badge: selection.previousTerms ? (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] leading-tight font-medium"
                    >
                      {t("mediaPackage.ui.changed", "Đã đổi")}
                    </Badge>
                  ) : undefined,
                },
                {
                  value: "history" as const,
                  icon: <History className="size-3.5" aria-hidden="true" />,
                  label: t("mediaPackage.history.title", "Lịch sử thương lượng"),
                },
              ]}
            />

            <TabsContent value="deliverables" className="mt-4 space-y-4 outline-none">
              {mediaPackage.scopeDescription && (
                <div className="rounded-xl border border-border/70 bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">
                    {t("mediaPackage.selected.scopeTitle", "Phạm vi công việc")}
                  </p>
                  <RichTextContent
                    value={mediaPackage.scopeDescription}
                    className="text-xs leading-relaxed text-muted-foreground"
                  />
                </div>
              )}
              <OfferingSummary value={mediaPackage} />
            </TabsContent>

            <TabsContent value="termsDiff" className="mt-4 outline-none">
              {selection.previousTerms ? (
                <PackageTermsDiff
                  before={selection.previousTerms}
                  after={selection.finalTerms}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center text-muted-foreground">
                  <Info className="mb-2 size-6 text-muted-foreground/60" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">
                    {t("mediaPackage.ui.noDifferences", "Chưa có phiên bản điều chỉnh trước đó")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    {t(
                      "mediaPackage.history.baseline",
                      "Mốc bắt đầu ghi nhận: chỉ xác nhận điều khoản tại phiên bản này, không có thông tin về các vòng đàm phán trước đó.",
                    )}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 outline-none">
              <PackageNegotiationHistory
                key={packageContextId}
                workspaceId={targetWorkspaceId}
                currentVersion={selection.termsVersion}
                currentTerms={selection.finalTerms}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sticky Inspector Sidebar */}
        <aside className="border border-border/80 bg-card space-y-4 rounded-xl p-4 shadow-2xs lg:col-span-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-foreground text-sm font-semibold">
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
            <HoldButton
              size="default"
              durationMs={850}
              loading={isActionLoading}
              holdHint={t("mediaPackage.actions.holdToApprove", {
                defaultValue: "Giữ để chấp thuận gói",
              })}
              className="w-full"
              onCommit={handleApprove}
            >
              {t(
                isClient
                  ? "mediaPackage.actions.clientApprove"
                  : "mediaPackage.actions.agencyApprove",
              )}
            </HoldButton>
          )}

          {!isDualApproved && (
            <Button
              variant="outline"
              className="w-full font-medium"
              disabled={isActionLoading}
              data-package-negotiate
              onClick={() => changeNegotiationOpen(true)}
            >
              {t("mediaPackage.actions.proposeAdjustment")}
            </Button>
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
    </div>
  );
}
