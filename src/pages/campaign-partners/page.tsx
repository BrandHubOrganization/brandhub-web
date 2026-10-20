import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Building2,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCampaignPartners } from "./hooks/useCampaignPartners";
import { PartnerPicker } from "./components/PartnerPicker";
import { COOPERATION_STATUSES, type CooperationStatus } from "./types";

function getCooperationStatusBadge(status: string) {
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

function PartnerPanel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const state = useCampaignPartners(workspaceId);
  const { data, busy, loading, error } = state;

  if (loading) {
    return (
      <div role="status" className="flex justify-center p-12">
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
        <p className="text-sm font-medium text-destructive">
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
        <Users className="mx-auto size-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          {t("campaign.partners.noCampaign")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="border-border bg-card rounded-xl border p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground break-words">
              {data.campaignName}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
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

      {/* Assign Partner Form */}
      {data.canEdit && (
        <PartnerPicker
          workspaceId={workspaceId}
          busy={busy}
          onAssign={(id) => void state.assign(id)}
        />
      )}

      {/* Partner List */}
      <section aria-label={t("campaign.partners.list")} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {t("campaign.partners.list")}
          </h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            {data.partners.totalElements}
          </Badge>
        </div>

        {data.partners.content.length === 0 ? (
          <div className="border-border bg-muted/20 rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("campaign.partners.empty")}
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label={t("campaign.partners.list")}>
            {data.partners.content.map((partner) => (
              <li
                key={partner.id}
                className="border-border/80 bg-card rounded-xl border p-4 sm:p-5 shadow-2xs transition-all hover:border-brand-orange/30 hover:shadow-xs space-y-3"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-md">
                        <Building2 className="size-3.5" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground break-words">
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

                  {/* Status Badges & Quick Switcher */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide shrink-0",
                        getCooperationStatusBadge(partner.cooperationStatus),
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {t(
                        `campaign.partners.status.${partner.cooperationStatus}`,
                        { defaultValue: partner.cooperationStatus },
                      )}
                    </span>

                    {data.canEdit && (
                      <div className="w-full sm:w-44">
                        <Select
                          aria-label={t("campaign.partners.statusFor", {
                            name: partner.partnerName,
                          })}
                          disabled={busy}
                          value={partner.cooperationStatus}
                          onChange={(event) =>
                            void state.update(
                              partner,
                              event.target.value as CooperationStatus,
                            )
                          }
                        >
                          {COOPERATION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {t(`campaign.partners.status.${status}`, {
                                defaultValue: status,
                              })}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

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

      {/* Pagination */}
      {data.partners.totalPages > 1 && (
        <nav
          aria-label={t("campaign.partners.pagination")}
          className="flex flex-wrap items-center justify-between gap-3 pt-2"
        >
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("campaign.partners.page", {
              page: state.page + 1,
              total: data.partners.totalPages,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || state.page === 0}
              onClick={() => state.setPage((value) => value - 1)}
              className="gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>{t("campaign.partners.previous")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || state.page + 1 >= data.partners.totalPages}
              onClick={() => state.setPage((value) => value + 1)}
              className="gap-1"
            >
              <span>{t("campaign.partners.next")}</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function CampaignPartnersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <PageWrapper title={t("campaign.partners.title")}>
      {id && <PartnerPanel key={id} workspaceId={id} />}
    </PageWrapper>
  );
}
