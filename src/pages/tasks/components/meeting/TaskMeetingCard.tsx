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
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { taskService } from "@/services/taskService";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";
import { cn } from "@/lib/utils";

interface TaskMeetingCardProps {
  workspaceId: string;
  taskId: string;
  meetingUrl?: string | null;
  meetingExpiresAt?: string | null;
  isMeetingExpired?: boolean;
  onMeetingUrlGenerated?: (meetingUrl: string) => void;
}

function formatExpiresAt(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat(locale.startsWith("vi") ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function TaskMeetingCard({
  workspaceId,
  taskId,
  meetingUrl,
  meetingExpiresAt,
  isMeetingExpired,
  onMeetingUrlGenerated,
}: TaskMeetingCardProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentMeetingUrl, setCurrentMeetingUrl] = useState<string | null>(
    meetingUrl ?? null,
  );
  const [currentMeetingExpiresAt, setCurrentMeetingExpiresAt] = useState<
    string | null
  >(meetingExpiresAt ?? null);
  const [currentIsMeetingExpired, setCurrentIsMeetingExpired] = useState<
    boolean
  >(Boolean(isMeetingExpired));

  useEffect(() => {
    if (meetingUrl !== undefined) {
      setCurrentMeetingUrl(meetingUrl);
    }
  }, [meetingUrl]);

  useEffect(() => {
    if (meetingExpiresAt !== undefined) {
      setCurrentMeetingExpiresAt(meetingExpiresAt);
    }
  }, [meetingExpiresAt]);

  useEffect(() => {
    if (isMeetingExpired !== undefined) {
      setCurrentIsMeetingExpired(isMeetingExpired);
    }
  }, [isMeetingExpired]);

  const isExpired = Boolean(
    currentIsMeetingExpired ||
      (currentMeetingExpiresAt && new Date(currentMeetingExpiresAt) < new Date()),
  );

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
        const newExpiresAt = data.meetingExpiresAt ?? data.expiresAt ?? null;
        setCurrentMeetingExpiresAt(newExpiresAt);
        setCurrentIsMeetingExpired(false);
        queryClient.setQueryData<TaskWorkflow>(
          ["task-workflow", workspaceId, taskId],
          (prev) =>
            prev
              ? {
                  ...prev,
                  meetingUrl: data.meetingUrl,
                  meetingExpiresAt: newExpiresAt,
                  isMeetingExpired: false,
                }
              : prev,
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
    if (!currentMeetingUrl || isExpired) return;
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
          isExpired ? (
            <span className="text-2xs rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
              {t("tasks.meeting.expiredStatus")}
            </span>
          ) : (
            <span className="text-2xs rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              {t("tasks.meeting.readyStatus")}
            </span>
          )
        ) : (
          <span className="bg-muted text-muted-foreground text-2xs rounded-md px-2 py-0.5 font-medium">
            {t("tasks.meeting.pendingStatus")}
          </span>
        )}
      </div>

      {currentMeetingUrl && isExpired && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="flex-1 font-medium leading-relaxed">
            {t("tasks.meeting.expiredNotice")}
          </span>
        </div>
      )}

      {currentMeetingUrl ? (
        <div
          className={cn(
            "bg-background/80 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border p-2.5 transition-colors",
            isExpired
              ? "border-amber-500/30 bg-amber-500/[0.03]"
              : "border-border/70",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2">
              {isExpired ? (
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
              ) : (
                <Video className="text-brand-orange size-4 shrink-0" />
              )}
              {isExpired ? (
                <span
                  className="text-muted-foreground/60 truncate font-mono text-xs line-through"
                  title={t("tasks.meeting.linkExpiredTooltip")}
                >
                  {currentMeetingUrl}
                </span>
              ) : (
                <a
                  href={currentMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-brand-orange truncate font-mono text-xs transition-colors"
                >
                  {currentMeetingUrl}
                </a>
              )}
            </div>
            {currentMeetingExpiresAt && (
              <div className="flex items-center gap-1.5 pl-6 text-2xs text-muted-foreground">
                <Clock className="size-3 text-muted-foreground/70" />
                <span>
                  {t("tasks.meeting.expiresAtLabel", {
                    time: formatExpiresAt(currentMeetingExpiresAt, i18n.language),
                  })}
                </span>
              </div>
            )}
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
            {isExpired ? (
              <Button
                type="button"
                variant="orange"
                size="sm"
                disabled={loading}
                className="h-8 gap-1.5 text-xs font-medium shadow-xs"
                onClick={() => void handleGenerate(true)}
              >
                {loading ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <RotateCw className="size-3.5" />
                )}
                <span>
                  {loading
                    ? t("tasks.meeting.generating")
                    : t("tasks.meeting.regenerateButton")}
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-border/80 text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs shadow-xs"
                onClick={() => void handleGenerate(true)}
                title={t("tasks.meeting.regenerateButton")}
              >
                {loading ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <RotateCw className="size-3.5" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant={isExpired ? "outline" : "orange"}
              size="sm"
              disabled={isExpired}
              className={cn(
                "h-8 gap-1.5 text-xs shadow-xs",
                isExpired &&
                  "border-border/60 text-muted-foreground/50 cursor-not-allowed opacity-50",
              )}
              onClick={handleJoin}
              title={
                isExpired
                  ? t("tasks.meeting.linkExpiredTooltip")
                  : t("tasks.meeting.joinButton")
              }
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

