import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, Loader2, Play, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiGenerationService } from "@/services/aiGenerationService";
import { useWorkspaceStore } from "@/store/workspaceStore";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

interface AIVideoAssistPanelProps {
  onApplyVideo: (videoUrl: string, s3Key?: string) => void;
}

export function AIVideoAssistPanel({ onApplyVideo }: AIVideoAssistPanelProps) {
  const { t } = useTranslation();
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const mountedRef = useRef(true);
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoS3Key, setVideoS3Key] = useState<string>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleGenerate = async () => {
    if (!brief.trim()) {
      toast.error(t("editor.studio.video.briefRequired"));
      return;
    }

    setIsGenerating(true);
    setVideoUrl("");
    setVideoS3Key(undefined);
    setJobStatus("PENDING");
    try {
      const job = await aiGenerationService.generateVideo({
        prompt: brief,
        clientId: workspaceId || "brandhub-web",
      });

      for (let attempt = 0; attempt < 200; attempt += 1) {
        await wait(3000);
        if (!mountedRef.current) return;
        const status = await aiGenerationService.getVideoStatus(job.job_id);
        setJobStatus(status.status);
        if (status.status === "COMPLETED" && status.video_url) {
          setVideoUrl(status.video_url);
          setVideoS3Key(status.s3_key);
          toast.success(t("editor.studio.video.generateSuccess"));
          return;
        }
        if (status.status === "FAILED") {
          throw new Error(status.error_message || "Video generation failed");
        }
      }
      throw new Error("Video generation timed out");
    } catch {
      if (mountedRef.current)
        toast.error(t("editor.studio.video.generateFailed"));
    } finally {
      if (mountedRef.current) setIsGenerating(false);
    }
  };

  return (
    <div className="border-border bg-card space-y-5 rounded-xl border p-4">
      <div className="space-y-2">
        <label
          htmlFor="studio-video-brief"
          className="text-muted-foreground text-xs font-semibold"
        >
          {t("editor.studio.video.briefLabel")}
        </label>
        <Textarea
          id="studio-video-brief"
          rows={5}
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          placeholder={t("editor.studio.video.briefPlaceholder")}
          className="border-border bg-muted text-foreground rounded-lg text-xs"
        />
      </div>

      <div className="space-y-2">
        <span className="text-muted-foreground text-xs font-semibold">
          {t("editor.studio.video.durationLabel")}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="border-brand-orange bg-brand-orange-soft text-brand-orange rounded-md border py-2 font-mono text-xs"
          >
            8s
          </button>
          {[15, 30, 60].map((seconds) => (
            <button
              key={seconds}
              type="button"
              disabled
              className="border-border bg-muted text-muted-foreground text-2xs cursor-not-allowed rounded-md border px-2 py-2 opacity-65"
            >
              {seconds}s · {t("editor.studio.video.developing")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-muted text-muted-foreground text-2xs flex items-center gap-2 rounded-lg px-3 py-2">
        <Video className="text-brand-orange size-3.5" />
        <span>{t("editor.studio.video.eightSecondNotice")}</span>
      </div>

      <Button
        data-testid="generate-video"
        variant="orange"
        className="w-full"
        disabled={isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Clapperboard className="size-4" />
        )}
        {isGenerating
          ? t("editor.studio.video.generating")
          : t("editor.studio.video.generateButton")}
      </Button>

      {isGenerating && (
        <p className="text-brand-orange text-2xs text-center font-semibold">
          {t("editor.studio.video.status", { status: jobStatus })}
        </p>
      )}

      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="border-border aspect-video w-full rounded-lg border bg-black"
          />
          <Button
            data-testid="apply-video"
            variant="outline"
            className="w-full"
            onClick={() => onApplyVideo(videoUrl, videoS3Key)}
          >
            <Play className="size-4" />
            {t("editor.studio.video.applyButton")}
          </Button>
        </div>
      )}

      <Button asChild variant="outline" className="w-full">
        <Link to="/ai-studio/video">
          {t("editor.studio.video.openFullStudio")}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
