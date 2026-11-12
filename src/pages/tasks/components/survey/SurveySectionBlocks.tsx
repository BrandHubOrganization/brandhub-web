import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown) =>
  typeof value === "number" ? value : "";

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
        <div className="space-y-1">
          <label className="text-xs font-medium">
            {t(`${base}.channels`, { defaultValue: "channels" })}
          </label>
          <Textarea
            rows={2}
            value={asText(content.channels)}
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
            <label className="text-xs font-medium">
              {t(`${base}.${name}`, { defaultValue: name })}
            </label>
            <Textarea
              rows={3}
              value={asText(content[name])}
              onChange={(e) => api.edit(section, { [name]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
