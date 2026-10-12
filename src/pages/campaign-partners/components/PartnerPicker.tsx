import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { campaignPartnerService } from "../services/campaignPartnerService";
import type { CollaboratorOption, PartnerPage } from "../types";

interface Props {
  workspaceId: string;
  busy: boolean;
  onAssign: (id: string) => void;
}
export function PartnerPicker({ workspaceId, busy, onAssign }: Props) {
  const { t } = useTranslation();
  const [result, setResult] = useState<{ key: string; data: PartnerPage<CollaboratorOption> | null; error: boolean }>();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState("");
  const key = `${workspaceId}:${page}:${revision}`;
  const loading = result?.key !== key;
  const data = loading ? null : result?.data ?? null;
  const error = !loading && !!result?.error;
  useEffect(() => {
    let active = true;
    campaignPartnerService.options(workspaceId, page).then(result => {
      if (active) setResult({ key, data: result.data.data, error: false });
    }).catch(() => { if (active) setResult({ key, data: null, error: true }); });
    return () => { active = false; };
  }, [workspaceId, page, key]);
  if (loading) return <Spinner />;
  if (error) return <div role="alert" className="space-y-2">
    <p>{t("campaign.partners.error")}</p>
    <Button variant="outline" onClick={() => setRevision(value => value + 1)}>{t("campaign.reload")}</Button>
  </div>;
  return <section aria-label={t("campaign.partners.add")} className="space-y-3 rounded-lg border bg-card p-4">
    <h2 className="font-semibold">{t("campaign.partners.add")}</h2>
    {data?.totalElements === 0 ? <p className="text-sm text-muted-foreground">{t("campaign.partners.noDirectory")}</p>
      : <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1"><label htmlFor="campaign-partner-choice" className="sr-only">{t("campaign.partners.choose")}</label>
          <Select id="campaign-partner-choice" disabled={busy} value={selected} onChange={event => setSelected(event.target.value)}>
            <option value="">{t("campaign.partners.choose")}</option>
            {data?.content.map(partner => <option key={partner.id} value={partner.id}>
              {partner.partnerName} · {t(`campaign.partners.types.${partner.partnerType}`)}
            </option>)}
          </Select>
        </div>
        <Button disabled={busy || !selected} onClick={() => onAssign(selected)}>{t("campaign.partners.assign")}</Button>
      </div>}
    {data && data.totalPages > 1 && <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" disabled={busy || page === 0} onClick={() => { setSelected(""); setPage(value => value - 1); }}>{t("campaign.partners.previous")}</Button>
      <span className="text-sm">{t("campaign.partners.directoryPage", { page: page + 1, total: data.totalPages })}</span>
      <Button variant="outline" disabled={busy || page + 1 >= data.totalPages} onClick={() => { setSelected(""); setPage(value => value + 1); }}>{t("campaign.partners.next")}</Button>
    </div>}
  </section>;
}
