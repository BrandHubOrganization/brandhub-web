import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { campaignDraftService } from "@/pages/media-package/services/campaignDraftService";
import type { CampaignDraft } from "@/pages/media-package/services/campaignDraftService";
import type { MediaPackage, WorkspaceMediaPackage } from "@/pages/media-package/types/mediaPackage";
import { extractErrorMessage } from "@/utils/error";

export function CampaignDraftPanel({ selection, mediaPackage, canCreate }: {
  selection: WorkspaceMediaPackage; mediaPackage: MediaPackage; canCreate: boolean;
}) {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<CampaignDraft[]>([]);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const monthly = mediaPackage.offeringModel === "RETAINER";
  const items = mediaPackage.offeringDetails?.deliverables ?? [];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await campaignDraftService.list(selection.workspaceId);
        if (active) setCampaigns(response.data.data);
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [selection.workspaceId, reload]);

  const remaining = (id: string, total: number) => total - campaigns
    .filter(campaign => !monthly || campaign.allocationPeriod === period)
    .flatMap(campaign => campaign.allocations ?? [])
    .filter(allocation => allocation.deliverableId === id)
    .reduce((sum, allocation) => sum + allocation.quantity, 0);
  const quantity = (id: string, available: number) => quantities[id]
    ?? (mediaPackage.offeringModel === "CAMPAIGN" ? Math.max(available, 0) : 0);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const allocations = items.map(item => ({ deliverableId: item.id,
      quantity: quantity(item.id, remaining(item.id, item.quantity)) })).filter(item => item.quantity > 0);
    if (!allocations.length) { toast.error(t("mediaPackage.offering.allocationRequired")); return; }
    setSaving(true);
    try {
      const result = await campaignDraftService.create({
        workspaceMediaPackageId: selection.workspaceMediaPackageId, name: name.trim(),
        period: monthly ? period : undefined, allocations,
      });
      setCampaigns(current => [...current, result.data.data]);
      setName(""); setQuantities({});
      toast.success(t("mediaPackage.offering.draftCreated"));
    } catch (failure) { toast.error(extractErrorMessage(failure, t("mediaPackage.offering.loadError"))); }
    finally { setSaving(false); }
  }

  return <section className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4">
    <h3 className="font-semibold">{t("mediaPackage.offering.draftTitle")}</h3>
    {loading && <Spinner />}
    {error && <div role="alert">{t("mediaPackage.offering.loadError")}
      <Button variant="outline" onClick={() => {
        setLoading(true); setError(false); setReload(value => value + 1);
      }}>{t("mediaPackage.offering.retry")}</Button>
    </div>}
    {!loading && !error && <>
      {!campaigns.length && <p className="text-sm text-muted-foreground">{t("mediaPackage.offering.empty")}</p>}
      <ul className="space-y-1 text-sm">{campaigns.map(campaign => <li key={campaign.id}>
        {campaign.name} · {campaign.status} {campaign.allocationPeriod ?? ""}
      </li>)}</ul>
    </>}
    {canCreate && <form className="space-y-3" onSubmit={submit}>
      <p className="text-xs text-muted-foreground">{t("mediaPackage.offering.draftNotice")}</p>
      <Input required maxLength={255} label={t("mediaPackage.offering.campaignName")}
        value={name} onChange={event => setName(event.target.value)} />
      {monthly && <Input required type="month" label={t("mediaPackage.offering.period")}
        value={period} onChange={event => { setPeriod(event.target.value); setQuantities({}); }} />}
      {items.map(item => {
        const available = Math.max(remaining(item.id, item.quantity), 0);
        return <div key={item.id}>
          <Input type="number" min={0} max={available} step={1} required label={`${item.name} (${item.unit})`}
            value={quantity(item.id, available)} onChange={event => setQuantities(current => ({
              ...current, [item.id]: Number(event.target.value),
            }))} />
          <p className="text-xs text-muted-foreground">{t("mediaPackage.offering.remaining", { count: available })}</p>
        </div>;
      })}
      <Button type="submit" loading={saving} disabled={loading || error || saving}>
        {t("mediaPackage.offering.createDraft")}
      </Button>
    </form>}
  </section>;
}
