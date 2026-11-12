import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import {
  SectionListField,
  type ListColumn,
} from "@/components/task-sections/SectionListField";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

type FieldKind = "text" | "list" | "table";
interface FieldDef {
  kind: FieldKind;
  columns?: ListColumn[];
}
const field = (kind: FieldKind, columns?: ListColumn[]): FieldDef => ({
  kind,
  columns,
});

/** Mirrors backend `TaskCatalog.fields`; lists are edited one item per line, tables as rows. */
const FIELDS: Record<string, Record<string, FieldDef>> = {
  "POST.BRIEF": {
    notes: field("text"),
    sources: field("list"),
    materials: field("list"),
  },
  "VIDEO.SCRIPT": { idea: field("text"), scenes: field("list") },
  "EVENT.AGENDA": {
    concept: field("text"),
    goal: field("text"),
    datetimeVenue: field("text"),
    agenda: field("table", [
      { key: "time" },
      { key: "item" },
      { key: "owner" },
    ]),
  },
  "EVENT.LOGISTICS": {
    venue: field("text"),
    vendors: field("table", [
      { key: "name" },
      { key: "category" },
      { key: "costVnd", type: "number" },
      { key: "contact" },
    ]),
    totalBudget: field("text"),
    checklist: field("list"),
  },
  "EVENT.PROMOTION": {
    plan: field("text"),
    guests: field("table", [
      { key: "name" },
      { key: "org" },
      { key: "inviteStatus" },
    ]),
  },
  "EVENT.RUNSHEET": {
    runsheet: field("table", [
      { key: "time" },
      { key: "task" },
      { key: "owner" },
    ]),
    staffing: field("text"),
  },
  "EVENT.REPORT": {
    result: field("text"),
    attendeeCount: field("text"),
    lessons: field("text"),
  },
  "PRESS.MEDIA_LIST": {
    outlets: field("table", [
      { key: "outlet" },
      { key: "section" },
      { key: "journalist" },
      { key: "contact" },
      { key: "note" },
    ]),
  },
  "PRESS.RELEASE": {
    title: field("text"),
    sapo: field("text"),
    content: field("text"),
  },
  "PRESS.CONTACT_LOG": {
    log: field("table", [
      { key: "date" },
      { key: "outlet" },
      { key: "contact" },
      { key: "channel" },
      { key: "result" },
    ]),
  },
  "PRESS.COVERAGE": {
    coverage: field("table", [
      { key: "outlet" },
      { key: "link" },
      { key: "publishedAt" },
    ]),
  },
  "KOL.SHORTLIST": {
    shortlist: field("table", [
      { key: "name" },
      { key: "channel" },
      { key: "link" },
      { key: "followers", type: "number" },
      { key: "engagementRate" },
      { key: "reason" },
    ]),
  },
  "KOL.DEAL": {
    kol: field("text"),
    priceVnd: field("text"),
    deliverables: field("list"),
    terms: field("text"),
  },
  "KOL.BRIEF": {
    keyMessage: field("text"),
    dos: field("list"),
    donts: field("list"),
    requiredHashtags: field("list"),
    postDeadline: field("text"),
  },
  "KOL.DRAFT": {
    draftCaption: field("text"),
    draftMedia: field("list"),
    reviewNote: field("text"),
  },
  "KOL.REPORT": {
    postLink: field("text"),
    postedAt: field("text"),
    views: field("text"),
    likes: field("text"),
    comments: field("text"),
    shares: field("text"),
  },
  "WORKSHOP.PROGRAM": {
    topic: field("text"),
    agenda: field("list"),
    materials: field("list"),
  },
  "WORKSHOP.SPEAKERS": {
    speakers: field("table", [
      { key: "name" },
      { key: "title" },
      { key: "topic" },
      { key: "inviteStatus" },
    ]),
  },
  "WORKSHOP.LOGISTICS": {
    format: field("text"),
    venueOrMeetingUrl: field("text"),
    cost: field("text"),
  },
  "WORKSHOP.REPORT": {
    registeredCount: field("text"),
    attendedCount: field("text"),
    feedback: field("text"),
    photos: field("list"),
    lessons: field("text"),
  },
  "EMAIL.REPORT": {
    sentCount: field("text"),
    successCount: field("text"),
    bounceCount: field("text"),
    unsubscribeCount: field("text"),
    note: field("text"),
  },
};

const asLines = (value: unknown) =>
  Array.isArray(value) ? value.map(String).join("\n") : "";
const asText = (value: unknown) => (typeof value === "string" ? value : "");
const isTableEmpty = (value: unknown) =>
  !Array.isArray(value) || value.length === 0;

/** Section with its own stored fields (POST.BRIEF, VIDEO.SCRIPT), saved through `useTaskSections`. */
export function SectionFieldsBlock({
  section,
  api,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
}) {
  const { t } = useTranslation();
  const fields = FIELDS[section.key] ?? {};
  const content = api.contentOf(section);
  const isEmpty = Object.entries(fields).every(([name, def]) =>
    def.kind === "table"
      ? isTableEmpty(content[name])
      : def.kind === "list"
        ? !asLines(content[name]).trim()
        : !asText(content[name]).trim(),
  );
  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-3">
        {Object.entries(fields).map(([name, def]) => {
          const id = `${section.key}-${name}`;
          const label = t(`tasks.sections.${section.key}.fields.${name}`, {
            defaultValue: name,
          });
          if (def.kind === "table") {
            return (
              <div key={name} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <SectionListField
                  sectionKey={section.key}
                  name={name}
                  columns={def.columns ?? []}
                  value={content[name]}
                  onChange={(rows) => api.edit(section, { [name]: rows })}
                />
              </div>
            );
          }
          return (
            <div key={name} className="space-y-1">
              <label htmlFor={id} className="text-xs font-medium">
                {label}
              </label>
              <Textarea
                id={id}
                rows={def.kind === "list" ? 3 : 4}
                value={
                  def.kind === "list"
                    ? asLines(content[name])
                    : asText(content[name])
                }
                placeholder={
                  def.kind === "list"
                    ? t("editor.sections.onePerLine")
                    : undefined
                }
                onChange={(e) =>
                  api.edit(section, {
                    [name]:
                      def.kind === "list"
                        ? e.target.value.split("\n")
                        : e.target.value,
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </SectionFrame>
  );
}

/** Reserved slot without a schema yet (VIDEO.SHOOT): header, status and actions only. */
export function SectionSlot({
  section,
  api,
  children,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <SectionFrame section={section} api={api} showVersions={false}>
      {children ?? (
        <p className="text-muted-foreground text-sm">
          {t("editor.sections.comingSoon")}
        </p>
      )}
    </SectionFrame>
  );
}
