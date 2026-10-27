import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { aiGenerationService } from "@/services/aiGenerationService";
import { aiCreditErrorMessage } from "@/services/aiCreditRequest";
import type { SocialPlatform } from "@/types/editor";
import {
  formatPostHashtag,
  hasPostHashtag,
  normalizePostHashtag,
} from "@/pages/editor/utils/postHashtag";

interface Props {
  caption: string;
  platform: SocialPlatform;
  workspaceId?: string;
  userId?: string;
  hashtags: string[];
  onChange: (tags: string[]) => void;
}

export function AiHashtagSuggestions({
  caption,
  platform,
  workspaceId,
  userId,
  hashtags,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const prefix = "editor.hashtagInput.";
  const topic = caption.trim();
  const query = useQuery({
    queryKey: ["ai-hashtag-suggestions", userId, workspaceId, topic, platform],
    queryFn: ({ signal }) =>
      aiGenerationService.generateHashtags({ topic, platform }, signal),
    enabled: false,
    retry: false,
    gcTime: 0,
  });
  const suggestions = (query.data ?? [])
    .map(formatPostHashtag)
    .filter(
      (tag, index, tags) =>
        tag &&
        tags.findIndex(
          (candidate) =>
            normalizePostHashtag(candidate) === normalizePostHashtag(tag),
        ) === index,
    );
  return (
    <div className="border-border space-y-2 border-t pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!topic || !userId || query.isFetching}
        onClick={() => void query.refetch()}
      >
        {t(prefix + (query.isFetching ? "aiLoading" : "aiGenerate"), {
          platform,
        })}
      </Button>
      {!topic && (
        <p className="text-muted-foreground text-xs">
          {t(prefix + "aiCaptionRequired")}
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-destructive text-xs">
          {aiCreditErrorMessage(query.error) ?? t(prefix + "aiError")}
        </p>
      )}
      {!query.isFetching &&
        !query.isError &&
        query.isSuccess &&
        suggestions.length === 0 && (
          <p role="status" className="text-muted-foreground text-xs">
            {t(prefix + "aiEmpty")}
          </p>
        )}
      {!query.isFetching && !query.isError && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">
            {t(prefix + "aiRankHint")}
          </p>
          <ol className="space-y-2" aria-label={t(prefix + "aiResults")}>
            {suggestions.map((tag, index) => (
              <li
                key={normalizePostHashtag(tag)}
                className="flex min-w-0 items-center gap-2"
              >
                <span
                  className="text-muted-foreground w-5 shrink-0 text-right text-xs"
                  aria-hidden="true"
                >
                  {index + 1}.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto min-w-0 justify-start break-all whitespace-normal"
                  disabled={hasPostHashtag(hashtags, tag)}
                  aria-label={t(prefix + "aiApply", { tag })}
                  onClick={() => {
                    if (!hasPostHashtag(hashtags, tag))
                      onChange([...hashtags, tag]);
                  }}
                >
                  {tag}
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
