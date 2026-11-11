import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { materialService } from "@/services/materialService";
import { BackgroundTaskDock } from "@/components/common/BackgroundTaskDock";
import { CustomerDrivePanel } from "@/pages/library/components/CustomerDrivePanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) =>
      typeof fallback === "string" ? fallback : key,
    i18n: { language: "vi", changeLanguage: vi.fn() },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Google Drive Import Progress & Mid-Import Cancel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useBackgroundTaskStore.getInitialState().tasks = [];
    useBackgroundTaskStore.setState({ tasks: [], isDockMinimized: false });
  });

  it("tracks live Drive import progress in backgroundTaskStore and cancels via backend API", async () => {
    const statusSpy = vi
      .spyOn(materialService, "driveImportStatus")
      .mockResolvedValue({
        jobId: "job-123",
        status: "RUNNING",
        totalFiles: 10,
        importedFolders: 2,
        importedFiles: 4,
        skippedFiles: 1,
        totalBytesImported: 512000,
        folderName: "Summer Campaign",
        currentFileName: "banner-04.jpg",
      });

    const cancelSpy = vi
      .spyOn(materialService, "cancelDriveImport")
      .mockResolvedValue({
        jobId: "job-123",
        status: "CANCELLED",
        totalFiles: 10,
        importedFolders: 2,
        importedFiles: 4,
        skippedFiles: 1,
        totalBytesImported: 512000,
        errorMessage: "DRIVE_IMPORT_CANCELLED",
      });

    const store = useBackgroundTaskStore.getState();
    const taskId = store.startDriveImportTask({
      workspaceId: "ws-1",
      jobId: "job-123",
      pollIntervalMs: 30,
    });

    await new Promise((r) => setTimeout(r, 80));
    expect(statusSpy).toHaveBeenCalledWith("ws-1", "job-123");

    const running = useBackgroundTaskStore
      .getState()
      .tasks.find((t) => t.id === taskId);
    expect(running).toBeDefined();
    expect(running?.type).toBe("DRIVE_IMPORT");
    expect(running?.status).toBe("RUNNING");
    expect(running?.progress).toBe(50);
    expect(running?.title).toContain("Summer Campaign");
    expect(running?.subtitle).toContain("banner-04.jpg");
    expect(running?.completedItems).toBe(5);
    expect(running?.totalItems).toBe(10);

    await useBackgroundTaskStore.getState().cancelTask(taskId);
    expect(cancelSpy).toHaveBeenCalledWith("ws-1", "job-123");

    const cancelled = useBackgroundTaskStore
      .getState()
      .tasks.find((t) => t.id === taskId);
    expect(cancelled?.status).toBe("CANCELLED");
  });

  it("renders Canva/Google-Drive style inline progress card with cancel button and zero raw <details> markup", () => {
    const seededTasks = [
      {
        id: "drive-job-99",
        type: "DRIVE_IMPORT" as const,
        jobId: "job-99",
        title: 'Nhập "FPT Shop Assets" từ Drive',
        subtitle: "Đang xử lý: hero.png • 3/8 tệp • 2 thư mục",
        workspaceId: "ws-demo",
        status: "RUNNING" as const,
        progress: 38,
        totalItems: 8,
        completedItems: 3,
        importedFolders: 2,
        skippedItems: 0,
        currentFileName: "hero.png",
        createdAt: Date.now(),
        items: [],
      },
    ];
    useBackgroundTaskStore.setState({
      isDockMinimized: false,
      tasks: seededTasks,
    });
    // React 19 renderToString uses getServerSnapshot() which reads Zustand's initialState
    useBackgroundTaskStore.getInitialState().tasks = seededTasks;

    const queryClient = new QueryClient();
    const dockHtml = renderToString(
      createElement(MemoryRouter, null, createElement(BackgroundTaskDock)),
    );
    expect(dockHtml).toContain("38%");
    expect(dockHtml).toContain("3/8 tệp");
    expect(dockHtml).toContain("Huỷ import");

    const panelHtml = renderToString(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(CustomerDrivePanel, { workspaceIdOverride: "ws-demo" }),
      ),
    );
    expect(panelHtml).not.toContain("<details");
    expect(panelHtml).toContain("38%");
    expect(panelHtml).toContain("hero.png");
    expect(panelHtml).toContain("Huỷ");
  });
});
