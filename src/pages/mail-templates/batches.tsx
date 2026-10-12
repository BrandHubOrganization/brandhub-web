import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { mailTemplateService } from "./services/mailTemplateService";
import { BATCH_STATUSES, type MailBatch, type MailBatchDetail, type PageOf } from "./types";

function Panel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageOf<MailBatch> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [detail, setDetail] = useState<MailBatchDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setData(await mailTemplateService.batches(workspaceId, { status: status || undefined, page, size: 20 }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, status, page]);

  useEffect(() => { void load(); }, [load]);

  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(i18n.language) : "—");

  const open = async (batch: MailBatch) => {
    try {
      setDetail(await mailTemplateService.batch(workspaceId, batch.id, { size: 100 }));
    } catch {
      toast.error(t("mailTemplate.errors.generic"));
    }
  };

  const cancel = async (batch: MailBatch) => {
    try {
      await mailTemplateService.cancelBatch(workspaceId, batch.id);
      toast.success(t("mailTemplate.batches.cancelled"));
      setDetail(null);
      void load();
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <Link to={`/workspaces/${workspaceId}/mail-templates`}><ArrowLeft className="size-4" />{t("mailTemplate.batches.back")}</Link>
        </Button>
        <div className="w-48">
          <Select aria-label={t("mailTemplate.batches.status")} value={status}
            onChange={(e) => { setPage(0); setStatus(e.target.value); }}>
            <option value="">{t("mailTemplate.batches.allStatuses")}</option>
            {BATCH_STATUSES.map((s) => <option key={s} value={s}>{t(`mailTemplate.batches.statuses.${s}`)}</option>)}
          </Select>
        </div>
      </div>
      {loading && <Spinner />}
      {failed && (
        <div role="alert" className="space-y-2">
          <p>{t("mailTemplate.error")}</p>
          <Button onClick={() => void load()}>{t("mailTemplate.retry")}</Button>
        </div>
      )}
      {!loading && !failed && data && data.content.length === 0 && (
        <p className="text-muted-foreground">{t("mailTemplate.batches.empty")}</p>
      )}
      {!loading && !failed && data && data.content.length > 0 && (
        <ul className="space-y-3" aria-label={t("mailTemplate.batches.title")}>
          {data.content.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => void open(b)}
                className="bg-card hover:bg-muted/40 w-full rounded-lg border p-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{b.templateName}</span>
                  <Badge variant="secondary">{t(`mailTemplate.batches.statuses.${b.status}`)}</Badge>
                </div>
                <p className="text-muted-foreground truncate text-sm">{b.subject}</p>
                <p className="text-muted-foreground text-xs">
                  {t("mailTemplate.batches.counts", { sent: b.sent, total: b.accepted, failed: b.failed, suppressed: b.suppressed })}
                  {" · "}
                  {b.scheduledAt ? t("mailTemplate.batches.scheduledFor", { when: when(b.scheduledAt) }) : when(b.createdAt)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <nav aria-label={t("mailTemplate.pagination")} className="flex items-center gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>{t("mailTemplate.previous")}</Button>
          <span className="text-sm">{t("mailTemplate.page", { page: page + 1, total: data.totalPages })}</span>
          <Button variant="outline" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>{t("mailTemplate.next")}</Button>
        </nav>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.batch.templateName}</DialogTitle>
                <DialogDescription>{detail.batch.subject}</DialogDescription>
              </DialogHeader>
              <p className="text-sm">
                {t(`mailTemplate.batches.statuses.${detail.batch.status}`)} ·{" "}
                {t("mailTemplate.batches.counts", {
                  sent: detail.batch.sent, total: detail.batch.accepted,
                  failed: detail.batch.failed, suppressed: detail.batch.suppressed,
                })}
              </p>
              {detail.batch.status === "SCHEDULED" && (
                <Button variant="outline" onClick={() => void cancel(detail.batch)}>{t("mailTemplate.batches.cancel")}</Button>
              )}
              <ul className="divide-y text-sm" aria-label={t("mailTemplate.batches.recipients")}>
                {detail.deliveries.content.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="min-w-0 break-all">{d.recipient}</span>
                    <span className="text-muted-foreground text-xs">
                      {t(`mailTemplate.batches.deliveryStatuses.${d.status}`)}
                      {d.lastError ? ` · ${d.lastError}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MailBatchesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <PageWrapper title={t("mailTemplate.batches.title")} description={t("mailTemplate.batches.subtitle")}>
      {id && <Panel key={id} workspaceId={id} />}
    </PageWrapper>
  );
}
