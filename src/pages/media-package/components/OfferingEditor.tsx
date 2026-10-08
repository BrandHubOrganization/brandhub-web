import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { OfferingFields, OfferingModel, PackageDeliverable, PackageServiceType } from "@/pages/media-package/types/mediaPackage";

const MODELS: OfferingModel[] = ["CAMPAIGN", "RETAINER", "DELIVERABLE_BUNDLE"];
const SERVICES: PackageServiceType[] = ["SOCIAL_POST", "EVENT_PLANNING", "LIVESTREAM_PREPARATION", "PRESS_RECOMMENDATION", "WORKSHOP_SUPPORT"];

export function OfferingEditor({ value, onChange, allowLegacy = true, clientNegotiation = false }: {
  value: OfferingFields; onChange: (value: OfferingFields) => void; allowLegacy?: boolean;
  clientNegotiation?: boolean;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const items = value.offeringDetails?.deliverables ?? [];
  const replaceItems = (deliverables: PackageDeliverable[]) =>
    onChange({ ...value, offeringDetails: { ...value.offeringDetails, deliverables } });
  const update = (id: string, patch: Partial<PackageDeliverable>) =>
    replaceItems(items.map(item => item.id === id ? { ...item, ...patch } : item));
  const add = () => replaceItems([...items, {
    id: crypto.randomUUID(), serviceType: "SOCIAL_POST", name: "", quantity: 1, unit: "",
  }]);

  return <fieldset className="space-y-3 rounded-xl border border-border p-3">
    <legend className="px-1 text-sm font-medium">{t("mediaPackage.offering.title")}</legend>
    <Label htmlFor={fieldId}>{t("mediaPackage.offering.model")}</Label>
    <Select id={fieldId} value={value.offeringModel ?? ""} disabled={clientNegotiation} onChange={event => {
      const model = event.target.value as OfferingModel;
      onChange(model ? { offeringModel: model, offeringDetails: {
        ...value.offeringDetails, maxChanges: value.offeringDetails?.maxChanges ?? 2, deliverables: items,
      } } : {});
    }}>
      {allowLegacy && <option value="">{t("mediaPackage.offering.legacy")}</option>}
      {MODELS.map(model => <option key={model} value={model}>{t(`mediaPackage.offering.models.${model}`)}</option>)}
    </Select>
    {value.offeringModel && <>
      <p className="text-xs text-muted-foreground">{t(`mediaPackage.offering.hints.${value.offeringModel}`)}</p>
      <Input type="number" min={0} step={1} disabled={clientNegotiation}
        label={t("mediaPackage.offering.revisions")}
        value={value.offeringDetails?.maxChanges ?? ""}
        onChange={event => onChange({ ...value, offeringDetails: {
          ...value.offeringDetails!,
          maxChanges: event.target.value === "" ? null : Number(event.target.value),
        } })} />
      {items.map((item, index) => <div key={item.id} className="space-y-2 border-t border-border pt-3">
        <Label htmlFor={`${fieldId}-${index}`}>{t("mediaPackage.offering.service")}</Label>
        <Select id={`${fieldId}-${index}`} value={item.serviceType} disabled={clientNegotiation}
          onChange={event => update(item.id, { serviceType: event.target.value as PackageServiceType })}>
          {SERVICES.map(service => <option key={service} value={service}>{t(`mediaPackage.offering.services.${service}`)}</option>)}
        </Select>
        <Input required maxLength={255} label={t("mediaPackage.offering.name")} value={item.name}
          onChange={event => update(item.id, { name: event.target.value })} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input required type="number" min={1} step={1} label={t("mediaPackage.offering.quantity")}
            value={item.quantity} onChange={event => update(item.id, { quantity: Number(event.target.value) })} />
          <Input required maxLength={80} label={t("mediaPackage.offering.unit")} value={item.unit} disabled={clientNegotiation}
            onChange={event => update(item.id, { unit: event.target.value })} />
        </div>
        <Input maxLength={2000} label={t("mediaPackage.offering.description")} value={item.description ?? ""}
          onChange={event => update(item.id, { description: event.target.value })} />
        <Input maxLength={2000} label={t("mediaPackage.offering.acceptance")} value={item.acceptanceCriteria ?? ""}
          onChange={event => update(item.id, { acceptanceCriteria: event.target.value })} />
        {!clientNegotiation && <Button type="button" variant="outline" onClick={() => replaceItems(items.filter(row => row.id !== item.id))}>
          {t("mediaPackage.offering.remove")}
        </Button>}
      </div>)}
      {!clientNegotiation && <Button type="button" variant="outline" disabled={items.length >= 100} onClick={add}>
        {t("mediaPackage.offering.add")}
      </Button>}
      {!items.length && <p className="text-destructive text-xs">{t("mediaPackage.offering.required")}</p>}
    </>}
  </fieldset>;
}
