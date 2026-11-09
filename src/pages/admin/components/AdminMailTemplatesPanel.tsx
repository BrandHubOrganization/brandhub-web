import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Pencil, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { errorCode } from "@/services/adminRevenueService";
import { TemplateFormDialog } from "@/pages/mail-templates/components/TemplateFormDialog";
import { SCOPES_BY_AUDIENCE } from "@/pages/mail-templates/blocks";
import { adminMailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";
import { AdminBroadcastDialog } from "@/pages/admin/components/AdminBroadcastDialog";
import type { FormAdapter } from "@/pages/mail-templates/components/TemplateFormDialog";
import type { SendPayload } from "@/pages/mail-templates/services/mailTemplateService";
import type {
  MailTemplate,
  MailTemplateScope,
  MailTemplateSummary,
  PageOf,
  RecipientPreview,
  SendResult,
  TemplatePayload,
} from "@/pages/mail-templates/types";

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
  onUseTemplate?: (template: MailTemplateSummary) => void;
}

interface TemplateRowProps {
  row: MailTemplateSummary;
  canSend: boolean;
  useLabelKey: string;
  onUseOrSend: (row: MailTemplateSummary) => void;
  onEdit: (row: MailTemplateSummary) => void;
  onRequestDelete: (row: MailTemplateSummary) => void;
}

function TemplateListItem({ row, canSend, useLabelKey, onUseOrSend, onEdit, onRequestDelete }: TemplateRowProps) {
  const { t } = useTranslation();

  return (
    <li className="bg-card border-border hover:border-brand-orange/40 flex flex-col justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <div className="bg-brand-orange-soft text-brand-orange mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-foreground text-sm font-semibold break-words">{row.name}</h3>
            {row.scope && (
              <Badge variant="outline" className="text-xs font-normal">
                {t(`mailTemplate.scopes.${row.scope}`)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-xs">{row.subject}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canSend && (
          <Button size="sm" variant="outline" onClick={() => onUseOrSend(row)}>
            <Send className="size-3.5" />
            {t(useLabelKey)}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
          <Pencil className="size-3.5" />
          {t("mailTemplate.actions.edit")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRequestDelete(row)}
        >
          <Trash2 className="size-3.5" />
          {t("mailTemplate.actions.delete")}
        </Button>
      </div>
    </li>
  );
}

/** Template library with the block builder: Admin (system scopes, DA-1259) or Agency (agency scopes, B5). */
export function AdminMailTemplatesPanel({
  service = adminMailTemplateService,
  scopes = SCOPES_BY_AUDIENCE.admin,
  agencyId,
  draftKey = "mail-template-draft:admin",
  onUseTemplate,
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
  const [pendingDelete, setPendingDelete] = useState<MailTemplateSummary | null>(null);
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

  useEffect(() => {
    void load();
  }, [load]);

  const edit = async (row: MailTemplateSummary) => {
    try {
      setForm({ mode: "edit", template: await service.get(row.id) });
    } catch (error) {
      toast.error(t(`mailTemplate.errors.${errorCode(error)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await service.remove(target.id);
      toast.success(t("mailTemplate.deleted"));
      void load();
    } catch (error) {
      toast.error(t(`mailTemplate.errors.${errorCode(error)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  const createLabelKey = agencyId ? "mailTemplate.agency.create" : "mailTemplate.admin.create";
  const useLabelKey = onUseTemplate ? "admin.emailHub.useThisTemplate" : "mailTemplate.actions.send";

  return (
    <div className="space-y-4">
      <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Input
            aria-label={t("mailTemplate.search")}
            placeholder={t("mailTemplate.search")}
            iconPrefix={<Search className="size-4" />}
            wrapperClassName="w-full sm:max-w-xs"
            value={query}
            onChange={(event) => {
              setPage(0);
              setQuery(event.target.value);
            }}
          />
          {!loading && data && (
            <Badge variant="secondary" className="hidden shrink-0 text-xs font-medium sm:inline-flex">
              {data.totalElements} {t("mailTemplate.itemLabel")}
            </Badge>
          )}
        </div>
        <Button variant="orange" className="shrink-0" onClick={() => setForm({ mode: "create", template: null })}>
          <Plus className="size-4" />
          {t(createLabelKey)}
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
        <p className="text-muted-foreground text-sm">{t("mailTemplate.empty")}</p>
      )}
      {!loading && !failed && data && data.content.length > 0 && (
        <ul className="space-y-3" aria-label={t("mailTemplate.admin.title")}>
          {data.content.map((row) => (
            <TemplateListItem
              key={row.id}
              row={row}
              canSend={Boolean(onUseTemplate || (service.send && row.scope === "ADMIN_SYSTEM_BROADCAST"))}
              useLabelKey={useLabelKey}
              onUseOrSend={(item) => (onUseTemplate ? onUseTemplate(item) : setBroadcast(item))}
              onEdit={(item) => void edit(item)}
              onRequestDelete={(item) => setPendingDelete(item)}
            />
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <Pagination
          page={page + 1}
          size={data.size}
          total={data.totalElements}
          totalPages={data.totalPages}
          itemLabel={t("mailTemplate.itemLabel")}
          onPageChange={(newPage) => setPage(newPage - 1)}
        />
      )}

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(isOpen) => !isOpen && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("mailTemplate.confirmDelete.title")}</DialogTitle>
            <DialogDescription>
              {t("mailTemplate.confirmDelete.body", { name: pendingDelete?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t("mailTemplate.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()}>
              {t("mailTemplate.confirmDelete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {broadcast && service.send && (
        <AdminBroadcastDialog
          template={broadcast}
          send={service.send}
          sendTest={service.sendTest}
          recipientPreview={service.recipientPreview}
          onClose={() => setBroadcast(null)}
        />
      )}
      {form && (
        <TemplateFormDialog
          open
          key={`${form.mode}-${form.template?.id ?? "new"}`}
          mode={form.mode}
          draftKey={draftKey}
          template={form.template}
          adapter={adapter}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
