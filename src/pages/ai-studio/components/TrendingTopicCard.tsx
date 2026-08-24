import { useTranslation } from "react-i18next";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TrendingTopic } from "../types/trends";

export interface TrendingTopicCardProps {
  topic: TrendingTopic;
  onUseForContent: (topic: TrendingTopic) => void;
}

export function TrendingTopicCard({
  topic,
  onUseForContent,
}: TrendingTopicCardProps) {
  const { t } = useTranslation();
  const isPositive = topic.growthPercent >= 0;

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">{topic.topic}</h3>
        <Badge variant="secondary">{topic.platform}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          {t("aiStudio.trends.volume")}: {topic.volume.toLocaleString()}
        </span>
        <span
          className={
            isPositive
              ? "flex items-center gap-1 font-medium text-green-600 dark:text-green-400"
              : "flex items-center gap-1 font-medium text-red-600 dark:text-red-400"
          }
        >
          {isPositive ? (
            <TrendingUp className="size-3.5" />
          ) : (
            <TrendingDown className="size-3.5" />
          )}
          {topic.growthPercent > 0 ? "+" : ""}
          {topic.growthPercent}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {topic.relatedKeywords.map((kw) => (
          <span
            key={kw}
            className="bg-muted text-muted-foreground text-3xs rounded-full px-2 py-0.5"
          >
            {kw}
          </span>
        ))}
      </div>

      <Button
        variant="orange"
        size="sm"
        className="mt-1 gap-1.5 text-xs"
        onClick={() => onUseForContent(topic)}
      >
        <Sparkles className="size-3.5" />
        {t("aiStudio.trends.useForContent")}
      </Button>
    </div>
  );
}

export default TrendingTopicCard;
