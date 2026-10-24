import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw } from "lucide-react";

import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceRequests } from "@/pages/requests/hooks/useWorkspaceRequests";
import { WorkspaceRequestFilterBar } from "@/pages/requests/components/WorkspaceRequestFilterBar";
import { WorkspaceRequestList } from "@/pages/requests/components/WorkspaceRequestList";
import { WorkspaceRequestDetail } from "@/pages/requests/components/WorkspaceRequestDetail";
import { WorkspaceRequestForm } from "@/pages/requests/components/WorkspaceRequestForm";
import { WorkspaceRequestCancel } from "@/pages/requests/components/WorkspaceRequestCancel";
import { WorkspaceRequestReview } from "@/pages/requests/components/WorkspaceRequestReview";
import { requestError } from "@/pages/requests/requestErrors";
import type { RequestPage } from "@/pages/requests/types/workspaceRequest";

function WorkspaceRequestView({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const state = useWorkspaceRequests(workspaceId);
  const result = state.list.data;

  // Xử lý lọc client-side cho type và sort
  const processedResult: RequestPage | undefined = useMemo(() => {
    if (!result) return undefined;
    let items = [...result.items];
    if (state.type) {
      items = items.filter((r) => r.type === state.type);
    }
    if (state.sort === "oldest") {
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (state.sort === "due_asc") {
      items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else if (state.sort === "due_desc") {
      items.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }
    return {
      ...result,
      items,
      total: state.type ? items.length : result.total,
    };
  }, [result, state.type, state.sort]);

  return (
    <PageWrapper
      title={t("requests.v2.title")}
      description={t("requests.v2.description")}
      guideLabel={t("requests.v2.guide")}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={state.list.isFetching}
            onClick={() => void state.refresh()}
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t("requests.v2.refresh")}
          </Button>
          {result?.workspaceRole === "CLIENT" && (
            <Button
              variant="orange"
              disabled={!result.canCreate}
              onClick={() => state.setEditing("new")}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("requests.v2.create")}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {result?.workspaceRole === "CLIENT" && !result.canCreate && (
          <p className="bg-muted text-muted-foreground rounded-xl p-4 text-sm">
            {t("requests.v2.campaignGate")}
          </p>
        )}

        <WorkspaceRequestFilterBar
          search={state.search}
          status={state.status}
          type={state.type}
          sort={state.sort}
          onSearchChange={(val) => state.changeParam("q", val)}
          onStatusChange={(val) => state.changeParam("status", val)}
          onTypeChange={(val) => state.changeParam("type", val)}
          onSortChange={(val) => state.changeParam("sort", val)}
          onResetFilters={state.resetFilters}
        />

        {state.list.isPending && (
          <div role="status" className="flex items-center gap-2">
            <Spinner />
            {t("requests.v2.loading")}
          </div>
        )}

        {state.list.isError && (
          <div role="alert" className="bg-card rounded-xl border p-4">
            <p>{requestError(state.list.error, t)}</p>
            <Button variant="outline" onClick={() => void state.refresh()}>
              {t("requests.v2.retry")}
            </Button>
          </div>
        )}

        {processedResult && !state.list.isError && (
          <WorkspaceRequestList
            result={processedResult}
            hasActiveFilters={Boolean(
              state.search || state.status || state.type || (state.sort && state.sort !== "newest"),
            )}
            onSelect={(id) => state.changeParam("request", id)}
            onPage={(page) => state.changeParam("page", String(page))}
            onResetFilters={state.resetFilters}
            onReview={(request, action) => state.setReviewing({ request, action })}
            onEdit={state.setEditing}
          />
        )}
      </div>

      <WorkspaceRequestDetail
        isOpen={Boolean(state.selectedId && !state.editing && !state.cancelling && !state.reviewing)}
        request={state.detail.data}
        loading={state.detail.isPending}
        error={state.detail.isError ? requestError(state.detail.error, t) : ""}
        onClose={() => state.changeParam("request", "")}
        onRetry={() => void state.detail.refetch()}
        onEdit={state.setEditing}
        onCancel={state.setCancelling}
        onReview={(request, action) => state.setReviewing({ request, action })}
      />

      {state.editing && (
        <WorkspaceRequestForm
          key={state.editing === "new" ? "new" : state.editing.id}
          workspaceId={workspaceId}
          request={state.editing}
          onClose={() => state.setEditing(null)}
          onSave={state.save}
          onConflict={state.refresh}
        />
      )}

      {state.cancelling && (
        <WorkspaceRequestCancel
          title={state.cancelling.title}
          onClose={() => state.setCancelling(null)}
          onConfirm={state.cancel}
          onConflict={state.refresh}
        />
      )}

      {state.reviewing && (
        <WorkspaceRequestReview
          action={state.reviewing.action}
          title={state.reviewing.request.title}
          onClose={() => state.setReviewing(null)}
          onConfirm={state.review}
          onConflict={state.refresh}
        />
      )}
    </PageWrapper>
  );
}

export function WorkspaceRequestPage() {
  const [queryClient] = useState(() => new QueryClient());
  const { id } = useParams();
  const { t } = useTranslation();
  if (!id) return <p role="alert">{t("requests.v2.errors.generic")}</p>;
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceRequestView key={id} workspaceId={id} />
    </QueryClientProvider>
  );
}
export default WorkspaceRequestPage;
