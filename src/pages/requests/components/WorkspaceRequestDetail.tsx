import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { WorkspaceRequestTask } from "@/pages/requests/components/WorkspaceRequestTask";
import type { ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

export function WorkspaceRequestDetail({ request, loading, error, onClose, onRetry, onEdit, onCancel, onReview }: {
  request?: WorkspaceRequest; loading: boolean; error: string; onClose: () => void; onRetry: () => void;
  onEdit: (request: WorkspaceRequest) => void; onCancel: (request: WorkspaceRequest) => void;
  onReview: (request: WorkspaceRequest, action: ReviewAction) => void;
}) {
  const { t, i18n } = useTranslation();
  const date = (value: string) => new Date(value).toLocaleString(i18n.language);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{request?.title ?? t("requests.v2.detail")}</DialogTitle>
        <DialogDescription>{t("requests.v2.detailHelp")}</DialogDescription></DialogHeader>
      {loading && <Spinner />}
      {error && <div role="alert"><p>{error}</p><Button onClick={onRetry}>{t("requests.v2.retry")}</Button></div>}
      {request && !error && <div className="space-y-5">
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{t(`requests.v2.status.${request.status}`)}</Badge>
          <Badge variant="outline">{t(`requests.v2.types.${request.type}`)}</Badge></div>
        <p className="whitespace-pre-wrap break-words text-sm">{request.description || t("requests.v2.noDescription")}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">{t("requests.v2.fields.dueDate")}</dt><dd>{date(request.dueDate)}</dd></div>
          <div><dt className="text-muted-foreground">{t("requests.v2.version")}</dt><dd>{request.version}</dd></div>
          <div><dt className="text-muted-foreground">{t("requests.v2.createdAt")}</dt><dd>{date(request.createdAt)}</dd></div>
          <div><dt className="text-muted-foreground">{t("requests.v2.updatedAt")}</dt><dd>{date(request.updatedAt)}</dd></div>
        </dl>
        {!request.canEdit && <p className="bg-muted text-muted-foreground rounded-xl p-3 text-sm">{t("requests.v2.locked")}</p>}
        {request.decisionNote && <div className="space-y-2 rounded-xl border p-3 text-sm">
          <h3 className="font-semibold">{t("requests.v2.review.decisionNote")}</h3>
          <p className="whitespace-pre-wrap break-words">{request.decisionNote}</p></div>}
        {request.generatedTaskId && <WorkspaceRequestTask workspaceId={request.workspaceId} requestId={request.id} />}
        <section className="space-y-2"><h3 className="font-semibold">{t("requests.v2.history")}</h3>
          {!request.history.length && <p className="text-muted-foreground text-sm">{t("requests.v2.noHistory")}</p>}
          <ol className="space-y-2">{request.history.map((event, index) => <li key={`${event.version}-${index}`}
            className="flex flex-wrap justify-between gap-2 rounded-md border p-3 text-sm">
            <span>{t(`requests.v2.events.${event.action}`)} · {t("requests.v2.version")} {event.version}</span>
            <time dateTime={event.at} className="text-muted-foreground">{date(event.at)}</time>
            {event.note && <p className="w-full whitespace-pre-wrap break-words">
              {event.note === "CAMPAIGN_COMPLETED" ? t("requests.cancelledByCompletion") : event.note}</p>}
          </li>)}</ol>
        </section>
        <div className="flex flex-wrap justify-end gap-2">
          {request.canReceive && <Button variant="orange" onClick={() => onReview(request, "receive")}>{t("requests.v2.review.receive")}</Button>}
          {request.canDeny && <Button variant="destructive" onClick={() => onReview(request, "deny")}>{t("requests.v2.review.deny")}</Button>}
          {request.canAccept && <Button variant="orange" onClick={() => onReview(request, "accept")}>{t("requests.v2.review.accept")}</Button>}
          {request.canCancel && <Button variant="destructive" onClick={() => onCancel(request)}>{t("requests.v2.cancelRequest")}</Button>}
          {request.canEdit && <Button variant="orange" onClick={() => onEdit(request)}>{t("requests.v2.edit")}</Button>}
          <Button variant="outline" onClick={onClose}>{t("requests.v2.close")}</Button>
        </div>
      </div>}
    </DialogContent>
  </Dialog>;
}
