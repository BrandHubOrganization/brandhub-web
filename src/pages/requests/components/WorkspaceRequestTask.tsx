import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { workspaceRequestService } from "@/pages/requests/services/workspaceRequestService";
import { requestError } from "@/pages/requests/requestErrors";

export function WorkspaceRequestTask({ workspaceId, requestId }: { workspaceId: string; requestId: string }) {
  const { t } = useTranslation();
  const query = useQuery({ queryKey: ["workspace-requests", workspaceId, "task", requestId],
    queryFn: () => workspaceRequestService.task(workspaceId, requestId), retry: false });
  return <section className="space-y-3 rounded-xl border p-3 text-sm" aria-label={t("requests.v2.generatedTask")}>
    <h3 className="font-semibold">{t("requests.v2.generatedTask")}</h3>
    {query.isPending && <Spinner />}
    {query.isError && <div role="alert"><p>{requestError(query.error, t)}</p>
      <Button variant="outline" onClick={() => void query.refetch()}>{t("requests.v2.retry")}</Button></div>}
    {query.data && <>
      <p className="break-words">{query.data.name}</p>
      <Badge variant="outline">{t(`requests.v2.taskStatus.${query.data.status}`)}</Badge>
      <p className="text-muted-foreground break-all">{query.data.id}</p>
      <Button asChild variant="outline"><Link to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(query.data.id)}`}>
        {t("tasks.workflow.openDetail")}</Link></Button>
      {query.data.canOpenEditor && <Button asChild variant="outline"><Link
        to={`/workspaces/${workspaceId}/content-writing?taskId=${encodeURIComponent(query.data.id)}`}>
        {t("requests.v2.review.openEditor")}</Link></Button>}
    </>}
  </section>;
}
