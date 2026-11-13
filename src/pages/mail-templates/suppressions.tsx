import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { mailTemplateService } from "./services/mailTemplateService";
import type { MailSuppression, PageOf } from "./types";

/** What the panel needs from a backend: the workspace, an agency and the Admin console each supply their own. */
export interface SuppressionApi {
  list: (params: { q?: string; page?: number; size?: number }) => Promise<PageOf<MailSuppression>>;
  remove: (email: string) => Promise<unknown>;
}

/** The unsubscribe list of one scope; re-subscribing is audited by the server. */
export function SuppressionsPanel({ api, backTo }: { api: SuppressionApi; backTo?: string }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageOf<MailSuppression> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<"forbidden" | "failed" | null>(null);
  const [confirmRow, setConfirmRow] = useState<MailSuppression | null>(null);
  const [resubscribing, setResubscribing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(null);
    try {
      setData(await api.list({ q: query || undefined, page, size: 20 }));
    } catch (e) {
      setFailed(/FORBIDDEN$/.test(errorCode(e) ?? "") ? "forbidden" : "failed");
    } finally {
      setLoading(false);
    }
  }, [api, query, page]);

  useEffect(() => { void load(); }, [load]);

  const confirmResubscribe = async () => {
    if (!confirmRow) return;
    setResubscribing(true);
    try {
      await api.remove(confirmRow.email);
      toast.success(t("mailTemplate.suppressions.done"));
      setConfirmRow(null);
      void load();
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    } finally {
      setResubscribing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {backTo && (
          <Button asChild variant="outline">
            <Link to={backTo}><ArrowLeft className="size-4" />{t("mailTemplate.batches.back")}</Link>
          </Button>
        )}
        <Input aria-label={t("mailTemplate.suppressions.search")} placeholder={t("mailTemplate.suppressions.search")}
          className="w-full sm:w-72" value={query} onChange={(e) => { setPage(0); setQuery(e.target.value); }} />
      </div>
      {loading && <Spinner />}
      {failed && (
        <div role="alert" className="space-y-2">
          <p>{t(failed === "forbidden" ? "mailTemplate.suppressions.forbidden" : "mailTemplate.suppressions.loadFailed")}</p>
          {failed === "failed" && <Button onClick={() => void load()}>{t("mailTemplate.retry")}</Button>}
        </div>
      )}
      {!loading && !failed && data && data.content.length === 0 && (
        <p className="text-muted-foreground">{t("mailTemplate.suppressions.empty")}</p>
      )}
      {!loading && !failed && data && data.content.length > 0 && (
        <ul className="space-y-2" aria-label={t("mailTemplate.suppressions.title")}>
          {data.content.map((row) => (
            <li key={row.email} className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="break-all font-medium">{row.email}</p>
                <p className="text-muted-foreground text-xs">
                  {t("mailTemplate.suppressions.since", { when: new Date(row.createdAt).toLocaleDateString(i18n.language) })}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setConfirmRow(row)}>
                {t("mailTemplate.suppressions.resubscribe")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <Pagination
          page={page + 1}
          size={data.size || 10}
          total={data.totalElements}
          totalPages={data.totalPages}
          itemLabel={t("mailTemplate.suppressions.title", "địa chỉ hủy đăng ký").toLowerCase()}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          className="pt-2"
        />
      )}
      <Dialog open={!!confirmRow} onOpenChange={(open) => !open && !resubscribing && setConfirmRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.confirmDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("mailTemplate.suppressions.confirm", { email: confirmRow?.email ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={resubscribing} onClick={() => setConfirmRow(null)}>
              {t("common.confirmDialog.cancel")}
            </Button>
            <Button type="button" variant="orange" disabled={resubscribing} onClick={() => void confirmResubscribe()}>
              {t("common.confirmDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MailSuppressionsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  // One stable api object per workspace so the panel effects do not re-run on every render.
  const api = useMemo<SuppressionApi | null>(
    () => (id ? {
      list: (params) => mailTemplateService.suppressions(id, params),
      remove: (email) => mailTemplateService.resubscribe(id, email),
    } : null),
    [id],
  );
  return (
    <PageWrapper title={t("mailTemplate.suppressions.title")} description={t("mailTemplate.suppressions.subtitle")}>
      {id && api && <SuppressionsPanel key={id} api={api} backTo={`/workspaces/${id}/mail-templates`} />}
    </PageWrapper>
  );
}
