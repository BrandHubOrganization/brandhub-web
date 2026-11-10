import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

type FieldKind = "text" | "list";
/** Mirrors backend `TaskCatalog.fields`; lists are edited one item per line. */
const FIELDS: Record<string, Record<string, FieldKind>> = {
  "POST.BRIEF": { notes: "text", sources: "list", materials: "list" },
  "VIDEO.SCRIPT": { idea: "text", scenes: "list" },
};

const asLines = (value: unknown) =>
  Array.isArray(value) ? value.map(String).join("\n") : "";
const asText = (value: unknown) => (typeof value === "string" ? value : "");

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
  const isEmpty = Object.keys(fields).every((name) =>
    fields[name] === "list"
      ? !asLines(content[name]).trim()
      : !asText(content[name]).trim(),
  );
  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-3">
        {Object.entries(fields).map(([name, kind]) => {
          const id = `${section.key}-${name}`;
          return (
            <div key={name} className="space-y-1">
              <label htmlFor={id} className="text-xs font-medium">
                {t(`tasks.sections.${section.key}.fields.${name}`, {
                  defaultValue: name,
                })}
              </label>
              <Textarea
                id={id}
                rows={kind === "list" ? 3 : 4}
                value={
                  kind === "list"
                    ? asLines(content[name])
                    : asText(content[name])
                }
                placeholder={
                  kind === "list" ? t("editor.sections.onePerLine") : undefined
                }
                onChange={(e) =>
                  api.edit(section, {
                    [name]:
                      kind === "list"
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
