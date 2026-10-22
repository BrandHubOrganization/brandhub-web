import { api } from "@/services/api";
import { taskService } from "@/services/taskService";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import type { TaskListItem } from "@/types/task";
import type {
  CalendarFetchParams,
  CalendarPostEvent,
  PlatformType,
  PostStatus,
  ReschedulePostPayload,
} from "@/types/calendar";
import type { PostResponse } from "@/services/postService";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function inferPlatform(task: TaskListItem): PlatformType {
  const text = `${task.name} ${task.description || ""}`.toLowerCase();
  if (text.includes("instagram") || text.includes("insta")) return "INSTAGRAM";
  if (
    text.includes("tiktok") ||
    text.includes("tik tok") ||
    task.type === "LIVESTREAM"
  )
    return "TIKTOK";
  if (text.includes("thread")) return "THREADS";
  return "FACEBOOK";
}

function normalizePostStatus(
  postStatus?: string | null,
  taskStatus?: string | null,
): PostStatus {
  const ps = String(postStatus || "").toUpperCase();
  const ts = String(taskStatus || "").toUpperCase();

  if (
    ps === "PUBLISHED" ||
    ps === "COMPLETED" ||
    ts === "FINISHED" ||
    ts === "COMPLETED"
  ) {
    return "PUBLISHED";
  }
  if (ps === "FAILED" || ps === "CANCELLED" || ts === "CANCELLED") {
    return "FAILED";
  }
  if (
    ps === "SCHEDULED" ||
    ps === "IN_PROGRESS" ||
    ps === "PUBLISHING" ||
    ps === "APPROVED" ||
    ps === "PENDING_APPROVAL" ||
    ts === "IN_REVIEW" ||
    ts === "IN_PROGRESS"
  ) {
    return "SCHEDULED";
  }
  if (ps === "DRAFT" || ts === "TODO" || ts === "BACKLOG") {
    return "DRAFT";
  }
  return "SCHEDULED";
}

export const calendarService = {
  async getCalendarPosts(
    workspaceId: string,
    params?: CalendarFetchParams,
  ): Promise<CalendarPostEvent[]> {
    if (!workspaceId) return [];

    const [tasksRes, postsRes] = await Promise.allSettled([
      taskService.getWorkspaceTasks(workspaceId, { size: 100 }),
      api.get<ApiResponse<PostResponse[]>>(
        `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/posts`,
      ),
    ]);

    const tasks: TaskListItem[] =
      tasksRes.status === "fulfilled" ? tasksRes.value.content : [];
    const posts: PostResponse[] =
      postsRes.status === "fulfilled" ? postsRes.value.data?.data || [] : [];

    // 1. Map Tasks from DB (ưu tiên theo publishDate trước, sau đó mới tới dueDate / createdAt)
    const taskEvents: CalendarPostEvent[] = tasks
      .filter((t) => t.publishDate || t.dueDate || t.createdAt)
      .map((t) => {
        const platform = inferPlatform(t);
        const status = normalizePostStatus(undefined, t.status);
        const dateStr = (t.publishDate || t.dueDate || t.createdAt) as string;

        return {
          id: t.id,
          title: t.name,
          start: new Date(dateStr).toISOString(),
          extendedProps: {
            platform,
            status,
            captionPreview: t.description || t.name,
            taskId: t.id,
          },
        };
      });

    // 2. Enrich Tasks with matching Posts (bài viết độc lập không thuộc task sẽ bị loại bỏ)
    const taskIdsInTasks = new Set(
      taskEvents.map((e) => e.extendedProps.taskId).filter(Boolean),
    );

    posts.forEach((post) => {
      const rawPlatform = post.targetPlatforms?.[0] || "FACEBOOK";
      const platform =
        (rawPlatform.toUpperCase() as PlatformType) || "FACEBOOK";
      const caption = post.caption?.trim() || "";

      if (post.taskId && taskIdsInTasks.has(post.taskId)) {
        const existing = taskEvents.find(
          (e) => e.extendedProps.taskId === post.taskId,
        );
        if (existing) {
          const matchingTask = tasks.find((t) => t.id === post.taskId);
          const status = normalizePostStatus(post.status, matchingTask?.status);
          if (post.scheduledAt) {
            existing.start = new Date(post.scheduledAt).toISOString();
          }
          existing.extendedProps.platform = platform;
          existing.extendedProps.status = status;
          if (caption) existing.extendedProps.captionPreview = caption;
          existing.extendedProps.mediaUrl = post.media?.[0]?.url;
        }
      }
    });

    const allEvents = taskEvents;

    // 3. Filter by platform and status
    return allEvents.filter((ev) => {
      if (
        params?.platforms &&
        params.platforms.length > 0 &&
        !params.platforms.includes(ev.extendedProps.platform)
      ) {
        return false;
      }
      if (
        params?.statuses &&
        params.statuses.length > 0 &&
        !params.statuses.includes(ev.extendedProps.status)
      ) {
        return false;
      }
      return true;
    });
  },

  async reschedulePost(
    workspaceId: string,
    payload: ReschedulePostPayload,
  ): Promise<{ id: string; scheduledAt: string }> {
    // 1. Try to reschedule as a post if post endpoint succeeds
    try {
      const response = await api.patch<ApiResponse<PostResponse>>(
        `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/posts/${encodeURIComponent(payload.postId)}/reschedule`,
        {
          newScheduledAt: payload.newScheduledAt,
        },
      );
      const post = response.data?.data;
      if (post?.id) {
        return {
          id: post.id,
          scheduledAt: post.scheduledAt || payload.newScheduledAt,
        };
      }
    } catch {
      // If post doesn't exist by this ID, fall back to updating task
    }

    // 2. Fallback to updating task publishDate / dueDate
    const wf = await taskWorkflowService.read(workspaceId, payload.postId);
    try {
      await taskWorkflowService.field(workspaceId, payload.postId, {
        field: "publishDate",
        value: payload.newScheduledAt,
        expectedRevision: wf.workflowRevision ?? 0,
      });
    } catch {
      await taskWorkflowService.field(workspaceId, payload.postId, {
        field: "dueDate",
        value: payload.newScheduledAt,
        expectedRevision: wf.workflowRevision ?? 0,
      });
    }
    return {
      id: payload.postId,
      scheduledAt: payload.newScheduledAt,
    };
  },
};
