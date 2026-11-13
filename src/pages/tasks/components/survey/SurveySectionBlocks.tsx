import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown) =>
  typeof value === "number" ? value : "";

const SURVEY_CHANNEL_OPTIONS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Threads",
  "Email",
  "QR tại sự kiện",
  "Website",
];

/** SURVEY.DISTRIBUTION: public link is read-only (comes from the published form, not typed). */
export function SurveyDistributionBlock({
  section,
  api,
  publicUrl,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
  publicUrl: string;
}) {
  const { t } = useTranslation();
  const content = api.contentOf(section);
  const base = "tasks.sections.SURVEY.DISTRIBUTION.fields";
  const isEmpty =
    !asText(content.channels).trim() && !asText(content.closeAt).trim();
  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">
            {t(`${base}.publicLink`, { defaultValue: "publicLink" })}
          </label>
          <Input readOnly disabled value={publicUrl} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">
            {t(`${base}.channels`, { defaultValue: "channels" })}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SURVEY_CHANNEL_OPTIONS.map((ch) => {
              const selected = asText(content.channels)
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean);
              const active = selected.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  disabled={!section.canEdit}
                  onClick={() => {
                    const next = active
                      ? selected.filter((s) => s !== ch)
                      : [...selected, ch];
                    api.edit(section, { channels: next.join(", ") });
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {active ? `✓ ${ch}` : `+ ${ch}`}
                </button>
              );
            })}
          </div>
          <Input
            disabled={!section.canEdit}
            value={asText(content.channels)}
            placeholder="Hoặc nhập thêm kênh phân phối..."
            onChange={(e) => api.edit(section, { channels: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">
              {t(`${base}.closeAt`, { defaultValue: "closeAt" })}
            </label>
            <Input
              type="datetime-local"
              value={asText(content.closeAt)}
              onChange={(e) => api.edit(section, { closeAt: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">
              {t(`${base}.targetResponses`, {
                defaultValue: "targetResponses",
              })}
            </label>
            <Input
              type="number"
              value={asNumber(content.targetResponses)}
              onChange={(e) =>
                api.edit(section, {
                  targetResponses: e.target.valueAsNumber,
                })
              }
            />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

/** SURVEY.REPORT: insight/conclusion/recommendations, free text per spec §3.3. */
export function SurveyReportBlock({
  section,
  api,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
}) {
  const { t } = useTranslation();
  const content = api.contentOf(section);
  const base = "tasks.sections.SURVEY.REPORT.fields";
  const names = ["insight", "conclusion", "recommendations"] as const;
  const isEmpty = names.every((name) => !asText(content[name]).trim());
  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-3">
        {names.map((name) => (
          <div key={name} className="space-y-1">
            <RichTextInput
              label={t(`${base}.${name}`, { defaultValue: name })}
              value={asText(content[name])}
              disabled={!section.canEdit}
              onChange={(html) => api.edit(section, { [name]: html })}
            />
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
