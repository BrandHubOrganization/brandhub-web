import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAmbassador,
  deleteAmbassador,
  generateVideo,
  getAmbassadors,
} from "@/services/mock/mockAmbassadorService";
import type { Ambassador, InstantIdSettings } from "./types/ambassador";
import { AmbassadorGrid } from "./components/AmbassadorGrid";
import { CreateAmbassadorDialog } from "./components/CreateAmbassadorDialog";
import { GenerateVideoDialog } from "./components/GenerateVideoDialog";
import { AiStudioErrorBanner } from "./components/AiStudioErrorBanner";

export function AmbassadorsPage() {
  const { t } = useTranslation();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [videoTarget, setVideoTarget] = useState<Ambassador | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getAmbassadors();
        if (!cancelled) setAmbassadors(data);
      } catch (err) {
        console.error("Failed to load ambassadors:", err);
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

  async function handleCreate(
    name: string,
    faceImageUrl: string,
    instantIdSettings: InstantIdSettings,
  ) {
    try {
      const created = await createAmbassador(name, faceImageUrl, instantIdSettings);
      setAmbassadors((prev) => [...prev, created]);
      setIsCreateOpen(false);
      toast.success(t("aiStudio.ambassadors.createSuccess"));
    } catch (err) {
      console.error("Failed to create ambassador:", err);
      toast.error(t("aiStudio.ambassadors.createError"));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("aiStudio.ambassadors.deleteConfirm"))) return;
    try {
      await deleteAmbassador(id);
      setAmbassadors((prev) => prev.filter((a) => a.id !== id));
      toast.success(t("aiStudio.ambassadors.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete ambassador:", err);
      toast.error(t("aiStudio.ambassadors.deleteError"));
    }
  }

  async function handleGenerateVideo(ambassador: Ambassador, prompt: string) {
    setVideoTarget(null);
    try {
      await generateVideo(ambassador.id, prompt);
      setAmbassadors((prev) =>
        prev.map((a) =>
          a.id === ambassador.id
            ? { ...a, videosGenerated: a.videosGenerated + 1 }
            : a,
        ),
      );
      toast.success(t("aiStudio.ambassadors.generateQueued"));
    } catch (err) {
      console.error("Failed to generate video:", err);
      toast.error(t("aiStudio.ambassadors.generateError"));
    }
  }

  return (
    <PageWrapper
      title={t("aiStudio.ambassadors.title")}
      description={t("aiStudio.ambassadors.description")}
      actions={
        <Button
          variant="orange"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("aiStudio.ambassadors.create")}
        </Button>
      }
    >
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <AiStudioErrorBanner
          messageKey="aiStudio.ambassadors.loadError"
          retryKey="aiStudio.ambassadors.retry"
        />
      )}

      {!isLoading && !isError && (
        <AmbassadorGrid
          ambassadors={ambassadors}
          onGenerateVideo={setVideoTarget}
          onDelete={handleDelete}
        />
      )}

      <CreateAmbassadorDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <GenerateVideoDialog
        ambassador={videoTarget}
        onClose={() => setVideoTarget(null)}
        onSubmit={handleGenerateVideo}
      />
    </PageWrapper>
  );
}

export default AmbassadorsPage;
