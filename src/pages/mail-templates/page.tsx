import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Pencil, Send, Trash2, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { MailTemplateFilters } from "./components/MailTemplateFilters";
import { SendMailDialog } from "./components/SendMailDialog";
import { agencyMailTemplateService, mailTemplateService } from "./services/mailTemplateService";
import type { MailTemplateCategory, MailTemplateSort, MailTemplateSummary, PageOf } from "./types";

function Panel({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MailTemplateCategory>("ALL");
  const [sort, setSort] = useState<MailTemplateSort>("CREATED_DESC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<PageOf<MailTemplateSummary> | null>(null);
  const [agencyRows, setAgencyRows] = useState<MailTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
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

  const isInviteTemplate = useCallback((r: MailTemplateSummary) => {
    return (
      r.scope === "AGENCY_INTERNAL" ||
      r.scope === "AGENCY_CLIENT" ||
      r.name.toLowerCase().includes("mời") ||
      r.name.toLowerCase().includes("invite") ||
      r.name.toLowerCase().includes("gia nhập") ||
      r.subject.toLowerCase().includes("mời") ||
      r.subject.toLowerCase().includes("invite")
    );
  }, []);

  const categoryCounts = useMemo<Record<MailTemplateCategory, number>>(() => {
    let all = 0, system = 0, custom = 0, campaign = 0, ws = 0, invite = 0;
    for (const r of allRows) {
      all++;
      if (r.type === "SYSTEM_DEFAULT") system++;
      if (r.type === "CUSTOM") custom++;
      if (r.scope === "CAMPAIGN_BROADCAST") campaign++;
      if (r.scope === "WORKSPACE_MANAGER") ws++;
      if (isInviteTemplate(r)) invite++;
    }
    return {
      ALL: all,
      SYSTEM_DEFAULT: system,
      CUSTOM: custom,
      INVITATION: invite,
      CAMPAIGN_BROADCAST: campaign,
      WORKSPACE_MANAGER: ws,
    };
  }, [allRows, isInviteTemplate]);

  const sortedRows = useMemo(() => {
    const filtered = allRows.filter((r) => {
      if (category === "SYSTEM_DEFAULT") return r.type === "SYSTEM_DEFAULT";
      if (category === "CUSTOM") return r.type === "CUSTOM";
      if (category === "INVITATION") return isInviteTemplate(r);
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
        onCreateTemplate={() => navigate(`/workspaces/${workspaceId}/mail-templates/new`)}
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
                  {isInviteTemplate(row) && (
                    <Badge variant="outline" className="border-brand-orange/40 bg-brand-orange/5 text-brand-orange text-3xs font-medium">
                      {t("mailTemplate.categories.INVITATION", "Thư mời")}
                    </Badge>
                  )}
                  {row.attachmentCount > 0 && (
                    <span className="text-muted-foreground text-xs">{t("mailTemplate.attachmentCount", { count: row.attachmentCount })}</span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">{row.subject}</p>
                <p className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString(i18n.language)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Dedicated Invitation Workflow Action */}
                {row.scope === "AGENCY_INTERNAL" || (isInviteTemplate(row) && /agency.*thành viên|gia nhập công ty|thành viên agency/i.test(row.name)) ? (
                  agencyId ? (
                    <Button
                      size="sm"
                      variant="orange"
                      className="gap-1.5 cursor-pointer shadow-xs"
                      onClick={() => navigate(`/agency/${agencyId}/members?templateId=${row.id}`)}
                    >
                      <UserPlus className="size-3.5" />
                      {t("mailTemplate.actions.inviteMember", "Mời thành viên")}
                    </Button>
                  ) : null
                ) : row.scope === "AGENCY_CLIENT" || (isInviteTemplate(row) && /khách hàng|client/i.test(row.name)) ? (
                  <Button
                    size="sm"
                    variant="orange"
                    className="gap-1.5 cursor-pointer shadow-xs"
                    onClick={() => navigate(`/workspaces/${workspaceId}/clients?invite=true&templateId=${row.id}`)}
                  >
                    <UserCheck className="size-3.5" />
                    {t("mailTemplate.actions.inviteClient", "Mời khách hàng")}
                  </Button>
                ) : isInviteTemplate(row) ? (
                  <Button
                    size="sm"
                    variant="orange"
                    className="gap-1.5 cursor-pointer shadow-xs"
                    onClick={() => navigate(`/workspaces/${workspaceId}/members?invite=true&templateId=${row.id}`)}
                  >
                    <UserPlus className="size-3.5" />
                    {t("mailTemplate.actions.inviteMember", "Mời thành viên")}
                  </Button>
                ) : null}

                <Button size="sm" variant="outline" onClick={() => setSendFor(row)}>
                  <Send className="size-3.5" />{t("mailTemplate.actions.send")}
                </Button>
                {row.scope?.startsWith("AGENCY_") ? null : row.type === "SYSTEM_DEFAULT" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/workspaces/${workspaceId}/mail-templates/new?cloneFrom=${row.id}`)}
                  >
                    <Copy className="size-3.5" />{t("mailTemplate.actions.use")}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/workspaces/${workspaceId}/mail-templates/${row.id}/edit`)}
                    >
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
