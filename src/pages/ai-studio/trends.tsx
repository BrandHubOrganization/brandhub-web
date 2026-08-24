import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addKeyword,
  deleteKeyword,
  getKeywords,
  getTrendingTopics,
  toggleKeyword,
  useForContent,
} from "@/services/mock/mockTrendsService";
import type {
  CrawlFrequency,
  TrendKeyword,
  TrendingTopic,
} from "./types/trends";
import { KeywordConfigPanel } from "./components/KeywordConfigPanel";
import { TrendingTopicGrid } from "./components/TrendingTopicGrid";
import { AiStudioErrorBanner } from "./components/AiStudioErrorBanner";

export function TrendsPage() {
  const { t } = useTranslation();
  const [keywords, setKeywords] = useState<TrendKeyword[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const [keywordsData, topicsData] = await Promise.all([
          getKeywords(),
          getTrendingTopics(),
        ]);
        if (!cancelled) {
          setKeywords(keywordsData);
          setTopics(topicsData);
        }
      } catch (err) {
        console.error("Failed to load trends data:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddKeyword(keyword: string, frequency: CrawlFrequency) {
    try {
      const created = await addKeyword(keyword, frequency);
      setKeywords((prev) => [...prev, created]);
      toast.success(t("aiStudio.trends.addSuccess"));
    } catch (err) {
      console.error("Failed to add keyword:", err);
      toast.error(t("aiStudio.trends.addError"));
    }
  }

  async function handleToggleKeyword(id: string) {
    try {
      const updated = await toggleKeyword(id);
      setKeywords((prev) => prev.map((k) => (k.id === id ? updated : k)));
      toast.success(t("aiStudio.trends.toggleSuccess"));
    } catch (err) {
      console.error("Failed to toggle keyword:", err);
      toast.error(t("aiStudio.trends.toggleError"));
    }
  }

  async function handleDeleteKeyword(id: string) {
    if (!window.confirm(t("aiStudio.trends.deleteConfirm"))) return;
    try {
      await deleteKeyword(id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast.success(t("aiStudio.trends.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete keyword:", err);
      toast.error(t("aiStudio.trends.deleteError"));
    }
  }

  async function handleUseForContent(topic: TrendingTopic) {
    try {
      await useForContent(topic.id);
      toast.success(t("aiStudio.trends.useForContentSuccess"));
    } catch (err) {
      console.error("Failed to use topic for content:", err);
      toast.error(t("aiStudio.trends.useForContentError"));
    }
  }

  return (
    <PageWrapper
      title={t("aiStudio.trends.title")}
      description={t("aiStudio.trends.description")}
    >
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <AiStudioErrorBanner
          messageKey="aiStudio.trends.loadError"
          retryKey="aiStudio.trends.retry"
        />
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <KeywordConfigPanel
            keywords={keywords}
            onAdd={handleAddKeyword}
            onToggle={handleToggleKeyword}
            onDelete={handleDeleteKeyword}
          />
          <TrendingTopicGrid
            topics={topics}
            onUseForContent={handleUseForContent}
          />
        </div>
      )}
    </PageWrapper>
  );
}

export default TrendsPage;
