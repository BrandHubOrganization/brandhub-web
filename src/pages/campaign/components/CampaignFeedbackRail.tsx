import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  const key = ["campaign-feedback", userId, workspaceId, campaign.id];
  const query = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await campaignService.events(workspaceId, campaign.id)).data.data,
  });
  const mutation = useMutation({
    mutationFn: () =>
      campaignService.feedback(workspaceId, campaign, comment.trim()),
    onSuccess: () => {
      setComment("");
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return (
    <section className="border-border bg-card flex min-h-72 flex-1 flex-col overflow-hidden rounded-xl border">
      <header className="border-border flex items-center gap-2 border-b px-3 py-3">
        <MessageSquare className="size-4" />
        <h2 className="text-xs font-semibold">
          {t("campaign.timeline.feedback")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-6"
          aria-label={t("campaign.reload")}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-3" />
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
    </section>
  );
}
