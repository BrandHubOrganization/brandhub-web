import type { TrendingTopic } from "../types/trends";
import { TrendingTopicCard } from "./TrendingTopicCard";

export interface TrendingTopicGridProps {
  topics: TrendingTopic[];
  onUseForContent: (topic: TrendingTopic) => void;
}

export function TrendingTopicGrid({
  topics,
  onUseForContent,
}: TrendingTopicGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TrendingTopicCard
          key={topic.id}
          topic={topic}
          onUseForContent={onUseForContent}
        />
      ))}
    </div>
  );
}

export default TrendingTopicGrid;
