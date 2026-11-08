import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExternalLink, MessageSquare, RefreshCw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCampaignFeedbackViewed } from "@/pages/campaign/hooks/useCampaignFeedbackViewed";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign } from "@/pages/campaign/types";
export function CampaignFeedbackRail({
  workspaceId,
  campaign,
  canComment,
  userId,
}: {
  workspaceId: string;
  campaign: Campaign;
  canComment: boolean;
  userId: string;
}) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const readKey = `campaign-feedback-viewed:${userId}:${workspaceId}:${campaign.id}`;
  const { viewed, markViewed } = useCampaignFeedbackViewed(readKey);
  const key = ["campaign-feedback", userId, workspaceId, campaign.id];
  const query = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await campaignService.events(workspaceId, campaign.id)).data.data,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const clientFeedback = (query.data ?? []).filter(
    (event) =>
      event.actorSide === "CLIENT" &&
      event.eventType === "FEEDBACK" &&
      event.actorId !== userId,
  );
  const unread = open
    ? 0
    : clientFeedback.filter((event) => Date.parse(event.createdAt) > viewed)
        .length;
  useEffect(() => {
    if (!open || !query.isSuccess || query.isRefetchError) return;
    const latest = Math.max(
      viewed,
      ...(query.data ?? [])
        .filter(
          (event) =>
            event.actorSide === "CLIENT" &&
            event.eventType === "FEEDBACK" &&
            event.actorId !== userId,
        )
        .map((event) => Date.parse(event.createdAt))
        .filter(Number.isFinite),
    );
    markViewed(latest);
  }, [
    open,
    query.data,
    query.isSuccess,
    query.isRefetchError,
    viewed,
    markViewed,
    userId,
  ]);
  const mutation = useMutation({
    mutationFn: () =>
      campaignService.feedback(workspaceId, campaign, comment.trim()),
    onSuccess: () => {
      setComment("");
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={unread > 0 ? "orange" : "secondary"}
          size="icon"
          className="fixed right-5 bottom-12 z-40 size-12 rounded-full border shadow-lg sm:right-7"
          aria-label={
            unread > 0
              ? t("campaign.timeline.newClientFeedback", { count: unread })
              : t("campaign.timeline.feedback")
          }
        >
          <MessageSquare className="size-5" />
          {unread > 0 && (
            <span
              aria-hidden
              className="bg-destructive text-destructive-foreground border-background absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 text-[10px]"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
          {query.isError && (
            <span
              className="bg-destructive absolute top-0 right-0 size-2.5 rounded-full"
              aria-hidden
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="flex h-[min(520px,calc(100dvh-100px))] w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden p-0"
      >
        <header className="border-border flex items-center gap-2 border-b px-3 py-3">
          <MessageSquare className="size-4" />
          <h2 className="text-xs font-semibold">
            {t("campaign.timeline.feedback")}
          </h2>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="ml-auto size-7"
          >
            <Link
              to={`/workspaces/${workspaceId}/chat`}
              aria-label={t("campaign.timeline.workspaceChat")}
              title={t("campaign.timeline.workspaceChat")}
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={t("campaign.reload")}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={t("campaign.timeline.closeFeedback")}
            onClick={() => setOpen(false)}
          >
            <X className="size-3.5" />
          </Button>
        </header>
        <div className="ct-feedback-stream px-3">
          {query.isPending && (
            <div className="space-y-3 py-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          {query.isError && (
            <p role="alert" className="text-destructive py-3 text-xs">
              {t("campaign.error")}
            </p>
          )}
          {query.data?.length === 0 && (
            <p className="text-muted-foreground py-4 text-xs">
              {t("campaign.timeline.noFeedback")}
            </p>
          )}
          {query.data?.map((event) => (
            <article
              key={event.id}
              className="border-border border-b py-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <b>
                  {t(
                    event.actorSide === "CLIENT"
                      ? "campaign.review.client"
                      : "campaign.review.agency",
                  )}
                </b>
                <span className="text-muted-foreground text-[10px]">
                  v{event.contentVersion}
                </span>
              </div>
              <time className="text-muted-foreground text-[10px]">
                {new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(event.createdAt))}
              </time>
              <p className="mt-2 leading-5 break-words whitespace-pre-wrap">
                {event.comment || t(`campaign.review.${event.eventType}`)}
              </p>
            </article>
          ))}
        </div>
        {canComment && (
          <form
            className="border-border space-y-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim() && !mutation.isPending) mutation.mutate();
            }}
          >
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={mutation.isPending}
              rows={3}
              maxLength={4000}
              className="min-h-20 text-xs"
              placeholder={t("campaign.timeline.feedbackPlaceholder")}
              aria-label={t("campaign.timeline.feedback")}
              onKeyDown={(event) => {
                if (
                  event.key !== "Enter" ||
                  event.shiftKey ||
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229
                )
                  return;
                event.preventDefault();
                if (!event.repeat && comment.trim() && !mutation.isPending) {
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            {mutation.isError && (
              <p role="alert" className="text-destructive text-xs">
                {t("campaign.timeline.feedbackError")}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                variant="orange"
                size="sm"
                type="submit"
                disabled={!comment.trim() || mutation.isPending}
              >
                {t("campaign.review.send")}
              </Button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
