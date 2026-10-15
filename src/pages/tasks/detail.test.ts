import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskDetailPage from "@/pages/tasks/detail";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";
import { TaskDetailPanel } from "@/pages/tasks/components/TaskDetailPanel";

const route = vi.hoisted(() => ({ id: "workspace-a", taskId: "task-a" }));
vi.mock("react-router-dom", () => ({
  useParams: () => route,
  Navigate: ({ to, replace }: { to: string; replace: boolean }) =>
    createElement("a", { href: to, "data-replace": String(replace) }),
  Link: ({ children, to }: { children: ReactNode; to: string }) =>
    createElement("a", { href: to }, children),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/components/layout/PageWrapper", () => ({
  default: ({ children }: { children: ReactNode }) =>
    createElement("main", null, children),
}));
vi.mock("@/pages/tasks/services/taskWorkflowService", () => ({
  taskWorkflowService: { read: vi.fn() },
}));

describe("Task Detail panel provider and legacy route", () => {
  beforeEach(() => {
    route.id = "workspace-a";
    route.taskId = "task-a";
  });

  it("renders the real workflow hook without an external QueryClientProvider", () => {
    const markup = renderToStaticMarkup(
      createElement(TaskWorkflowContent, {
        workspaceId: route.id,
        taskId: route.taskId,
      }),
    );
    expect(markup).toContain('role="status"');
    expect(markup).toContain("tasks.loading");
  });

  it("also provides context when opening another Workspace or Task directly", () => {
    route.id = "workspace-b";
    route.taskId = "task-b";
    expect(() =>
      renderToStaticMarkup(
        createElement(TaskWorkflowContent, {
          workspaceId: route.id,
          taskId: route.taskId,
        }),
      ),
    ).not.toThrow();
  });

  it("renders desktop details as a non-modal complementary panel", () => {
    const markup = renderToStaticMarkup(
      createElement(TaskDetailPanel, {
        workspaceId: route.id,
        taskId: route.taskId,
        isDesktop: true,
        onClose: vi.fn(),
        onUpdated: vi.fn(),
        onRestoreFocus: vi.fn(),
      }),
    );
    expect(markup).toContain("<aside");
    expect(markup).toContain('aria-labelledby="task-detail-heading"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain("tasks.loading");
  });

  it("redirects old detail links to the list with a selected Task", () => {
    const markup = renderToStaticMarkup(createElement(TaskDetailPage));
    expect(markup).toContain(
      'href="/workspaces/workspace-a/tasks?task=task-a"',
    );
    expect(markup).toContain('data-replace="true"');
  });
});
