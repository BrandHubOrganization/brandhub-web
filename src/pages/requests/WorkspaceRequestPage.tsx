import { useParams } from "react-router-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceRequests } from "@/pages/requests/hooks/useWorkspaceRequests";
import { WorkspaceRequestForm } from "@/pages/requests/components/WorkspaceRequestForm";
import { WorkspaceRequestList } from "@/pages/requests/components/WorkspaceRequestList";
import { WorkspaceRequestDetail } from "@/pages/requests/components/WorkspaceRequestDetail";
import { WorkspaceRequestCancel } from "@/pages/requests/components/WorkspaceRequestCancel";
import { WorkspaceRequestReview } from "@/pages/requests/components/WorkspaceRequestReview";
import { REQUEST_STATUSES } from "@/pages/requests/types/workspaceRequest";
import { requestError } from "@/pages/requests/requestErrors";

function WorkspaceRequestView({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const state = useWorkspaceRequests(workspaceId);
  const result = state.list.data;
  return <PageWrapper title={t("requests.v2.title")} description={t("requests.v2.description")}
    guideLabel={t("requests.v2.guide")}
    actions={<div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={state.list.isFetching} onClick={() => void state.refresh()}>
        <RefreshCw aria-hidden="true" className="size-4" />{t("requests.v2.refresh")}</Button>
      {result?.workspaceRole === "CLIENT" && <Button variant="orange" disabled={!result.canCreate}
        onClick={() => state.setEditing("new")}><Plus aria-hidden="true" className="size-4" />{t("requests.v2.create")}</Button>}
    </div>}>
    <div className="space-y-5">
      {result?.workspaceRole === "CLIENT" && !result.canCreate && <p className="bg-muted text-muted-foreground rounded-xl p-4 text-sm">
        {t("requests.v2.campaignGate")}</p>}
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_220px]">
        <Input label={t("requests.v2.search")} maxLength={100} value={state.search}
          onChange={event => state.changeParam("q", event.target.value)} />
        <div className="space-y-1.5"><Label htmlFor="request-status-filter">{t("requests.v2.filterStatus")}</Label>
          <Select id="request-status-filter" value={state.status} onChange={event => state.changeParam("status", event.target.value)}>
            <option value="">{t("requests.v2.allStatuses")}</option>
            {REQUEST_STATUSES.map(status => <option key={status} value={status}>{t(`requests.v2.status.${status}`)}</option>)}
          </Select></div>
      </div>
      {state.list.isPending && <div role="status" className="flex items-center gap-2"><Spinner />{t("requests.v2.loading")}</div>}
      {state.list.isError && <div role="alert" className="bg-card rounded-xl border p-4">
        <p>{requestError(state.list.error, t)}</p><Button variant="outline" onClick={() => void state.refresh()}>{t("requests.v2.retry")}</Button>
      </div>}
      {result && !state.list.isError && <WorkspaceRequestList result={result}
        onSelect={id => state.changeParam("request", id)} onPage={page => state.changeParam("page", String(page))} />}
    </div>
    {state.selectedId && !state.editing && !state.cancelling && !state.reviewing && <WorkspaceRequestDetail
      request={state.detail.data} loading={state.detail.isPending}
      error={state.detail.isError ? requestError(state.detail.error, t) : ""}
      onClose={() => state.changeParam("request", "")} onRetry={() => void state.detail.refetch()}
      onEdit={state.setEditing} onCancel={state.setCancelling}
      onReview={(request, action) => state.setReviewing({ request, action })} />}
    {state.editing && <WorkspaceRequestForm key={state.editing === "new" ? "new" : state.editing.id}
      workspaceId={workspaceId} request={state.editing} onClose={() => state.setEditing(null)} onSave={state.save} onConflict={state.refresh} />}
    {state.cancelling && <WorkspaceRequestCancel title={state.cancelling.title}
      onClose={() => state.setCancelling(null)} onConfirm={state.cancel} onConflict={state.refresh} />}
    {state.reviewing && <WorkspaceRequestReview action={state.reviewing.action} title={state.reviewing.request.title}
      onClose={() => state.setReviewing(null)} onConfirm={state.review} onConflict={state.refresh} />}
  </PageWrapper>;
}

export function WorkspaceRequestPage() {
  const [queryClient] = useState(() => new QueryClient());
  const { id } = useParams();
  const { t } = useTranslation();
  if (!id) return <p role="alert">{t("requests.v2.errors.generic")}</p>;
  return <QueryClientProvider client={queryClient}>
    <WorkspaceRequestView key={id} workspaceId={id} />
  </QueryClientProvider>;
}
