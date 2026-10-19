import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HelpHint } from "@/components/shared/HelpHint";
import { SERVICE_UNITS } from "@/pages/media-package/types/serviceUnits";
import type {
  OfferingFields,
  PackageDeliverable,
  PackageServiceType,
} from "@/pages/media-package/types/mediaPackage";

const SERVICES: PackageServiceType[] = [
  "SOCIAL_POST",
  "EVENT_PLANNING",
  "LIVESTREAM_PREPARATION",
  "PRESS_RECOMMENDATION",
  "WORKSHOP_SUPPORT",
];

export function OfferingEditor({
  value,
  onChange,
  clientNegotiation = false,
}: {
  value: OfferingFields;
  onChange: (value: OfferingFields) => void;
  clientNegotiation?: boolean;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const items = value.offeringDetails?.deliverables ?? [];
  const replaceItems = (deliverables: PackageDeliverable[]) =>
    onChange({
      ...value,
      offeringDetails: { ...value.offeringDetails, deliverables },
    });
  const update = (id: string, patch: Partial<PackageDeliverable>) =>
    replaceItems(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  const add = () =>
    replaceItems([
      ...items,
      {
        id: crypto.randomUUID(),
        serviceType: "SOCIAL_POST",
        name: "",
        quantity: 1,
        unit: SERVICE_UNITS.SOCIAL_POST,
      },
    ]);

  return (
    <fieldset className="border-border min-w-0 space-y-4 rounded-xl border p-4 sm:p-5">
      <legend className="px-1 text-sm font-medium">
        <span className="inline-flex items-center gap-1">
          {t("mediaPackage.offering.title")}
          <HelpHint label={t("mediaPackage.offering.title")}>
            {t("mediaPackage.ui.totalQuantity")}
          </HelpHint>
        </span>
      </legend>
      {
        <>
          <Input
            type="number"
            min={0}
            step={1}
            disabled={clientNegotiation}
            label={t("mediaPackage.offering.revisions")}
            value={value.offeringDetails?.maxChanges ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                offeringDetails: {
                  ...value.offeringDetails,
                  deliverables: items,
                  maxChanges:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                },
              })
            }
          />
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border-border bg-muted/20 space-y-3 rounded-lg border p-4"
            >
              <Label htmlFor={`${fieldId}-${index}`}>
                {t("mediaPackage.offering.service")}
              </Label>
              <Select
                id={`${fieldId}-${index}`}
                value={item.serviceType}
                disabled={clientNegotiation}
                onChange={(event) =>
                  update(item.id, {
                    serviceType: event.target.value as PackageServiceType,
                    unit: SERVICE_UNITS[
                      event.target.value as PackageServiceType
                    ],
                  })
                }
              >
                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {t(`mediaPackage.offering.services.${service}`)}
                  </option>
                ))}
              </Select>
              <Input
                required
                maxLength={255}
                label={t("mediaPackage.offering.name")}
                value={item.name}
                onChange={(event) =>
                  update(item.id, { name: event.target.value })
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  required
                  type="number"
                  min={1}
                  step={1}
                  label={t("mediaPackage.offering.quantity")}
                  value={item.quantity}
                  onChange={(event) =>
                    update(item.id, { quantity: Number(event.target.value) })
                  }
                />
                <Input
                  required
                  maxLength={80}
                  label={t("mediaPackage.offering.unit")}
                  value={item.unit}
                  readOnly
                />
              </div>
              <Label htmlFor={`${fieldId}-${index}-description`}>
                {t("mediaPackage.offering.description")}
              </Label>
              <Textarea
                id={`${fieldId}-${index}-description`}
                rows={3}
                maxLength={2000}
                value={item.description ?? ""}
                onChange={(event) =>
                  update(item.id, { description: event.target.value })
                }
              />
              <Label htmlFor={`${fieldId}-${index}-acceptance`}>
                {t("mediaPackage.offering.acceptance")}
              </Label>
              <Textarea
                id={`${fieldId}-${index}-acceptance`}
                rows={3}
                maxLength={2000}
                value={item.acceptanceCriteria ?? ""}
                onChange={(event) =>
                  update(item.id, { acceptanceCriteria: event.target.value })
                }
              />
              {!clientNegotiation && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    replaceItems(items.filter((row) => row.id !== item.id))
                  }
                >
                  {t("mediaPackage.offering.remove")}
                </Button>
              )}
            </div>
          ))}
          {!clientNegotiation && (
            <Button
              type="button"
              variant="outline"
              disabled={items.length >= 100}
              onClick={add}
            >
              {t("mediaPackage.offering.add")}
            </Button>
          )}
          {!items.length && (
            <p className="text-destructive text-xs">
              {t("mediaPackage.offering.required")}
            </p>
          )}
        </>
      }
    </fieldset>
  );
}
