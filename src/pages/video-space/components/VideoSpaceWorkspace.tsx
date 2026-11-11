import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clapperboard,
  Loader2,
  Monitor,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDocumentTheme } from "@/pages/video-space/hooks/useDocumentTheme";
import { useVideoSpaceBridge } from "@/pages/video-space/hooks/useVideoSpaceBridge";
import {
  VIDEO_SPACE_PROTOCOL_VERSION,
  type VideoSpaceContext,
} from "@video-space/protocol";

interface Props {
  userId: string;
  workspaceId: string;
  sourceJobId?: string;
  sourceProductionId?: string;
  onRetry: () => void;
}

export function VideoSpaceWorkspace({
  userId,
  workspaceId,
  sourceJobId,
  sourceProductionId,
  onRetry,
}: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useDocumentTheme();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [leaving, setLeaving] = useState(false);
  const locale = i18n.language.startsWith("en") ? "en" : "vi";
  const context = useMemo<VideoSpaceContext>(
    () => ({
      type: "brandhub-video-space:context",
      version: VIDEO_SPACE_PROTOCOL_VERSION,
      sessionId,
      workspaceId,
      userId,
      locale,
      theme,
      sourceJobId,
      sourceProductionId,
    }),
    [
      sessionId,
      workspaceId,
      userId,
      locale,
      theme,
      sourceJobId,
      sourceProductionId,
    ],
  );
  const { iframeRef, ready, error, flushDraft } = useVideoSpaceBridge(context);

  const leave = async () => {
    setLeaving(true);
    try {
      await flushDraft();
      navigate(
        sourceProductionId
          ? `/workspaces/${workspaceId}/product-video?productionId=${encodeURIComponent(sourceProductionId)}`
          : `/workspaces/${workspaceId}/ai-studio/video`,
      );
    } catch {
      toast.error(t("videoSpace.draftSaveFailed"));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <section
      className="bg-background flex h-full min-h-0 flex-col"
      aria-label={t("videoSpace.title")}
    >
      <header className="border-border bg-card flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-brand-orange-soft text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Clapperboard className="size-4" />
          </div>
          <div>
            <h1 className="text-foreground text-sm font-semibold">
              {t("videoSpace.title")}
            </h1>
            <p className="text-muted-foreground hidden text-xs sm:block">
              {t("videoSpace.description")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={leaving}
          onClick={() => void leave()}
        >
          {leaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowLeft className="size-4" />
          )}
          {t(
            sourceProductionId
              ? "productVideo.backToResult"
              : "videoSpace.backToVideo",
          )}
        </Button>
      </header>
      <div className="relative min-h-0 flex-1">
        <iframe
          ref={iframeRef}
          src="/video-space/index.html"
          title={t("videoSpace.frameTitle")}
          className="size-full border-0"
          allow="clipboard-read; clipboard-write; autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals"
        />
        {!ready && !error && (
          <div
            role="status"
            className="bg-background absolute inset-0 flex items-center justify-center gap-2 text-sm"
          >
            <Loader2 className="text-brand-orange size-4 animate-spin" />
            {t("videoSpace.loading")}
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="bg-background absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
          >
            <p className="text-muted-foreground max-w-md text-sm">{error}</p>
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="size-4" />
              {t("videoSpace.retry")}
            </Button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground border-border flex items-center gap-2 border-t px-4 py-2 text-xs lg:hidden">
        <Monitor className="size-4 shrink-0" />
        {t("videoSpace.unsupportedBrowser")}
      </p>
    </section>
  );
}
