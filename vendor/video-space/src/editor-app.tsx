import { useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VideoProjectLibrary } from "@/brandhub/library";
import Editor from "@/app/editor/[project_id]/page";
import { EditorCore } from "@/core";
import { createProjectFromFile } from "@/brandhub/import-file";
import { createProjectFromProduction } from "@/brandhub/import-production";
import { toast } from "sonner";
import {
  getHostContext,
  hostFetch,
  setFlushHandler,
  subscribeHostContext,
} from "@/platform/host";
import { scopeStorageName } from "@/platform/storage-scope";
import { applyHostAppearance } from "@/platform/host-appearance";
import "@/app/globals.css";

let pendingSourceImport: Promise<void> | undefined;

setFlushHandler(async () => {
  await pendingSourceImport;
  const editor = EditorCore.getInstance();
  editor.playback.pause();
  if (editor.project.getActiveOrNull()) await editor.save.flush();
});

function HostAppearance() {
  const { theme } = useSyncExternalStore(subscribeHostContext, getHostContext);
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(theme);
    applyHostAppearance(
      window.parent.getComputedStyle(window.parent.document.documentElement),
      document.documentElement.style,
    );
  }, [theme, setTheme]);
  return null;
}

function SourceImport() {
  const navigate = useNavigate();
  const context = useSyncExternalStore(subscribeHostContext, getHostContext);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    pendingSourceImport = (async () => {
      try {
        if (context.sourceProductionId) {
          const imported = await createProjectFromProduction();
          if (!cancelled) {
            if (!imported.cloudSaved)
              toast.warning(
                context.locale === "en"
                  ? "Saved locally; cloud save is pending"
                  : "Đã lưu trên máy; chưa lưu lên máy chủ",
              );
            navigate(`/editor/${imported.projectId}`, { replace: true });
          }
          return;
        }
        const response = await hostFetch(
          `/api/v1/workspaces/${context.workspaceId}/ai/videos/${context.sourceJobId}/content`,
          { responseType: "blob", signal: abort.signal },
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            body?.message ||
              (context.locale === "en"
                ? "Could not open this completed video."
                : "Chưa mở được video đã hoàn tất."),
          );
        }
        const blob = await response.blob();
        if (cancelled) return;
        const projectId = await createProjectFromFile({
          file: new File([blob], `AI video ${context.sourceJobId}.mp4`, {
            type: blob.type || "video/mp4",
          }),
        });
        if (!cancelled) navigate(`/editor/${projectId}`, { replace: true });
      } catch (reason) {
        if (!cancelled)
          setError(
            context.sourceProductionId
              ? context.locale === "en"
                ? "Could not open this production. Your saved project and source clips are retained."
                : "Chưa mở được bản dựng. Bản đã lưu và các clip nguồn vẫn được giữ nguyên."
              : reason instanceof Error
                ? reason.message
                : "Could not import this video",
          );
      }
    })();
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [
    context.workspaceId,
    context.sourceJobId,
    context.sourceProductionId,
    navigate,
  ]);
  return (
    <div className="bg-background text-foreground flex h-screen items-center justify-center p-6">
      <div
        className="max-w-md space-y-4 text-center"
        role={error ? "alert" : "status"}
      >
        <p>
          {error ||
            (context.locale === "en"
              ? "Opening the completed video…"
              : "Đang mở video đã hoàn tất…")}
        </p>
        {error && (
          <button
            type="button"
            className="underline"
            onClick={() => navigate("/projects", { replace: true })}
          >
            {context.locale === "en"
              ? "Open project library"
              : "Mở thư viện bản dựng"}
          </button>
        )}
      </div>
    </div>
  );
}

const context = getHostContext();
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    storageKey={scopeStorageName("theme")}
    defaultTheme={context.theme}
    enableSystem={false}
    disableTransitionOnChange
  >
    <HostAppearance />
    <TooltipProvider>
      <Toaster />
      <MemoryRouter
        initialEntries={[
          context.sourceJobId || context.sourceProductionId
            ? "/source"
            : "/projects",
        ]}
      >
        <Routes>
          <Route path="/projects" element={<VideoProjectLibrary />} />
          <Route path="/editor/:project_id" element={<Editor />} />
          <Route path="/source" element={<SourceImport />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  </ThemeProvider>,
);
