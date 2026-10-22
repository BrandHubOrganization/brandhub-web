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
  const [mobileTab, setMobileTab] = useState<"after" | "before" | "both">("after");
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
    <section className="border-border/80 overflow-hidden rounded-xl border text-sm">
      <div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <h4 className="text-foreground font-semibold">
          {title || t("mediaPackage.ui.compare")}
        </h4>
        <div className="flex items-center gap-2">
          {paths.length > changed.size && (
            <label className="text-muted-foreground flex cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={showUnchanged}
                onChange={(event) => setShowUnchanged(event.target.checked)}
                className="accent-brand-orange size-3.5"
              />
              <span>{t("mediaPackage.ui.showUnchanged")}</span>
            </label>
          )}
          <Badge variant="outline" className="text-xs">
            {t("mediaPackage.ui.changeCount", { count: changed.size })}
          </Badge>
        </div>
      </div>

      {/* Mobile view switcher */}
      <div className="border-border/60 bg-muted/15 flex items-center justify-between gap-2 border-b px-4 py-2 sm:hidden">
        <span className="text-muted-foreground text-xs font-medium">
          {t("mediaPackage.ui.viewMode", { defaultValue: "Chế độ xem:" })}
        </span>
        <div className="border-border bg-background/80 flex items-center rounded-lg border p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMobileTab("after")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              mobileTab === "after"
                ? "bg-brand-orange text-white font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {afterLabel || t("mediaPackage.ui.after")}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("before")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              mobileTab === "before"
                ? "bg-muted text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {beforeLabel || t("mediaPackage.ui.before")}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("both")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              mobileTab === "both"
                ? "bg-muted text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("mediaPackage.ui.all", { defaultValue: "Cả hai" })}
          </button>
        </div>
      </div>

      {!visiblePaths.length && (
        <p className="text-muted-foreground p-4 text-xs">
          {t(
            paths.length
              ? "mediaPackage.ui.noDifferences"
              : "mediaPackage.ui.noChanges",
          )}
        </p>
      )}

      {visiblePaths.map((path) => (
        <div key={path} className="border-border/60 border-b last:border-b-0">
          <div className="bg-muted/15 flex flex-wrap items-center gap-2 px-4 py-2 text-xs">
            <span className="font-medium text-foreground break-words">
              {labelFor(path)}
            </span>
            {changed.has(path) && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium"
              >
                {t("mediaPackage.ui.changed")}
              </Badge>
            )}
          </div>

          {/* Desktop view: side-by-side grid */}
          <div className="hidden sm:grid sm:grid-cols-2">
            <div
              className={`border-border/60 min-w-0 border-r p-4 transition-colors ${
                changed.has(path)
                  ? "bg-rose-500/5 dark:bg-rose-500/10"
                  : "bg-card"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  {beforeLabel || t("mediaPackage.ui.before")}
                </p>
                {changed.has(path) && (
                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {t("mediaPackage.ui.previousValue", {
                      defaultValue: "Bản trước",
                    })}
                  </span>
                )}
              </div>
              <p
                className={`[overflow-wrap:anywhere] whitespace-pre-wrap text-sm leading-relaxed ${
                  changed.has(path)
                    ? "text-rose-950/80 dark:text-rose-200/80 line-through"
                    : "text-foreground"
                }`}
              >
                {valueFor(oldValues.get(path), path)}
              </p>
            </div>
            <div
              className={`min-w-0 p-4 transition-colors ${
                changed.has(path)
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "bg-card"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  {afterLabel || t("mediaPackage.ui.after")}
                </p>
                {changed.has(path) && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("mediaPackage.ui.newValue", {
                      defaultValue: "Bản mới",
                    })}
                  </span>
                )}
              </div>
              <p
                className={`[overflow-wrap:anywhere] whitespace-pre-wrap text-sm leading-relaxed ${
                  changed.has(path)
                    ? "font-semibold text-emerald-950 dark:text-emerald-100"
                    : "text-foreground"
                }`}
              >
                {valueFor(newValues.get(path), path)}
              </p>
            </div>
          </div>

          {/* Mobile view: reactive to mobileTab */}
          <div className="sm:hidden">
            {(mobileTab === "before" || mobileTab === "both") && (
              <div
                className={`border-border/60 min-w-0 p-3.5 transition-colors ${
                  mobileTab === "both" ? "border-b" : ""
                } ${
                  changed.has(path)
                    ? "bg-rose-500/5 dark:bg-rose-500/10"
                    : "bg-card"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">
                    {beforeLabel || t("mediaPackage.ui.before")}
                  </p>
                  {changed.has(path) && (
                    <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {t("mediaPackage.ui.previousValue", {
                        defaultValue: "Bản trước",
                      })}
                    </span>
                  )}
                </div>
                <p
                  className={`[overflow-wrap:anywhere] whitespace-pre-wrap text-xs leading-relaxed ${
                    changed.has(path)
                      ? "text-rose-950/80 dark:text-rose-200/80 line-through"
                      : "text-foreground"
                  }`}
                >
                  {valueFor(oldValues.get(path), path)}
                </p>
              </div>
            )}
            {(mobileTab === "after" || mobileTab === "both") && (
              <div
                className={`min-w-0 p-3.5 transition-colors ${
                  changed.has(path)
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "bg-card"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">
                    {afterLabel || t("mediaPackage.ui.after")}
                  </p>
                  {changed.has(path) && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {t("mediaPackage.ui.newValue", {
                        defaultValue: "Bản mới",
                      })}
                    </span>
                  )}
                </div>
                <p
                  className={`[overflow-wrap:anywhere] whitespace-pre-wrap text-xs leading-relaxed ${
                    changed.has(path)
                      ? "font-semibold text-emerald-950 dark:text-emerald-100"
                      : "text-foreground"
                  }`}
                >
                  {valueFor(newValues.get(path), path)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
