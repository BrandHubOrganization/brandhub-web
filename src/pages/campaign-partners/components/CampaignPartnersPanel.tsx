import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Clock,
  ExternalLink,
  RotateCw,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { FuseButton, GlideSelect } from "@/components/micro";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { PartnerContactCardInfo } from "./PartnerContactCardInfo";
import { PartnerPicker } from "./PartnerPicker";
import { useCampaignPartners } from "../hooks/useCampaignPartners";
import { COOPERATION_STATUSES, type CooperationStatus } from "../types";

const COOPERATION_DOT: Record<CooperationStatus, string> = {
  CONTACTED: "bg-amber-500",
  NEGOTIATING: "bg-sky-500",
  CONFIRMED: "bg-emerald-500",
  LIVE: "bg-brand-orange",
};

export function getCooperationStatusBadge(status: string) {
  switch (status) {
    case "INVITED":
    case "CONTACTED":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "NEGOTIATING":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400";
    case "ACCEPTED":
    case "CONFIRMED":
    case "LIVE":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "REJECTED":
    case "TERMINATED":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export function CampaignPartnersPanel({
  workspaceId,
  externalState,
  compact = false,
  campaignCompleted = false,
}: {
  workspaceId: string;
  externalState?: ReturnType<typeof useCampaignPartners>;
  compact?: boolean;
  campaignCompleted?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const internalState = useCampaignPartners(workspaceId, 20, !externalState);
  const state = externalState ?? internalState;
  const { data, busy, loading, error } = state;

  if (loading) {
    return (
      <div role="status" className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        role="alert"
        className="border-destructive/30 bg-destructive/5 space-y-3 rounded-xl border p-5"
      >
        <p className="text-destructive text-sm font-medium">
          {t("campaign.partners.error")}
        </p>
        <Button variant="outline" size="sm" onClick={state.reload}>
          {t("campaign.reload")}
        </Button>
      </div>
    );
  }

  if (!data.campaignId) {
    return (
      <div className="border-border bg-muted/20 rounded-xl border border-dashed p-6 text-center">
        <Users className="text-muted-foreground/60 mx-auto mb-2 size-8" />
        <p className="text-muted-foreground text-sm">
          {t("campaign.partners.noCampaign")}
        </p>
      </div>
    );
  }

  const canModify = data.canEdit && !campaignCompleted;
  const assignedIds = data.partners.content.map((item) => item.collaboratorId);

  return (
    <div className="space-y-5">
      {!compact ? (
        <div className="border-border bg-card rounded-xl border p-4 shadow-2xs sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h2 className="text-foreground break-words text-lg font-bold tracking-tight sm:text-xl">
                {data.campaignName}
              </h2>
              <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm">
                {t("campaign.partners.description")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shadow-2xs"
              disabled={busy}
              onClick={state.reload}
            >
              <RotateCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
              <span>{t("campaign.reload")}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 shadow-2xs">
          <div className="min-w-0">
            <h3 className="text-foreground text-sm font-bold">
              {t("campaign.partners.title")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("campaign.partners.embeddedSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={busy}
              onClick={state.reload}
            >
              <RotateCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
              <span>{t("campaign.reload")}</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
              <Link to={`/workspaces/${workspaceId}/campaign-partners`}>
                <ExternalLink className="size-3.5" />
                <span>{t("campaign.partners.openFullPage")}</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {canModify && (
        <PartnerPicker
          workspaceId={workspaceId}
          busy={busy}
          assignedCollaboratorIds={assignedIds}
          onAssign={(id) => state.assign(id)}
          onAssignMany={(ids) => state.assignMany(ids)}
          onUnassign={(collaboratorId) => {
            const link = data.partners.content.find(
              (item) => item.collaboratorId === collaboratorId,
            );
            return link ? state.unlink(link) : undefined;
          }}
        />
      )}

      <section aria-label={t("campaign.partners.list")} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold tracking-tight">
            {t("campaign.partners.list")}
          </h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            {data.partners.totalElements}
          </Badge>
        </div>

        {data.partners.content.length === 0 ? (
          <div className="border-border bg-muted/20 rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {t("campaign.partners.empty")}
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label={t("campaign.partners.list")}>
            {data.partners.content.map((partner) => (
              <li
                key={partner.id}
                className="border-border/80 bg-card hover:border-brand-orange/35 space-y-3 rounded-xl border p-4 shadow-2xs transition-all sm:p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-md">
                        <Building2 className="size-4" />
                      </div>
                      <h4 className="text-foreground break-words text-sm font-semibold sm:text-base">
                        {partner.partnerName}
                      </h4>
                      <Badge variant="outline" className="text-2xs font-medium">
                        {t(
                          `campaign.partners.types.${partner.partnerType}`,
                          { defaultValue: partner.partnerType },
                        )}
                      </Badge>
                      {partner.partnerActive === false && (
                        <Badge
                          variant="destructive"
                          className="text-2xs font-medium"
                        >
                          {t("collaborators.inactive")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold tracking-wide",
                        getCooperationStatusBadge(partner.cooperationStatus),
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {t(
                        `campaign.partners.status.${partner.cooperationStatus}`,
                        { defaultValue: partner.cooperationStatus },
                      )}
                    </span>

                    {canModify && (
                      <>
                        <div className="w-full sm:w-44">
                          <GlideSelect
                            ariaLabel={t("campaign.partners.statusFor", {
                              name: partner.partnerName,
                            })}
                            disabled={busy}
                            value={partner.cooperationStatus}
                            onValueChange={(nextStatus) =>
                              void state.update(partner, nextStatus)
                            }
                            options={COOPERATION_STATUSES.map((status) => ({
                              value: status,
                              dotClassName: COOPERATION_DOT[status],
                              label: t(`campaign.partners.status.${status}`, {
                                defaultValue: status,
                              }),
                            }))}
                          />
                        </div>
                        <FuseButton
                          icon={<Trash2 className="size-4" />}
                          disabled={busy}
                          title={t("campaign.partners.removePartner")}
                          ariaLabel={t("campaign.partners.removePartner")}
                          armLabel={t("campaign.partners.confirmRemove", {
                            defaultValue: "Bấm lại để gỡ",
                          })}
                          onConfirm={() => state.unlink(partner)}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Thông tin liên hệ trực tiếp (Người liên hệ, SĐT, Email, Website, Ghi chú) */}
                <PartnerContactCardInfo
                  contactInfo={partner.contactInfo}
                  notes={partner.notes}
                />

                <div className="border-border/40 text-muted-foreground flex items-center gap-1.5 border-t pt-2.5 text-xs">
                  <Clock className="size-3 shrink-0" />
                  <span className="truncate">
                    {t("campaign.partners.updated", {
                      actor:
                        partner.updatedByName ??
                        t("campaign.partners.unknownActor"),
                      date: new Date(partner.updatedAt).toLocaleString(
                        i18n.language,
                      ),
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.partners.totalPages > 1 && (
        <Pagination
          page={state.page + 1}
          size={data.partners.size}
          total={data.partners.totalElements}
          totalPages={data.partners.totalPages}
          isFetching={busy}
          itemLabel={t("campaign.partners.partnerItemLabel", "đối tác")}
          onPageChange={(nextPage) => state.setPage(nextPage - 1)}
          className="pt-2"
        />
      )}
    </div>
  );
}
