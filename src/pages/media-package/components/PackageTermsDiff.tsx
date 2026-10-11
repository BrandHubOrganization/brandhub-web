import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
type Terms = Record<string, unknown>;
type FlatValues = Map<string, unknown>;

function flatten(value: unknown, output: FlatValues, path = ""): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const id =
        item && typeof item === "object" && "id" in item
          ? String(item.id)
          : String(index);
      flatten(item, output, `${path}.${id}`);
    });
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (
        key === "sourcePackageId" ||
        key === "id" ||
        key === "revisionLimit" ||
        key === "deliverableId"
      )
        return;
      flatten(child, output, path ? `${path}.${key}` : key);
    });
  } else if (path) {
    output.set(path, value);
  }
}

function deliverableNames(terms: Terms): Map<string, string> {
  const details = terms.offeringDetails as
    { deliverables?: { id: string; name?: string }[] } | undefined;
  return new Map(
    (details?.deliverables ?? []).map((item, index) => [
      String(item.id ?? index),
      item.name || `#${index + 1}`,
    ]),
  );
}

function displayValue(value: unknown, path: string, language: string): string {
  if (value === undefined || value === null || value === "") return "—";
  if (path === "budgetAmount" && typeof value === "number") {
    return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function PackageTermsDiff({
  before,
  after,
  title,
  beforeLabel,
  afterLabel,
}: {
  before: Terms;
  after: Terms;
  title?: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const { t, i18n } = useTranslation();
  const [showUnchanged, setShowUnchanged] = useState(false);
  const oldValues: FlatValues = new Map(),
    newValues: FlatValues = new Map();
  const fields = new Set([
    "name",
    "type",
    "budgetAmount",
    "durationWeeks",
    "scopeDescription",
    "offeringModel",
    "offeringDetails",
    "strategyDetail",
    "brandGuideline",
    "startDate",
    "endDate",
    "milestones",
    "workItems",
  ]);
  const pick = (terms: Terms) =>
    Object.fromEntries(
      Object.entries(terms).filter(([key]) => fields.has(key)),
    );
  flatten(pick(before), oldValues);
  flatten(pick(after), newValues);
  const names = new Map([
    ...deliverableNames(before),
    ...deliverableNames(after),
  ]);
  const paths = [...new Set([...oldValues.keys(), ...newValues.keys()])];
  const changed = new Set(
    paths.filter(
      (path) =>
        JSON.stringify(oldValues.get(path)) !==
        JSON.stringify(newValues.get(path)),
    ),
  );
  const labelFor = (path: string) => {
    const parts = path.split(".");
    const field = parts.at(-1) ?? path;
    const label = t(`mediaPackage.ui.fields.${field}`, { defaultValue: field });
    if (
      parts[0] === "offeringDetails" &&
      parts[1] === "deliverables" &&
      parts[2]
    )
      return `${names.get(parts[2]) ?? parts[2]} · ${label}`;
    if (parts.includes("workItems") || parts.includes("milestones")) {
      const collection = parts[0];
      const itemKey = parts[1];
      const items = [
        ...(Array.isArray(after[collection]) ? after[collection] : []),
        ...(Array.isArray(before[collection]) ? before[collection] : []),
      ] as { id?: string; name?: string }[];
      const item = items.find(
        (item, index) => String(item.id ?? index) === itemKey,
      );
      return `${item?.name || t(`mediaPackage.ui.fields.${collection}`)} · ${label}`;
    }
    return label;
  };
  const valueFor = (value: unknown, path: string) => {
    const field = path.split(".").at(-1);
    if (typeof value === "string" && field === "serviceType")
      return t(`mediaPackage.offering.services.${value}`, {
        defaultValue: value,
      });
    if (typeof value === "string" && field === "offeringModel")
      return t(`mediaPackage.offering.models.${value}`, {
        defaultValue: value,
      });
    if (typeof value === "string" && field === "type")
      return t(`campaign.types.${value}`, {
        defaultValue: t(`mediaPackage.types.${value}`, { defaultValue: value }),
      });
    return displayValue(value, path, i18n.language);
  };
  const visiblePaths = showUnchanged
    ? paths
    : paths.filter((path) => changed.has(path));
  return (
    <section className="border-border overflow-hidden rounded-xl border text-sm">
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <h4 className="font-semibold">
          {title || t("mediaPackage.ui.compare")}
        </h4>
        <Badge variant="outline">
          {t("mediaPackage.ui.changeCount", { count: changed.size })}
        </Badge>
      </div>
      {paths.length > changed.size && (
        <label className="border-border text-muted-foreground flex cursor-pointer items-center gap-2 border-b px-4 py-3 text-xs">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(event) => setShowUnchanged(event.target.checked)}
            className="accent-brand-orange size-4"
          />
          {t("mediaPackage.ui.showUnchanged")}
        </label>
      )}
      {!visiblePaths.length && (
        <p className="text-muted-foreground p-4">
          {t(
            paths.length
              ? "mediaPackage.ui.noDifferences"
              : "mediaPackage.ui.noChanges",
          )}
        </p>
      )}
      {visiblePaths.map((path) => (
        <div key={path} className="border-border border-b last:border-b-0">
          <div className="bg-muted/20 flex flex-wrap items-center gap-2 px-4 py-2 text-xs">
            <span className="font-medium break-words">{labelFor(path)}</span>
            {changed.has(path) && (
              <Badge variant="secondary">{t("mediaPackage.ui.changed")}</Badge>
            )}
          </div>
          <div className="grid sm:grid-cols-2">
            <div
              className={`border-border min-w-0 border-b p-4 sm:border-r sm:border-b-0 ${changed.has(path) ? "bg-destructive/5" : ""}`}
            >
              <p className="text-muted-foreground mb-2 text-xs">
                {beforeLabel || t("mediaPackage.ui.before")}
              </p>
              <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">
                {valueFor(oldValues.get(path), path)}
              </p>
            </div>
            <div
              className={`min-w-0 p-4 ${changed.has(path) ? "bg-success/5" : ""}`}
            >
              <p className="text-muted-foreground mb-2 text-xs">
                {afterLabel || t("mediaPackage.ui.after")}
              </p>
              <p
                className={`[overflow-wrap:anywhere] whitespace-pre-wrap ${changed.has(path) ? "font-medium" : ""}`}
              >
                {valueFor(newValues.get(path), path)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
