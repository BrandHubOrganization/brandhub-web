import { useId } from "react";
import { useTranslation } from "react-i18next";
import { QuickNumbers, TextChoices } from "@/components/shared/FieldChoices";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const add = (serviceType: PackageServiceType) =>
    replaceItems([
      ...items,
      {
        id: crypto.randomUUID(),
        serviceType,
        name: t(`mediaPackage.offering.services.${serviceType}`),
        quantity: 1,
        unit: SERVICE_UNITS[serviceType],
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
          {[
            ...new Set([...SERVICES, ...items.map((item) => item.serviceType)]),
          ].map((service, index) => {
            const item = items.find((entry) => entry.serviceType === service);
            if (!item && clientNegotiation) return null;
            return (
              <div
                key={service}
                className="border-border bg-muted/20 space-y-3 rounded-lg border p-4"
              >
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(item)}
                    disabled={clientNegotiation}
                    onChange={() =>
                      item
                        ? replaceItems(
                            items.filter((row) => row.serviceType !== service),
                          )
                        : add(service)
                    }
                  />
                  {t(`mediaPackage.offering.services.${service}`)}
                </Label>
                {item && (
                  <>
                    <Input
                      required
                      maxLength={255}
                      label={t("mediaPackage.offering.name")}
                      value={item.name}
                      onChange={(event) =>
                        update(item.id, { name: event.target.value })
                      }
                    />
                    <div className="space-y-2">
                      <Input
                        required
                        type="number"
                        min={1}
                        step={1}
                        label={t("mediaPackage.choices.quantityUnit", {
                          unit: item.unit,
                        })}
                        value={item.quantity || ""}
                        onChange={(event) =>
                          update(item.id, {
                            quantity: Number(event.target.value),
                          })
                        }
                      />
                      <QuickNumbers
                        values={[1, 2, 3, 5, 10, 20]}
                        value={String(item.quantity)}
                        onChange={(quantity) =>
                          update(item.id, { quantity: Number(quantity) })
                        }
                      />
                    </div>
                    <TextChoices
                      id={`${fieldId}-${index}-description`}
                      label={t("mediaPackage.offering.description")}
                      value={item.description ?? ""}
                      maxLength={2000}
                      onChange={(description) =>
                        update(item.id, { description })
                      }
                      options={[
                        t("mediaPackage.offering.descriptionTemplate", {
                          service: item.name,
                          count: item.quantity,
                        }),
                        t("mediaPackage.choices.descriptionAlt", {
                          service: item.name,
                        }),
                      ]}
                    />
                    <TextChoices
                      id={`${fieldId}-${index}-acceptance`}
                      label={t("mediaPackage.offering.acceptance")}
                      value={item.acceptanceCriteria ?? ""}
                      maxLength={2000}
                      onChange={(acceptanceCriteria) =>
                        update(item.id, { acceptanceCriteria })
                      }
                      options={[
                        t("mediaPackage.offering.acceptanceTemplate", {
                          count: item.quantity,
                        }),
                        t("mediaPackage.choices.acceptanceAlt"),
                      ]}
                    />
                  </>
                )}
              </div>
            );
          })}
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
