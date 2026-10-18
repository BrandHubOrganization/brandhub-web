import { useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import { taskApprovalService as service } from "@/pages/tasks/services/taskApprovalService";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import { reviewExpected } from "@/pages/tasks/taskApprovalView";
import type {
  ReviewAction,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function useTaskApproval(task: TaskWorkflow) {
  const { workspaceId, id: taskId } = task;
  const isPost = task.type === "POST";
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const { session, onUpdated } = useTaskEditContext();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const key = [
    "task-review",
    userId,
    workspaceId,
    taskId,
    task.workflowRevision,
  ];
  const historyKey = ["task-approvals", userId, workspaceId, taskId];
  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<TaskReviewView> => {
      const [review, post] = await Promise.allSettled([
        service.read(workspaceId, taskId),
        isPost
          ? taskPostService.read(workspaceId, taskId)
          : Promise.resolve(null),
      ]);
      if (review.status === "rejected") throw review.reason;
      return {
        review: review.value,
        linked: post.status === "fulfilled" ? post.value : null,
        postError: post.status === "rejected" ? post.reason : null,
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const history = useInfiniteQuery({
    queryKey: historyKey,
    queryFn: ({ pageParam }) => service.history(workspaceId, taskId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last, pages) =>
      last.nextCursor &&
      !pages.slice(0, -1).some((page) => page.nextCursor === last.nextCursor)
        ? last.nextCursor
        : undefined,
    retry: false,
    refetchOnWindowFocus: false,
  });
  async function act(
    view: TaskReviewView,
    action: ReviewAction,
    comment: string,
  ) {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    const identity = `${workspaceId}:${taskId}:review`;
    try {
      session.retry(identity);
      await session.run(identity, () =>
        service.act(workspaceId, taskId, {
          action,
          expected: reviewExpected(view, action, comment),
        }),
      );
      // An unread/new Post version must never inherit action rights from the previous preview.
      await client.invalidateQueries({ queryKey: key });
      await Promise.all([
        client.invalidateQueries({ queryKey: historyKey }),
        client.invalidateQueries({
          queryKey: ["task-workflow", workspaceId, taskId],
        }),
      ]);
      onUpdated();
      return true;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return { query, history, busy, act };
}
