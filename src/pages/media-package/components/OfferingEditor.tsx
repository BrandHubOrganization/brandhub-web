import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuggestedPackageText } from "@/pages/media-package/components/SuggestedPackageText";
import { SERVICE_UNITS } from "@/pages/media-package/types/serviceUnits";
import type {
  OfferingFields,
  PackageDeliverable,
  PackageServiceType,
} from "@/pages/media-package/types/mediaPackage";

const SERVICES: PackageServiceType[] = [
  "SOCIAL_POST",
  "PRESS_RECOMMENDATION",
  "EVENT_PLANNING",
  "WORKSHOP_SUPPORT",
  "SHORT_VIDEO",
  "KOL_BOOKING",
  "EMAIL_NEWSLETTER",
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
  const [showErrors, setShowErrors] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const drafts = useRef(new Map<PackageServiceType, PackageDeliverable>());
  const invalidFrame = useRef<number | null>(null);
  const items = value.offeringDetails?.deliverables ?? [];
  const current = items.find((item) => item.id === selected) ?? items[0];
  const extras = items.filter(
    (item, index) =>
      !SERVICES.includes(item.serviceType) ||
      items.findIndex((row) => row.serviceType === item.serviceType) !== index,
  );
  const replace = (deliverables: PackageDeliverable[]) =>
    onChange({
      ...value,
      offeringDetails: { ...value.offeringDetails, deliverables },
    });
  const update = (id: string, patch: Partial<PackageDeliverable>) =>
    replace(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  function toggle(service: PackageServiceType) {
    const item = items.find((row) => row.serviceType === service);
    if (item) {
      drafts.current.set(service, item);
      replace(items.filter((row) => row.id !== item.id));
    } else {
      const next = drafts.current.get(service) ?? {
        id: crypto.randomUUID(),
        serviceType: service,
        name: t(`mediaPackage.offering.services.${service}`),
        quantity: 1,
        unit: SERVICE_UNITS[service],
      };
      replace([...items, next]);
      setSelected(next.id);
    }
  }
  return (
    <section
      className="grid min-w-0 items-start gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]"
      id="package-field-offering"
      tabIndex={-1}
      aria-label={t("mediaPackage.offering.title")}
    >
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-4">
          <h3 className="text-sm font-semibold">
            {t("mediaPackage.offering.title")}
          </h3>
          <span className="bg-muted text-muted-foreground shrink-0 rounded px-2 py-1 text-xs">
            {t("mediaPackage.editor.selected", {
              count: SERVICES.filter((s) =>
                items.some((item) => item.serviceType === s),
              ).length,
              total: SERVICES.length,
            })}
          </span>
        </div>
        <div className="space-y-1 p-2">
          {SERVICES.map((service) => {
            const item = items.find((row) => row.serviceType === service);
            const active = Boolean(item && current?.id === item.id);
            return (
              <div
                key={service}
                className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 transition-colors duration-150 motion-reduce:transition-none ${active ? "border-brand-orange bg-brand-orange-soft" : "hover:bg-muted border-transparent"}`}
              >
                <input
                  type="checkbox"
                  className="accent-brand-orange size-4 shrink-0"
                  checked={Boolean(item)}
                  disabled={clientNegotiation}
                  aria-label={t("mediaPackage.editor.include", {
                    service: t(`mediaPackage.offering.services.${service}`),
                  })}
                  onChange={() => toggle(service)}
                />
                <button
                  type="button"
                  className="min-h-16 min-w-0 flex-1 cursor-pointer py-3 text-left disabled:cursor-default disabled:opacity-60"
                  disabled={!item}
                  aria-pressed={active}
                  onClick={() => item && setSelected(item.id)}
                >
                  <span className="block text-sm font-medium">
                    {t(`mediaPackage.offering.services.${service}`)}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {item
                      ? `${item.quantity || "—"} ${t(`mediaPackage.proposal.units.${service}`, { count: item.quantity })}`
                      : t("mediaPackage.editor.notSelected")}
                  </span>
                </button>
              </div>
            );
          })}
          {extras.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="secondary"
              className="min-h-11 w-full justify-start whitespace-normal"
              onClick={() => setSelected(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground px-4 pb-4 text-xs leading-5">
          {t("mediaPackage.editor.chooseServices")}
        </p>
      </div>
      <div className="border-border bg-card min-w-0 overflow-hidden rounded-xl border">
        {!items.length && (
          <p className="text-muted-foreground p-8 text-sm">
            {t("mediaPackage.offering.required")}
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            hidden={current?.id !== item.id}
            onInvalidCapture={(event) => {
              event.preventDefault();
              setShowErrors(true);
              if (invalidFrame.current !== null) return;
              const target = event.target as HTMLElement;
              setSelected(item.id);
              invalidFrame.current = requestAnimationFrame(() => {
                target.focus();
                invalidFrame.current = null;
              });
            }}
          >
            <header className="border-border bg-brand-orange-soft border-b px-4 py-4 sm:px-5">
              <h3 className="text-sm font-semibold">
                {t(`mediaPackage.offering.services.${item.serviceType}`)}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("mediaPackage.editor.editingItem")}
              </p>
            </header>
            <div className="space-y-4 p-4 sm:p-5">
              {extras.includes(item) && (
                <p role="note" className="text-muted-foreground text-xs">
                  {t("mediaPackage.editor.legacy")}
                </p>
              )}
              <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <div className="space-y-2">
                  <Input
                    error={
                      showErrors && !item.name.trim()
                        ? t("mediaPackage.form.errors.name")
                        : undefined
                    }
                    required
                    pattern=".*\S.*"
                    maxLength={255}
                    label={t("mediaPackage.offering.name")}
                    value={item.name}
                    onChange={(e) => update(item.id, { name: e.target.value })}
                  />
                  {SERVICES.includes(item.serviceType) && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-muted-foreground py-1 text-xs">
                        {t("mediaPackage.editor.nameSuggestions")}
                      </span>
                      {[0, 1].map((index) => (
                        <Button
                          type="button"
                          key={index}
                          size="sm"
                          variant="secondary"
                          className="min-h-8 text-xs"
                          onClick={() =>
                            update(item.id, {
                              name: t(
                                `mediaPackage.editor.suggestions.${item.serviceType}.names.${index}`,
                              ),
                            })
                          }
                        >
                          {t(
                            `mediaPackage.editor.suggestions.${item.serviceType}.names.${index}`,
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  error={
                    showErrors &&
                    (!Number.isInteger(item.quantity) || item.quantity < 1)
                      ? t("mediaPackage.editor.quantityError")
                      : undefined
                  }
                  required
                  type="number"
                  min={1}
                  step={1}
                  label={t("mediaPackage.offering.quantity")}
                  value={item.quantity || ""}
                  iconSuffix={
                    <span className="text-xs">
                      {t(`mediaPackage.proposal.units.${item.serviceType}`, {
                        count: item.quantity,
                      })}
                    </span>
                  }
                  onChange={(e) =>
                    update(item.id, { quantity: Number(e.target.value) })
                  }
                  onBlur={(e) => {
                    e.target.value = item.quantity ? String(item.quantity) : "";
                  }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {t("mediaPackage.editor.suggestionHint")}
              </p>
              <div className="grid gap-4 xl:grid-cols-2">
                <SuggestedPackageText
                  label={t("mediaPackage.proposal.description")}
                  value={item.description ?? ""}
                  onChange={(description) => update(item.id, { description })}
                  options={
                    SERVICES.includes(item.serviceType)
                      ? [0, 1, 2].map((index) => ({
                          id: String(index),
                          text: t(
                            `mediaPackage.editor.suggestions.${item.serviceType}.descriptions.${index}`,
                          ),
                        }))
                      : []
                  }
                />
                <SuggestedPackageText
                  label={t("mediaPackage.proposal.outcomes")}
                  value={item.acceptanceCriteria ?? ""}
                  onChange={(acceptanceCriteria) =>
                    update(item.id, { acceptanceCriteria })
                  }
                  options={
                    SERVICES.includes(item.serviceType)
                      ? [0, 1, 2].map((index) => ({
                          id: String(index),
                          text: t(
                            `mediaPackage.editor.suggestions.${item.serviceType}.outcomes.${index}`,
                          ),
                        }))
                      : []
                  }
                />
              </div>
            </div>
            <p className="border-border bg-muted/40 text-muted-foreground border-t px-4 py-3 text-xs sm:px-5">
              {t("mediaPackage.editor.draftHint")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
