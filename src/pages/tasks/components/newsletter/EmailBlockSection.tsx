import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import { BlockBuilder } from "@/pages/mail-templates/components/BlockBuilder";
import { MailPreview } from "@/pages/mail-templates/components/MailPreview";
import {
  renderLayoutPreview,
  validateBlocks,
  type MailBlock,
} from "@/pages/mail-templates/blocks";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asBlocks = (value: unknown): MailBlock[] =>
  Array.isArray(value) ? (value as MailBlock[]) : [];

/** EMAIL.CONTENT / EMAIL.DESIGN: subject + preheader + a block list, built/previewed with mail-templates' BlockBuilder. */
export function EmailBlockSection({
  section,
  api,
  showSubject = true,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
  showSubject?: boolean;
}) {
  const { t } = useTranslation();
  const content = api.contentOf(section);
  const subject = asText(content.subject);
  const preheader = asText(content.preheader);
  const blocks = asBlocks(content.blocks);
  const isEmpty = !subject.trim() && blocks.length === 0;
  const errors = validateBlocks(blocks);

  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-4">
        {showSubject && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">
                {t("tasks.sections.EMAIL.CONTENT.fields.subject", {
                  defaultValue: "subject",
                })}
              </label>
              <Input
                value={subject}
                onChange={(e) => api.edit(section, { subject: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">
                {t("tasks.sections.EMAIL.CONTENT.fields.preheader", {
                  defaultValue: "preheader",
                })}
              </label>
              <Input
                value={preheader}
                onChange={(e) =>
                  api.edit(section, { preheader: e.target.value })
                }
              />
            </div>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <BlockBuilder
            blocks={blocks}
            onChange={(next) => api.edit(section, { blocks: next })}
            errors={errors}
          />
          <MailPreview
            subject={subject}
            bodyHtml={renderLayoutPreview(blocks)}
          />
        </div>
      </div>
    </SectionFrame>
  );
}
