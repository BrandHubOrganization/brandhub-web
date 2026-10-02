import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Building2,
  Calendar,
  Eye,
  Globe,
  MapPin,
  Plus,
  Users,
  Search,
  X,
  ChevronDown,
  FolderKanban,
  ChevronsUpDown,
  ExternalLink,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import { useAuthStore } from "@/store/authStore";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { AGENCY_CATEGORIES } from "@/pages/agency/constants";
import { cn } from "@/lib/utils";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

type SortOption = "name_asc" | "name_desc" | "workspaces_desc" | "owner_first" | "newest";
type RoleFilter = "all" | "owner" | "member";

export function AgencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const user = useAuthStore((s) => s.user);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("workspaces_desc");

  // Expanded workspaces state (set of agency IDs)
  const [expandedAgencyIds, setExpandedAgencyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      agencyService.list(),
      workspaceService.list().catch(() => ({ data: { data: [] } })),
    ])
      .then(([agencyRes, workspaceRes]) => {
        const agencyList = agencyRes.data.data;
        const workspaceList = workspaceRes.data.data ?? [];
        setAgencies(agencyList);
        setWorkspaces(workspaceList);

        if (agencyList.length === 1) {
          setCurrentAgencyId(agencyList[0].id);
        } else {
          setCurrentAgencyId(null);
        }
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [t, setCurrentAgencyId]);

  // Group workspaces by agencyId
  const workspacesByAgency = useMemo(() => {
    const map = new Map<string, Workspace[]>();
    workspaces.forEach((w) => {
      if (w.agencyId) {
        const list = map.get(w.agencyId) || [];
        list.push(w);
        map.set(w.agencyId, list);
      }
    });
    return map;
  }, [workspaces]);

  // Filtered & Sorted agencies
  const filteredAgencies = useMemo(() => {
    return agencies
      .filter((a) => {
        // 1. Category filter
        if (categoryFilter && a.category !== categoryFilter) return false;

        // 2. Role filter
        const isOwner = a.ownerId === user?.id;
        if (roleFilter === "owner" && !isOwner) return false;
        if (roleFilter === "member" && isOwner) return false;

        // 3. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const agencyWorkspaces = workspacesByAgency.get(a.id) || [];
          const matchesWorkspaceName = agencyWorkspaces.some((w) =>
            w.name.toLowerCase().includes(q),
          );
          const matchesAgency =
            a.name.toLowerCase().includes(q) ||
            (a.tagline && a.tagline.toLowerCase().includes(q)) ||
            (a.location && a.location.toLowerCase().includes(q)) ||
            (a.website && a.website.toLowerCase().includes(q)) ||
            (a.category && a.category.toLowerCase().includes(q));

          if (!matchesAgency && !matchesWorkspaceName) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "name_asc") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (sortOption === "name_desc") {
          return b.name.localeCompare(a.name, "vi");
        }
        if (sortOption === "workspaces_desc") {
          const countA = workspacesByAgency.get(a.id)?.length || 0;
          const countB = workspacesByAgency.get(b.id)?.length || 0;
          return countB - countA;
        }
        if (sortOption === "owner_first") {
          const isOwnerA = a.ownerId === user?.id ? 1 : 0;
          const isOwnerB = b.ownerId === user?.id ? 1 : 0;
          if (isOwnerA !== isOwnerB) return isOwnerB - isOwnerA;
          return a.name.localeCompare(b.name, "vi");
        }
        // newest founded or fallback
        const yearA = a.foundedYear || 0;
        const yearB = b.foundedYear || 0;
        return yearB - yearA;
      });
  }, [
    agencies,
    categoryFilter,
    roleFilter,
    searchQuery,
    sortOption,
    user?.id,
    workspacesByAgency,
  ]);

  // Check if all currently visible agencies are expanded
  const allExpanded =
    filteredAgencies.length > 0 &&
    filteredAgencies.every((a) => expandedAgencyIds.has(a.id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedAgencyIds(new Set());
    } else {
      setExpandedAgencyIds(new Set(filteredAgencies.map((a) => a.id)));
    }
  };

  const toggleAgencyExpand = (agencyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedAgencyIds((prev) => {
      const next = new Set(prev);
      if (next.has(agencyId)) {
        next.delete(agencyId);
      } else {
        next.add(agencyId);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setRoleFilter("all");
    setSortOption("workspaces_desc");
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("agency.list.title")}
      description={t("agency.list.description")}
      introSummary="Công ty (Agency) là tổ chức cấp cao nhất quản lý toàn bộ các Không gian làm việc (Workspaces), nhân sự chiến dịch và gói đăng ký tài khoản. Bạn có thể là chủ sở hữu hoặc tham gia nhiều Agency cùng lúc."
      guideUrl="/help/guide#agency"
      actions={
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white shadow-xs"
          onClick={() => navigate("/agency/create")}
        >
          <Plus className="size-3.5" />
          {t("agency.list.createButton")}
        </Button>
      }
    >
      {agencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <Building2 className="text-muted-foreground size-10" />
          <div>
            <p className="text-base font-semibold">
              {t("agency.list.emptyTitle")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("agency.list.emptyDescription")}
            </p>
          </div>
          <Button
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white shadow-xs"
            onClick={() => navigate("/agency/create")}
          >
            <Plus className="size-4" />
            {t("agency.list.emptyButton")}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* TOOLBAR: Search, Filters, Sort & Expand All */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("agency.list.searchPlaceholder")}
                  className="pl-9 pr-8 h-9 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Expand All Workspaces Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleExpandAll}
                className={cn(
                  "gap-1.5 text-xs font-medium cursor-pointer shrink-0 transition-colors",
                  allExpanded
                    ? "border-brand-orange/50 bg-brand-orange/10 text-brand-orange"
                    : "text-foreground",
                )}
              >
                <ChevronsUpDown className="size-3.5" />
                {allExpanded
                  ? t("agency.list.collapseAll")
                  : t("agency.list.expandAll")}
              </Button>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-8 text-xs py-0 pr-7"
                    wrapperClassName="w-[150px] sm:w-[170px]"
                  >
                    <option value="">{t("agency.list.filterCategory")}</option>
                    {AGENCY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {t(`agency.category.${c}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Role Filter */}
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                  className="h-8 text-xs py-0 pr-7"
                  wrapperClassName="w-[125px] sm:w-[135px]"
                >
                  <option value="all">{t("agency.list.filterRole")}</option>
                  <option value="owner">{t("agency.list.filterRoleOwner")}</option>
                  <option value="member">{t("agency.list.filterRoleMember")}</option>
                </Select>

                {/* Sort Option */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="h-8 text-xs py-0 pr-7"
                    wrapperClassName="w-[165px] sm:w-[185px]"
                  >
                    <option value="workspaces_desc">{t("agency.list.sortWorkspaces")}</option>
                    <option value="name_asc">{t("agency.list.sortNameAsc")}</option>
                    <option value="name_desc">{t("agency.list.sortNameDesc")}</option>
                    <option value="owner_first">{t("agency.list.sortOwner")}</option>
                    <option value="newest">{t("agency.list.sortNewest")}</option>
                  </Select>
                </div>
              </div>

              {/* Counts & Clear Filter summary */}
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {filteredAgencies.length} / {agencies.length} {t("agency.list.companiesCount", "công ty")}
                </span>
                <span>•</span>
                <span>{workspaces.length} workspace</span>
                {(searchQuery || categoryFilter || roleFilter !== "all") && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-brand-orange hover:underline cursor-pointer font-medium text-xs ml-1"
                  >
                    {t("agency.list.clearFilter")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EMPTY SEARCH RESULTS */}
          {filteredAgencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center bg-card/40">
              <Search className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">
                {t("agency.list.noResults")}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {t("agency.list.noResultsHint", "Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để xem danh sách đầy đủ.")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-2 text-xs cursor-pointer"
              >
                {t("agency.list.clearFilter")}
              </Button>
            </div>
          ) : (
            /* AGENCY CARDS GRID */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {filteredAgencies.map((a) => {
                const LogoIcon = getLogoIcon(a.logoIcon);
                const agencyWorkspaces = workspacesByAgency.get(a.id) || [];
                const isExpanded = expandedAgencyIds.has(a.id);
                const isOwner = a.ownerId === user?.id;

                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      setCurrentAgencyId(a.id);
                      navigate(`/agency/${a.id}`);
                    }}
                    className={cn(
                      "bg-card rounded-xl border border-border p-5 shadow-xs transition-all hover:border-brand-orange/40 flex flex-col cursor-pointer",
                      isExpanded && "ring-1 ring-brand-orange/30 border-brand-orange/40",
                    )}
                  >
                    {/* Header info */}
                    <div className="flex items-start gap-3">
                      {a.logoUrl ? (
                        <img
                          src={a.logoUrl}
                          alt={a.name}
                          className="size-11 shrink-0 rounded-xl object-cover border border-border"
                        />
                      ) : (
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors"
                          style={{
                            backgroundColor: a.brandColor
                              ? `${a.brandColor}18`
                              : "hsl(var(--brand-orange-soft, 15 100% 96%))",
                            color:
                              a.brandColor ??
                              "hsl(var(--brand-orange, 15 88% 55%))",
                          }}
                        >
                          <LogoIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-sm text-foreground">
                            {a.name}
                          </p>
                          {isOwner && (
                            <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold text-brand-orange shrink-0">
                              {t("workspace.roles.OWNER")}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs mt-0.5">
                          {a.tagline || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Category & Size Badges */}
                    {(a.category || a.companySize) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.category && (
                          <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium">
                            {t(`agency.category.${a.category}`)}
                          </span>
                        )}
                        {a.companySize && (
                          <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium">
                            {t(`agency.companySize.${a.companySize}`)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata details */}
                    <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                      {a.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                          <span className="truncate">{a.location}</span>
                        </div>
                      )}
                      {a.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="size-3.5 shrink-0 text-brand-orange" />
                          <span className="truncate">{a.website}</span>
                        </div>
                      )}
                      {a.foundedYear && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0 text-brand-orange" />
                          <span>
                            {t("agency.list.foundedIn", { year: a.foundedYear })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Primary Card Buttons */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer gap-1.5 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAgencyId(a.id);
                          navigate(`/agency/${a.id}`);
                        }}
                      >
                        <Eye className="size-3.5" />
                        {t("agency.list.viewProfile")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer gap-1.5 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAgencyId(a.id);
                          navigate(`/agency/${a.id}/members`);
                        }}
                      >
                        <Users className="size-3.5" />
                        {t("agency.list.manageMembers")}
                      </Button>
                    </div>

                    {/* WORKSPACE EXPANSION TOGGLE */}
                    <div className="mt-4 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAgencyExpand(a.id, e); }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                          isExpanded
                            ? "bg-brand-orange/10 text-brand-orange font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <FolderKanban className="size-3.5" />
                          <span>Không gian làm việc</span>
                          <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold border border-border/80">
                            {agencyWorkspaces.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span>{isExpanded ? "Thu gọn" : "Xem workspace"}</span>
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </div>
                      </button>

                      {/* EXPANDED WORKSPACES LIST */}
                      {isExpanded && (
                        <div className="mt-2 space-y-2 rounded-xl bg-muted/30 p-2.5 border border-border/60">
                          {agencyWorkspaces.length === 0 ? (
                            <div className="py-3 text-center">
                              <p className="text-xs text-muted-foreground italic">
                                {t("agency.list.noWorkspaces")}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/workspaces/create?agencyId=${a.id}`,
                                    )
                                  }
                                  className="mt-2 text-xs h-7 cursor-pointer gap-1 text-brand-orange hover:text-brand-orange"
                                >
                                  <Plus className="size-3" />
                                  {t("agency.list.createWorkspace")}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                {agencyWorkspaces.map((ws) => (
                                  <div
                                    key={ws.id}
                                    onClick={() =>
                                      navigate(`/workspaces/${ws.id}/dashboard`)
                                    }
                                    className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-card p-2 text-xs transition-colors hover:border-brand-orange/50 hover:bg-muted/50 cursor-pointer shadow-2xs group"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {ws.logoUrl ? (
                                        <img
                                          src={ws.logoUrl}
                                          alt={ws.name}
                                          className="size-6 rounded-md object-cover shrink-0 border border-border"
                                        />
                                      ) : (
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-bold">
                                          {ws.name.slice(0, 1).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="truncate font-medium text-foreground group-hover:text-brand-orange transition-colors">
                                        {ws.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {ws.myRole && (
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                                          {ws.myRole}
                                        </span>
                                      )}
                                      <ExternalLink className="size-3 text-muted-foreground group-hover:text-brand-orange transition-colors" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/workspaces/create?agencyId=${a.id}`,
                                    )
                                  }
                                  className="w-full text-[11px] h-7 cursor-pointer text-brand-orange hover:bg-brand-orange/10 font-medium"
                                >
                                  <Plus className="size-3 mr-1" />
                                  {t("agency.list.createWorkspace")}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default AgencyPage;
