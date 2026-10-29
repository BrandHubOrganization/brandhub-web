import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  SocialPlatformBadge,
  SOCIAL_PLATFORMS,
} from "@/components/common/SocialPlatformBadge";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

interface TaskTargetPlatformsPickerProps {
  task: TaskWorkflow;
}

export function TaskTargetPlatformsPicker({
  task,
}: TaskTargetPlatformsPickerProps) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const [busy, setBusy] = useState(false);

  const canEdit =
    task.allowedActions.canEditDetail &&
    task.lockReason !== "TASK_CAMPAIGN_COMPLETED" &&
    (task.status as string) !== "CANCELLED";

  const rawPlatforms = task.typeMetadata?.targetPlatforms;
  const currentPlatforms = Array.isArray(rawPlatforms) ? rawPlatforms : [];

  async function togglePlatform(platform: string) {
    if (!canEdit || busy) return;
    const exists = currentPlatforms.includes(platform);
    if (exists && currentPlatforms.length <= 1) {
      toast.error(t("tasks.fields.platformsRequired"));
      return;
    }
    const updated = exists
      ? currentPlatforms.filter((p) => p !== platform)
      : [...currentPlatforms, platform];

    setBusy(true);
    try {
      await state.field("targetPlatforms", updated);
      toast.success(t("tasks.fields.platformsUpdated"));
    } catch {
      toast.error(t("tasks.fields.platformsError"));
      state.retry();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Share2 className="text-brand-orange size-3.5" />
          <span>{t("tasks.fields.targetPlatforms")}</span>
        </div>
        {canEdit && (
          <span className="text-muted-foreground text-2xs">
            {t("tasks.fields.selectPlatforms")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {SOCIAL_PLATFORMS.map((platform) => {
          const isSelected = currentPlatforms.includes(platform);
          return (
            <SocialPlatformBadge
              key={platform}
              platform={platform}
              size="sm"
              interactive={canEdit}
              disabled={busy}
              selected={isSelected}
              onClick={() => togglePlatform(platform)}
            />
          );
        })}
      </div>
    </div>
  );
}
