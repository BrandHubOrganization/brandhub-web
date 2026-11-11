import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Send, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import { mailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";
import { newsletterService } from "@/pages/tasks/services/newsletterService";
import type { RecipientGroup } from "@/pages/mail-templates/types";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

/** EMAIL.AUDIENCE: pick saved recipient groups, schedule, send/send-test (spec §3.8). */
export function EmailAudienceBlock({
  workspaceId,
  taskId,
  section,
  api,
}: {
  workspaceId: string;
  taskId: string;
  section: TaskSection;
  api: TaskSectionsApi;
}) {
  const { t } = useTranslation();
  const content = api.contentOf(section);
  const scheduledAt = asText(content.scheduledAt);
  const selectedIds = asIds(content.recipientGroupIds);
  const [groups, setGroups] = useState<RecipientGroup[]>([]);
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    mailTemplateService
      .recipientGroups(workspaceId)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [workspaceId]);

  const toggleGroup = (id: string) =>
    api.edit(section, {
      recipientGroupIds: selectedIds.includes(id)
        ? selectedIds.filter((g) => g !== id)
        : [...selectedIds, id],
    });

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await newsletterService.sendTest(workspaceId, taskId);
      toast.success(t("tasks.newsletter.testSent"));
    } catch {
      toast.error(t("tasks.newsletter.sendError"));
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error(t("tasks.newsletter.noRecipients"));
      return;
    }
    setSending(true);
    try {
      const result = await newsletterService.send(workspaceId, taskId, {
        recipientGroupIds: selectedIds,
        scheduledAt: scheduledAt || undefined,
      });
      toast.success(
        t("tasks.newsletter.sent", { count: result.accepted }),
      );
    } catch {
      toast.error(t("tasks.newsletter.sendError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <SectionFrame
      section={section}
      api={api}
      isEmpty={selectedIds.length === 0}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">
            {t("tasks.sections.EMAIL.AUDIENCE.fields.recipientGroups")}
          </label>
          <div className="space-y-1 rounded-md border p-2">
            {groups.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {t("tasks.newsletter.noGroups")}
              </p>
            )}
            {groups.map((group) => (
              <label
                key={group.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="size-4"
                  checked={selectedIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                <span>
                  {group.name} ({group.count})
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">
            {t("tasks.sections.EMAIL.AUDIENCE.fields.scheduledAt")}
          </label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) =>
              api.edit(section, { scheduledAt: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={sendingTest}
            onClick={() => void handleSendTest()}
          >
            <TestTube className="size-4" />
            {t("tasks.newsletter.sendTest")}
          </Button>
          <Button type="button" disabled={sending} onClick={() => void handleSend()}>
            <Send className="size-4" />
            {t("tasks.newsletter.send")}
          </Button>
        </div>
      </div>
    </SectionFrame>
  );
}
