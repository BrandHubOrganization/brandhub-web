import { useReducer, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { ApprovalFilters } from "@/pages/task-approvals/components/ApprovalFilters";
import { cn } from "@/lib/utils";
import {
  TaskWorkflowProvider,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { ApprovalList } from "@/pages/task-approvals/components/ApprovalList";
import { ApprovalDetail } from "@/pages/task-approvals/components/ApprovalDetail";
import { useApprovalList } from "@/pages/task-approvals/hooks/useApprovalList";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";

function ApprovalWorkspace({
  workspaceId,
  revision,
}: {
  workspaceId: string;
  revision: number;
}) {
  const { t } = useTranslation();
  const { canLeave } = useTaskEditContext();
  const [params, setParams] = useSearchParams();
  const selected = params.get("task") || "";
  const [status, setStatus] = useState("IN_REVIEW");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search);
  const query = useApprovalList(workspaceId, {
    status,
    search: debouncedSearch,
    page,
    revision,
  });
  async function guard(action: () => void) {
    if (await canLeave()) action();
  }
  function select(taskId: string) {
    if (taskId === selected) return;
    void guard(() => {
      const next = new URLSearchParams(params);
      if (taskId) next.set("task", taskId);
      else next.delete("task");
      setParams(next);
    });
  }
  return (
    <PageWrapper
      compact
      showGuideButton={false}
      title={t("tasks.approvalPage.title")}
      className="flex h-full min-h-0 flex-col !space-y-3 !pb-4 [&>div:first-child]:shrink-0 [&>div:last-child]:flex [&>div:last-child]:min-h-0 [&>div:last-child]:flex-1 [&>div:last-child]:flex-col [&>div:last-child]:gap-3 [&>div:last-child]:overflow-hidden"
      actions={
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw aria-hidden className="size-4" />
          {t("tasks.review.reload")}
        </Button>
      }
    >
      <ApprovalFilters
        search={search}
        status={status}
        onSearch={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onStatus={(value) =>
          void guard(() => {
            setStatus(value);
            setPage(0);
          })
        }
      />
      <div
        className={cn(
          "grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-4",
          selected && "lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]",
        )}
      >
        <div
          className={cn(
            "min-h-0 [&>section]:h-full",
            selected && "hidden lg:block",
          )}
        >
          <ApprovalList
            query={query}
            selected={selected}
            page={page}
            onSelect={select}
            onPage={(next) => void guard(() => setPage(next))}
          />
        </div>
        {selected && (
          <ApprovalDetail
            key={`${workspaceId}:${selected}`}
            workspaceId={workspaceId}
            taskId={selected}
            onBack={() => select("")}
          />
        )}
      </div>
    </PageWrapper>
  );
}
function ApprovalPageSession({ workspaceId }: { workspaceId: string }) {
  const [revision, refresh] = useReducer((value: number) => value + 1, 0);
  return (
    <TaskWorkflowProvider onUpdated={refresh}>
      <ApprovalWorkspace workspaceId={workspaceId} revision={revision} />
    </TaskWorkflowProvider>
  );
}
export default function TaskApprovalsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const userId = useAuthStore((state) => state.user?.id);
  return <ApprovalPageSession key={`${id}:${userId}`} workspaceId={id} />;
}
