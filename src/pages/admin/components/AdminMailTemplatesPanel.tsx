import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { TemplateFormDialog, type FormAdapter } from "@/pages/mail-templates/components/TemplateFormDialog";
import { SCOPES_BY_AUDIENCE } from "@/pages/mail-templates/blocks";
import { adminMailTemplateService, type SendPayload } from "@/pages/mail-templates/services/mailTemplateService";
import { AdminBroadcastDialog } from "./AdminBroadcastDialog";
import type { MailTemplate, MailTemplateScope, MailTemplateSummary, PageOf, RecipientPreview, SendResult, TemplatePayload } from "@/pages/mail-templates/types";

/** CRUD surface shared by the Admin and Agency template libraries. */
export interface TemplateLibraryService {
  list: (params: { q?: string; page?: number; size?: number }) => Promise<PageOf<MailTemplateSummary>>;
  get: (id: string) => Promise<MailTemplate>;
  create: (payload: TemplatePayload) => Promise<MailTemplate>;
  update: (id: string, payload: TemplatePayload) => Promise<MailTemplate>;
  remove: (id: string) => Promise<unknown>;
  /** Present only for the system library: sends an ADMIN_SYSTEM_BROADCAST template. */
  send?: (id: string, payload: SendPayload, idempotencyKey: string) => Promise<SendResult>;
  sendTest?: (id: string) => Promise<unknown>;
  recipientPreview?: (id: string) => Promise<RecipientPreview>;
}

interface PanelProps {
  service?: TemplateLibraryService;
  scopes?: MailTemplateScope[];
  agencyId?: string;
  draftKey?: string;
}

/** Template library with the block builder: Admin (system scopes, DA-1259) or Agency (agency scopes, B5). */
export function AdminMailTemplatesPanel({
  service = adminMailTemplateService,
  scopes = SCOPES_BY_AUDIENCE.admin,
  agencyId,
  draftKey = "mail-template-draft:admin",
}: PanelProps) {
  const { t } = useTranslation();
  const adapter: FormAdapter = {
    scopes,
    agencyId,
    save: (payload, existing) => (existing ? service.update(existing.id, payload) : service.create(payload)),
  };
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageOf<MailTemplateSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [broadcast, setBroadcast] = useState<MailTemplateSummary | null>(null);
  const [form, setForm] = useState<{ mode: "create" | "edit"; template: MailTemplate | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setData(await service.list({ q: query || undefined, page, size: 20 }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [service, query, page]);

  useEffect(() => { void load(); }, [load]);

  const edit = async (row: MailTemplateSummary) => {
    try {
      setForm({ mode: "edit", template: await service.get(row.id) });
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  const remove = async (row: MailTemplateSummary) => {
    if (!window.confirm(t("mailTemplate.confirmDelete.body", { name: row.name }))) return;
    try {
      await service.remove(row.id);
      toast.success(t("mailTemplate.deleted"));
      void load();
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input aria-label={t("mailTemplate.search")} placeholder={t("mailTemplate.search")} className="w-full sm:w-64"
          value={query} onChange={(e) => { setPage(0); setQuery(e.target.value); }} />
        <Button variant="orange" className="ml-auto"
          onClick={() => setForm({ mode: "create", template: null })}>
          <Plus className="size-4" />{t("mailTemplate.admin.create")}
        </Button>
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
      {!loading && !failed && data && (
        <ul className="space-y-3" aria-label={t("mailTemplate.admin.title")}>
          {data.content.map((row) => (
            <li key={row.id} className="bg-card flex items-center gap-3 rounded-lg border p-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium break-words">{row.name}</h3>
                {row.scope && <p className="text-muted-foreground text-xs">{t(`mailTemplate.scopes.${row.scope}`)}</p>}
                <p className="text-muted-foreground truncate text-sm">{row.subject}</p>
              </div>
              {service.send && row.scope === "ADMIN_SYSTEM_BROADCAST" && (
                <Button size="sm" variant="outline" onClick={() => setBroadcast(row)}>
                  <Send className="size-3.5" />{t("mailTemplate.actions.send")}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => void edit(row)}>
                <Pencil className="size-3.5" />{t("mailTemplate.actions.edit")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => void remove(row)}>
                <Trash2 className="size-3.5" />{t("mailTemplate.actions.delete")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <nav className="flex items-center gap-2" aria-label={t("mailTemplate.pagination")}>
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>{t("mailTemplate.previous")}</Button>
          <span className="text-sm">{t("mailTemplate.page", { page: page + 1, total: data.totalPages })}</span>
          <Button variant="outline" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>{t("mailTemplate.next")}</Button>
        </nav>
      )}
      {broadcast && service.send && (
        <AdminBroadcastDialog template={broadcast} send={service.send} sendTest={service.sendTest} recipientPreview={service.recipientPreview} onClose={() => setBroadcast(null)} />
      )}
      {form && (
        <TemplateFormDialog open key={`${form.mode}-${form.template?.id ?? "new"}`} mode={form.mode}
          draftKey={draftKey}
          template={form.template} adapter={adapter} onClose={() => setForm(null)}
          onSaved={() => { setForm(null); void load(); }} />
      )}
    </div>
  );
}
