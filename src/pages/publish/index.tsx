import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/types/post";
import {
  createPost,
  getScheduledPosts,
  retryPost,
} from "@/services/mock/mockPublishService";
import { ComposerForm, type ComposerFormState } from "./components/ComposerForm";
import { PublishPreview } from "./components/PublishPreview";
import { PublishStatusTable } from "./components/PublishStatusTable";
import { PublishErrorBanner } from "./components/PublishErrorBanner";

const INITIAL_FORM_STATE: ComposerFormState = {
  title: "",
  caption: "",
  hashtagsInput: "",
  mediaUrlsInput: "",
  scheduledAt: "",
  platformTargets: [],
};

export function PublishPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<ComposerFormState>(INITIAL_FORM_STATE);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getScheduledPosts();
        if (!cancelled) setPosts(data);
      } catch (err) {
        console.error("Failed to load posts:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const post = await createPost({
        title: formState.title,
        caption: formState.caption,
        hashtags: formState.hashtagsInput
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
        mediaUrls: formState.mediaUrlsInput
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
        platformTargets: formState.platformTargets,
        scheduledAt: formState.scheduledAt
          ? new Date(formState.scheduledAt).toISOString()
          : undefined,
      });
      setPosts((prev) => [post, ...prev]);
      setFormState(INITIAL_FORM_STATE);
      toast.success(t("publish.createSuccess"));
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error(t("publish.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetry(id: string) {
    const previous = posts;
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "SCHEDULED" } : p)),
    );
    try {
      const updated = await retryPost(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(t("publish.retrySuccess"));
    } catch (err) {
      console.error("Failed to retry post:", err);
      setPosts(previous);
      toast.error(t("publish.retryError"));
    }
  }

  return (
    <PageWrapper title={t("publish.title")} description={t("publish.description")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComposerForm
          state={formState}
          onChange={setFormState}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <PublishPreview
          title={formState.title}
          caption={formState.caption}
          mediaUrls={formState.mediaUrlsInput
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean)}
          platformTargets={formState.platformTargets}
        />
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="text-foreground text-lg font-semibold">
          {t("publish.table.heading")}
        </h2>

        {isLoading && <Skeleton className="h-48 rounded-xl" />}

        {isError && !isLoading && <PublishErrorBanner />}

        {!isLoading && !isError && (
          <PublishStatusTable posts={posts} onRetry={handleRetry} />
        )}
      </div>
    </PageWrapper>
  );
}

export default PublishPage;
