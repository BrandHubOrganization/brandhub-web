import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { VideoSpaceWorkspace } from "@/pages/video-space/components/VideoSpaceWorkspace";

export default function VideoSpacePage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const [attempt, setAttempt] = useState(0);
  const sourceJobId = params.get("jobId") || undefined;
  const sourceProductionId = params.get("productionId") || undefined;
  const validWorkspace =
    !!workspaceId &&
    /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(workspaceId);
  const validSource =
    (sourceJobId === undefined || /^[a-z0-9_-]{1,128}$/i.test(sourceJobId)) &&
    (sourceProductionId === undefined ||
      /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(
        sourceProductionId,
      )) &&
    !(sourceJobId && sourceProductionId);

  if (!validWorkspace || !userId || !validSource) {
    return (
      <section
        role="alert"
        className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <p className="text-muted-foreground text-sm">
          {t(
            validSource
              ? "videoSpace.noWorkspace"
              : "videoSpace.sourceUnavailable",
          )}
        </p>
        <Button asChild variant="outline">
          <Link
            to={
              validWorkspace
                ? `/workspaces/${workspaceId}/ai-studio/video`
                : "/ai-studio/video"
            }
          >
            <ArrowLeft className="size-4" />
            {t("videoSpace.backToVideo")}
          </Link>
        </Button>
      </section>
    );
  }
  return (
    <VideoSpaceWorkspace
      key={`${userId}:${workspaceId}:${sourceJobId ?? "library"}:${sourceProductionId ?? ""}:${attempt}`}
      userId={userId}
      workspaceId={workspaceId}
      sourceJobId={sourceJobId}
      sourceProductionId={sourceProductionId}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
}
