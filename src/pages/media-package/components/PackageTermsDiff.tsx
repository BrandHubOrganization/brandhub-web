import { useTranslation } from "react-i18next";

type Terms = Record<string, unknown>;
type FlatValues = Map<string, unknown>;

const FIELD_LABELS: Record<string, { vi: string; en: string }> = {
  name: { vi: "Tên gói", en: "Package name" },
  type: { vi: "Loại gói", en: "Package type" },
  budgetAmount: { vi: "Ngân sách", en: "Budget" },
  durationWeeks: { vi: "Thời lượng (tuần)", en: "Duration (weeks)" },
  scopeDescription: { vi: "Phạm vi công việc", en: "Scope" },
  offeringModel: { vi: "Cách đóng gói", en: "Offering model" },
  maxChanges: { vi: "Số lần thay đổi tối đa", en: "Maximum changes" },
  serviceType: { vi: "Dịch vụ", en: "Service" },
  quantity: { vi: "Số lượng", en: "Quantity" },
  unit: { vi: "Đơn vị", en: "Unit" },
  description: { vi: "Mô tả", en: "Description" },
  acceptanceCriteria: { vi: "Tiêu chí nghiệm thu", en: "Acceptance criteria" },
};

function flatten(value: unknown, output: FlatValues, path = ""): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const id = item && typeof item === "object" && "id" in item
        ? String(item.id) : String(index);
      flatten(item, output, `${path}.${id}`);
    });
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (key === "sourcePackageId" || key === "id" || key === "revisionLimit") return;
      flatten(child, output, path ? `${path}.${key}` : key);
    });
  } else if (path) {
    output.set(path, value);
  }
}

function deliverableNames(terms: Terms): Map<string, string> {
  const details = terms.offeringDetails as { deliverables?: { id: string; name?: string }[] } | undefined;
  return new Map((details?.deliverables ?? []).map((item, index) =>
    [String(item.id ?? index), item.name || `#${index + 1}`]));
}

function displayValue(value: unknown, path: string, language: string): string {
  if (value === undefined || value === null || value === "") return "—";
  if (path === "budgetAmount" && typeof value === "number") {
    return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US",
      { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function PackageTermsDiff({ before, after }: { before: Terms; after: Terms }) {
  const { i18n } = useTranslation();
  const vi = i18n.language === "vi";
  const oldValues: FlatValues = new Map();
  const newValues: FlatValues = new Map();
  flatten(before, oldValues);
  flatten(after, newValues);
  const names = new Map([...deliverableNames(before), ...deliverableNames(after)]);
  const paths = [...new Set([...oldValues.keys(), ...newValues.keys()])];
  const changed = new Set(paths.filter(path => JSON.stringify(oldValues.get(path)) !== JSON.stringify(newValues.get(path))));

  const labelFor = (path: string) => {
    const parts = path.split(".");
    const field = parts.at(-1) ?? path;
    const label = FIELD_LABELS[field]?.[vi ? "vi" : "en"] ?? field;
    if (parts[0] === "offeringDetails" && parts[1] === "deliverables" && parts[2]) {
      const itemName = names.get(parts[2]) ?? parts[2];
      return `${itemName} · ${label}`;
    }
    return label;
  };

  return <section className="overflow-hidden rounded-xl border border-border text-xs">
    <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
      <h4 className="font-semibold">{vi ? "Đối chiếu điều khoản" : "Compare terms"}</h4>
      <span className="text-muted-foreground">{vi ? `${changed.size} thay đổi` : `${changed.size} changes`}</span>
    </div>
    <div className="grid grid-cols-2 border-b bg-muted/20 font-semibold">
      <span className="border-r px-3 py-2">{vi ? "Bản hiện tại" : "Current version"}</span>
      <span className="px-3 py-2">{vi ? "Bản đề xuất" : "Proposed version"}</span>
    </div>
    {!paths.length && <p className="p-3 text-muted-foreground">{vi ? "Chưa có điều khoản để đối chiếu." : "No terms to compare."}</p>}
    {paths.map(path => {
      const isChanged = changed.has(path);
      return <div key={path} className={`grid grid-cols-2 border-b last:border-b-0 ${isChanged ? "border-l-2 border-l-amber-500" : ""}`}>
        <div className={`min-w-0 border-r px-3 py-2 ${isChanged ? "bg-red-50 dark:bg-red-950/25" : ""}`}>
          <p className="mb-1 font-medium text-muted-foreground">{labelFor(path)}</p>
          <p className={`whitespace-pre-wrap break-words ${isChanged ? "font-semibold text-red-800 dark:text-red-300" : ""}`}>
            {displayValue(oldValues.get(path), path, i18n.language)}
          </p>
        </div>
        <div className={`min-w-0 px-3 py-2 ${isChanged ? "bg-green-50 dark:bg-green-950/25" : ""}`}>
          <p className="mb-1 font-medium text-muted-foreground">{labelFor(path)}</p>
          <p className={`whitespace-pre-wrap break-words ${isChanged ? "font-semibold text-green-800 dark:text-green-300" : ""}`}>
            {displayValue(newValues.get(path), path, i18n.language)}
          </p>
        </div>
      </div>;
    })}
  </section>;
}
