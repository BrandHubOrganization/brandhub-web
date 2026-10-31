import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  Video,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { taskService } from "@/services/taskService";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

interface TaskMeetingCardProps {
  workspaceId: string;
  taskId: string;
  meetingUrl?: string | null;
  onMeetingUrlGenerated?: (meetingUrl: string) => void;
}

export function TaskMeetingCard({
  workspaceId,
  taskId,
  meetingUrl,
  onMeetingUrlGenerated,
}: TaskMeetingCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentMeetingUrl, setCurrentMeetingUrl] = useState<string | null>(
    meetingUrl ?? null,
  );

  useEffect(() => {
    if (meetingUrl) {
      setCurrentMeetingUrl(meetingUrl);
    }
  }, [meetingUrl]);

  async function handleGenerate(forceNew = false) {
    if (loading) return;
    setLoading(true);
    try {
      const response = await taskService.generateLivestreamMeetingLink(
        workspaceId,
        taskId,
        { forceNew },
      );
      const data = response.data;
      if (data?.meetingUrl) {
        setCurrentMeetingUrl(data.meetingUrl);
        queryClient.setQueryData<TaskWorkflow>(
          ["task-workflow", workspaceId, taskId],
          (prev) => (prev ? { ...prev, meetingUrl: data.meetingUrl } : prev),
        );
        void queryClient.invalidateQueries({
          queryKey: ["task-workflow", workspaceId, taskId],
        });
        onMeetingUrlGenerated?.(data.meetingUrl);
        toast.success(
          forceNew
            ? t("tasks.meeting.regenerateSuccess")
            : t("tasks.meeting.generateSuccess"),
        );
      }
    } catch {
      toast.error(t("tasks.meeting.generateError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!currentMeetingUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentMeetingUrl);
      } else {
        const input = document.createElement("input");
        input.value = currentMeetingUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success(t("tasks.meeting.copiedSuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("tasks.meeting.copyError"));
    }
  }

  function handleJoin() {
    if (!currentMeetingUrl) return;
    window.open(currentMeetingUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="border-brand-orange/30 from-brand-orange/5 via-card to-card relative space-y-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Video className="size-4" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("tasks.meeting.title")}
            </h3>
            <p className="text-2xs text-muted-foreground">
              {t("tasks.meeting.description")}
            </p>
          </div>
        </div>
        {currentMeetingUrl ? (
          <span className="text-2xs rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
            {t("tasks.meeting.readyStatus")}
          </span>
        ) : (
          <span className="bg-muted text-muted-foreground text-2xs rounded-md px-2 py-0.5 font-medium">
            {t("tasks.meeting.pendingStatus")}
          </span>
        )}
      </div>

      {currentMeetingUrl ? (
        <div className="bg-background/80 border-border/70 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border p-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Video className="text-brand-orange size-4 shrink-0" />
            <a
              href={currentMeetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-brand-orange truncate font-mono text-xs transition-colors"
            >
              {currentMeetingUrl}
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border/80 text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs shadow-xs"
              onClick={() => void handleCopy()}
              title={t("tasks.meeting.copyButton")}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-border/80 text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs shadow-xs"
              onClick={() => void handleGenerate(true)}
            >
              {loading ? (
                <Spinner className="size-3.5" />
              ) : (
                <RotateCw className="size-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="orange"
              size="sm"
              className="h-8 gap-1.5 text-xs shadow-xs"
              onClick={handleJoin}
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/20 border-border/70 flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
          <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
            {t("tasks.meeting.noLink")}
          </p>
          <Button
            type="button"
            variant="orange"
            size="sm"
            disabled={loading}
            onClick={() => void handleGenerate(false)}
            className="h-8 shrink-0 gap-1.5 text-xs shadow-xs"
          >
            {loading ? (
              <Spinner className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            <span>
              {loading
                ? t("tasks.meeting.generating")
                : t("tasks.meeting.generateButton")}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
