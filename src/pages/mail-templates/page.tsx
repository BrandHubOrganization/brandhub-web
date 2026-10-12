import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, History, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { SendMailDialog } from "./components/SendMailDialog";
import { TemplateFormDialog, type FormAdapter } from "./components/TemplateFormDialog";
import { mailTemplateService } from "./services/mailTemplateService";
import type { MailTemplate, MailTemplateSummary, PageOf } from "./types";

type FormState = { mode: "create" | "edit"; template: MailTemplate | null } | null;

function Panel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [includeSystem, setIncludeSystem] = useState(true);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageOf<MailTemplateSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [sendFor, setSendFor] = useState<MailTemplateSummary | null>(null);
  const [toDelete, setToDelete] = useState<MailTemplateSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setData(await mailTemplateService.list(workspaceId, { q: query || undefined, includeSystem, page, size: 20 }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, query, includeSystem, page]);

  useEffect(() => { void load(); }, [load]);

  const adapter: FormAdapter = {
    save: (payload, existing) =>
      existing
        ? mailTemplateService.update(workspaceId, existing.id, payload)
        : mailTemplateService.create(workspaceId, payload),
    uploadImage: async (file) => {
      const uploaded = await mailTemplateService.upload(workspaceId, file, "images");
      return uploaded.url ?? "";
    },
    uploadAttachment: async (file) => {
      const u = await mailTemplateService.upload(workspaceId, file, "attachments");
      return { attachmentId: u.id, name: u.name, contentType: u.contentType, size: u.size };
    },
  };

  const openEdit = async (row: MailTemplateSummary, mode: "edit" | "create") => {
    try {
      const full = await mailTemplateService.get(workspaceId, row.id);
      setForm({ mode, template: full });
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await mailTemplateService.remove(workspaceId, toDelete.id);
      toast.success(t("mailTemplate.deleted"));
      setToDelete(null);
      void load();
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input aria-label={t("mailTemplate.search")} placeholder={t("mailTemplate.search")} className="w-full sm:w-64"
          value={query} onChange={(e) => { setPage(0); setQuery(e.target.value); }} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeSystem}
            onChange={(e) => { setPage(0); setIncludeSystem(e.target.checked); }} />
          {t("mailTemplate.includeSystem")}
        </label>
        <div className="ml-auto flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/workspaces/${workspaceId}/mail-templates/batches`}><History className="size-4" />{t("mailTemplate.batches.title")}</Link>
          </Button>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            onClick={() => setForm({ mode: "create", template: null })}>
            <Plus className="size-4" />{t("mailTemplate.create")}
          </Button>
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
        <p className="text-muted-foreground">{t("mailTemplate.empty")}</p>
      )}
      {!loading && !failed && data && data.content.length > 0 && (
        <ul className="space-y-3" aria-label={t("mailTemplate.title")}>
          {data.content.map((row) => (
            <li key={row.id} className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium break-words">{row.name}</h3>
                  {row.type === "SYSTEM_DEFAULT" && <Badge variant="secondary">{t("mailTemplate.systemBadge")}</Badge>}
                  {row.attachmentCount > 0 && (
                    <span className="text-muted-foreground text-xs">{t("mailTemplate.attachmentCount", { count: row.attachmentCount })}</span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">{row.subject}</p>
                <p className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString(i18n.language)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setSendFor(row)}>
                  <Send className="size-3.5" />{t("mailTemplate.actions.send")}
                </Button>
                {row.type === "SYSTEM_DEFAULT" ? (
                  <Button size="sm" variant="outline" onClick={() => void openEdit(row, "create")}>
                    <Copy className="size-3.5" />{t("mailTemplate.actions.use")}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => void openEdit(row, "edit")}>
                      <Pencil className="size-3.5" />{t("mailTemplate.actions.edit")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setToDelete(row)}>
                      <Trash2 className="size-3.5" />{t("mailTemplate.actions.delete")}
                    </Button>
                  </>
                )}
              </div>
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

      {form && (
        <TemplateFormDialog open key={`${form.mode}-${form.template?.id ?? "new"}`} mode={form.mode}
          template={form.template} adapter={adapter} onClose={() => setForm(null)}
          onSaved={() => { setForm(null); void load(); }} />
      )}
      {sendFor && (
        <SendMailDialog open workspaceId={workspaceId} template={sendFor} onClose={() => setSendFor(null)} />
      )}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("mailTemplate.confirmDelete.title")}</DialogTitle>
            <DialogDescription>{t("mailTemplate.confirmDelete.body", { name: toDelete?.name ?? "" })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setToDelete(null)}>{t("mailTemplate.cancel")}</Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>{t("mailTemplate.confirmDelete.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MailTemplatesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <PageWrapper title={t("mailTemplate.title")} description={t("mailTemplate.subtitle")}>
      {id && <Panel key={id} workspaceId={id} />}
    </PageWrapper>
  );
}
