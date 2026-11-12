import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Pencil, Send, Trash2 } from "lucide-react";
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
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { SCOPES_BY_AUDIENCE } from "./blocks";
import { MailTemplateFilters } from "./components/MailTemplateFilters";
import { SendMailDialog } from "./components/SendMailDialog";
import { TemplateFormDialog, type FormAdapter } from "./components/TemplateFormDialog";
import { agencyMailTemplateService, mailTemplateService } from "./services/mailTemplateService";
import type {
  MailTemplate,
  MailTemplateCategory,
  MailTemplateSort,
  MailTemplateSummary,
  PageOf,
} from "./types";

type FormState = { mode: "create" | "edit"; template: MailTemplate | null } | null;

function Panel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MailTemplateCategory>("ALL");
  const [sort, setSort] = useState<MailTemplateSort>("CREATED_DESC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<PageOf<MailTemplateSummary> | null>(null);
  const [agencyRows, setAgencyRows] = useState<MailTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [sendFor, setSendFor] = useState<MailTemplateSummary | null>(null);
  const [toDelete, setToDelete] = useState<MailTemplateSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const agencyId = useWorkspaceStore((s) => s.currentWorkspace?.agencyId);

  useEffect(() => {
    if (!agencyId) { setAgencyRows([]); return; }
    let cancelled = false;
    agencyMailTemplateService.list(agencyId, { q: search || undefined, size: 100 })
      .then((p) => { if (!cancelled) setAgencyRows(p.content); })
      .catch(() => { if (!cancelled) setAgencyRows([]); });
    return () => { cancelled = true; };
  }, [agencyId, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setData(await mailTemplateService.list(workspaceId, { q: search || undefined, includeSystem: true, size: 100 }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, search]);

  useEffect(() => { void load(); }, [load]);

  const allRows = useMemo(() => {
    const map = new Map<string, MailTemplateSummary>();
    for (const r of data?.content ?? []) map.set(r.id, r);
    for (const r of agencyRows) { if (!map.has(r.id)) map.set(r.id, r); }
    return Array.from(map.values());
  }, [data?.content, agencyRows]);

  const categoryCounts = useMemo<Record<MailTemplateCategory, number>>(() => {
    let all = 0, system = 0, custom = 0, campaign = 0, ws = 0;
    for (const r of allRows) {
      all++;
      if (r.type === "SYSTEM_DEFAULT") system++;
      if (r.type === "CUSTOM") custom++;
      if (r.scope === "CAMPAIGN_BROADCAST") campaign++;
      if (r.scope === "WORKSPACE_MANAGER") ws++;
    }
    return { ALL: all, SYSTEM_DEFAULT: system, CUSTOM: custom, CAMPAIGN_BROADCAST: campaign, WORKSPACE_MANAGER: ws };
  }, [allRows]);

  const sortedRows = useMemo(() => {
    const filtered = allRows.filter((r) => {
      if (category === "SYSTEM_DEFAULT") return r.type === "SYSTEM_DEFAULT";
      if (category === "CUSTOM") return r.type === "CUSTOM";
      if (category === "CAMPAIGN_BROADCAST") return r.scope === "CAMPAIGN_BROADCAST";
      if (category === "WORKSPACE_MANAGER") return r.scope === "WORKSPACE_MANAGER";
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "CREATED_DESC") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "CREATED_ASC") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "NAME_ASC") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (sort === "NAME_DESC") return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
      return 0;
    });
  }, [allRows, category, sort]);

  useEffect(() => { setPage(1); }, [search, category, sort, pageSize]);

  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const adapter: FormAdapter = {
    save: (payload, existing) =>
      existing
        ? mailTemplateService.update(workspaceId, existing.id, payload)
        : mailTemplateService.create(workspaceId, payload),
    scopes: SCOPES_BY_AUDIENCE.workspace,
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
      <MailTemplateFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categoryCounts={categoryCounts}
        sort={sort}
        onSortChange={setSort}
        workspaceId={workspaceId}
        onCreateTemplate={() => setForm({ mode: "create", template: null })}
      />

      {loading && <Spinner />}
      {failed && (
        <div role="alert" className="space-y-2">
          <p>{t("mailTemplate.error")}</p>
          <Button onClick={() => void load()}>{t("mailTemplate.retry")}</Button>
        </div>
      )}
      {!loading && !failed && totalItems === 0 && (
        <p className="text-muted-foreground">{t("mailTemplate.empty")}</p>
      )}
      {!loading && !failed && totalItems > 0 && (
        <ul className="space-y-3" aria-label={t("mailTemplate.title")}>
          {paginatedRows.map((row) => (
            <li key={row.id} className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium break-words">{row.name}</h3>
                  {row.type === "SYSTEM_DEFAULT" && <Badge variant="secondary">{t("mailTemplate.systemBadge")}</Badge>}
                  {row.scope && <Badge variant="outline">{t(`mailTemplate.scopes.${row.scope}`)}</Badge>}
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
                {row.scope?.startsWith("AGENCY_") ? null : row.type === "SYSTEM_DEFAULT" ? (
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

      {totalItems > 0 && (
        <Pagination
          page={page}
          size={pageSize}
          total={totalItems}
          totalPages={totalPages}
          isFetching={loading}
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
          itemLabel={t("mailTemplate.itemLabel")}
          compact={false}
        />
      )}

      {form && (
        <TemplateFormDialog open key={`${form.mode}-${form.template?.id ?? "new"}`} mode={form.mode}
          draftKey={`mail-template-draft:${workspaceId}`}
          template={form.template} adapter={adapter} onClose={() => setForm(null)}
          onSaved={() => { setForm(null); void load(); }} />
      )}
      {sendFor && (
        <SendMailDialog open workspaceId={workspaceId} template={sendFor} agencyId={agencyId} onClose={() => setSendFor(null)} />
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
