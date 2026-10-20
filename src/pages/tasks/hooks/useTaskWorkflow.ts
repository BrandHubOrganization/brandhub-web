import { useQuery, useQueryClient } from "@tanstack/react-query";
import { taskWorkflowService as service } from "@/pages/tasks/services/taskWorkflowService";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import type {
  TaskAssignmentFields,
  TaskDetailFields,
  TaskWorkflow,
} from "@/pages/tasks/types/taskWorkflow";

export function useTaskWorkflow(
  workspaceId: string,
  taskId: string,
  enabled = true,
) {
  const client = useQueryClient();
  const { session, onUpdated } = useTaskEditContext();
  const key = ["task-workflow", workspaceId, taskId];
  const identity = workspaceId + ":" + taskId;
  const query = useQuery({
    queryKey: key,
    queryFn: () => service.read(workspaceId, taskId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 30000,
    enabled: enabled && Boolean(workspaceId && taskId),
  });
  async function current() {
    const cached = client.getQueryData<TaskWorkflow>(key);
    const task =
      cached ||
      (await client.fetchQuery<TaskWorkflow>({
        queryKey: key,
        queryFn: () => service.read(workspaceId, taskId),
      }));
    if (!task || task.workflowRevision == null)
      throw new Error("MISSING_REVISION");
    return task;
  }
  async function publish(task: TaskWorkflow) {
    await client.cancelQueries({ queryKey: key });
    client.setQueryData(key, task);
    onUpdated();
    return task;
  }
  function field(field: string, value: unknown) {
    return session.run(identity, async () => {
      const task = await current();
      return publish(
        await service.field(workspaceId, taskId, {
          field,
          value,
          expectedRevision: task.workflowRevision!,
        }),
      );
    });
  }
  function assign(
    changes: Partial<Omit<TaskAssignmentFields, "expectedRevision">>,
  ) {
    return session.run(identity, async () => {
      const task = await current();
      return publish(
        await service.assign(workspaceId, taskId, {
          assigneeId: task.assigneeId || "",
          requiresClientApproval: task.requiresClientApproval,
          ...changes,
          expectedRevision: task.workflowRevision!,
        }),
      );
    });
  }
  function detail(fields: TaskDetailFields) {
    return session.run(identity, async () =>
      publish(await service.detail(workspaceId, taskId, fields)),
    );
  }
  function start() {
    return session.run(identity, async () => {
      const task = await current();
      return publish(
        await service.start(workspaceId, taskId, task.workflowRevision!),
      );
    });
  }
  function retry() {
    session.retry(identity);
  }
  async function reload() {
    const result = await query.refetch();
    if (result.isSuccess) session.retry(identity);
    return result;
  }
  return { query, detail, field, assign, start, retry, reload, session };
}
