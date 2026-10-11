import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCampaignPartners } from "./hooks/useCampaignPartners";
import { PartnerPicker } from "./components/PartnerPicker";
import { COOPERATION_STATUSES, type CooperationStatus } from "./types";

function PartnerPanel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const state = useCampaignPartners(workspaceId);
  const { data, busy, loading, error } = state;
  if (loading) return <Spinner />;
  if (error || !data) return <div role="alert" className="space-y-2">
    <p>{t("campaign.partners.error")}</p><Button onClick={state.reload}>{t("campaign.reload")}</Button>
  </div>;
  if (!data.campaignId) return <p className="text-muted-foreground">{t("campaign.partners.noCampaign")}</p>;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-semibold break-words">{data.campaignName}</h2>
      <Button variant="outline" disabled={busy} onClick={state.reload}>{t("campaign.reload")}</Button>
    </div>
    <p className="text-sm text-muted-foreground">{t("campaign.partners.description")}</p>
    {data.canEdit && <PartnerPicker workspaceId={workspaceId} busy={busy} onAssign={id => void state.assign(id)} />}
    {data.partners.content.length === 0 && <p>{t("campaign.partners.empty")}</p>}
    <ul className="space-y-3" aria-label={t("campaign.partners.list")}>
      {data.partners.content.map(partner => <li key={partner.id} className="space-y-2 rounded-lg border bg-card p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div className="min-w-0"><h3 className="font-medium break-words">{partner.partnerName}</h3>
            <p className="text-sm text-muted-foreground">{t(`campaign.partners.types.${partner.partnerType}`)}</p></div>
          {data.canEdit ? <div className="w-full sm:w-52">
            <Select aria-label={t("campaign.partners.statusFor", { name: partner.partnerName })}
              disabled={busy} value={partner.cooperationStatus}
              onChange={event => void state.update(partner, event.target.value as CooperationStatus)}>
              {COOPERATION_STATUSES.map(status => <option key={status} value={status}>{t(`campaign.partners.status.${status}`)}</option>)}
            </Select>
          </div> : <span className="text-sm font-medium">{t(`campaign.partners.status.${partner.cooperationStatus}`)}</span>}
        </div>
        <p className="text-xs text-muted-foreground">{t("campaign.partners.updated", {
          actor: partner.updatedByName ?? t("campaign.partners.unknownActor"),
          date: new Date(partner.updatedAt).toLocaleString(i18n.language),
        })}</p>
      </li>)}
    </ul>
    {data.partners.totalPages > 1 && <nav aria-label={t("campaign.partners.pagination")} className="flex flex-wrap items-center gap-2">
      <Button variant="outline" disabled={busy || state.page === 0} onClick={() => state.setPage(value => value - 1)}>{t("campaign.partners.previous")}</Button>
      <span className="text-sm">{t("campaign.partners.page", { page: state.page + 1, total: data.partners.totalPages })}</span>
      <Button variant="outline" disabled={busy || state.page + 1 >= data.partners.totalPages} onClick={() => state.setPage(value => value + 1)}>{t("campaign.partners.next")}</Button>
    </nav>}
  </div>;
}

export default function CampaignPartnersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return <PageWrapper title={t("campaign.partners.title")}>
    {id && <PartnerPanel key={id} workspaceId={id} />}
  </PageWrapper>;
}
