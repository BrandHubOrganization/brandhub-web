import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { CanvasTextEditor } from "@/pages/content-writing/components/CanvasTextEditor";
import { VersionHistorySidebar } from "@/pages/content-writing/components/VersionHistorySidebar";
import { useTaskContentSync } from "@/pages/content-writing/hooks/useTaskContentSync";
import { api } from "@/services/api";
import * as Y from "yjs";

/**
 * Creator page for FR 3.6.10 Content Writing View — canvas editor +
 * real-time Yjs sync over WebSocket + version history.
 *
 * No Task list UI exists yet (FR 3.6.1 out of scope here), so this page
 * creates a minimal draft Task on first visit if the URL has no ?taskId.
 * This is dev-convenience, not the real flow — real usage will open this
 * page from an existing Task Detail once that UI exists.
 */
export function ContentWritingPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskId, setTaskId] = useState<string | null>(searchParams.get("taskId"));
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (taskId || !workspaceId) return;
    api
      .post<{ data: { id: string } }>(`/api/v1/workspaces/${workspaceId}/tasks`, {
        title: "Untitled post",
      })
      .then(({ data }) => {
        const newTaskId = data.data.id;
        setTaskId(newTaskId);
        setSearchParams((prev) => {
          prev.set("taskId", newTaskId);
          return prev;
        });
      });
  }, [taskId, workspaceId, setSearchParams]);

  const { yDoc, isReady, isConnected } = useTaskContentSync(workspaceId ?? "", taskId);

  const handleRestored = () => {
    // Restoring replaces the snapshot server-side; reloading the page is the
    // simplest way to re-sync this client's Y.Doc with the restored state.
    setReloadToken((v) => v + 1);
  };

  return (
    <PageWrapper
      title={t("editor.contentWritingPage.title")}
      description={t("editor.contentWritingPage.description")}
      compact
    >
      <div className="flex items-center gap-2 pb-2">
        <span
          className={`inline-block size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-muted-foreground/40"}`}
        />
        <span className="text-muted-foreground text-xs">
          {isConnected
            ? t("editor.contentWritingPage.connected", "Live")
            : t("editor.contentWritingPage.connecting", "Connecting…")}
        </span>
      </div>
      <div className="flex gap-4">
        {isReady ? (
          <CanvasTextEditor key={reloadToken} yDoc={yDoc as Y.Doc} />
        ) : (
          <div className="border-border bg-card flex h-48 w-full items-center justify-center rounded-xl border">
            <span className="text-muted-foreground text-xs">
              {t("editor.contentWritingPage.loading", "Loading content…")}
            </span>
          </div>
        )}
        {taskId && workspaceId && (
          <VersionHistorySidebar
            workspaceId={workspaceId}
            taskId={taskId}
            onRestored={handleRestored}
          />
        )}
      </div>
    </PageWrapper>
  );
}

export default ContentWritingPage;
