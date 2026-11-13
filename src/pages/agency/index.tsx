import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Plus,
  Search,
  X,
  FolderKanban,
  Filter,
  ArrowUpDown,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import { useAuthStore } from "@/store/authStore";
import { AGENCY_CATEGORIES } from "@/pages/agency/constants";
import {
  SegmentedHubSwitcher,
  type HubViewMode,
} from "@/pages/agency/components/hub/SegmentedHubSwitcher";
import { AgencyHubCard } from "@/pages/agency/components/hub/AgencyHubCard";
import {
  CustomFilterDropdown,
  HubAdvancedFilterPopover,
  DEFAULT_AGENCY_ADVANCED_FILTERS,
  DEFAULT_WORKSPACE_ADVANCED_FILTERS,
  getAgencyAdvancedFilterCount,
  getWorkspaceAdvancedFilterCount,
  type AgencyAdvancedFilters,
  type WorkspaceAdvancedFilters,
} from "@/pages/agency/components/hub/HubAdvancedFilterPopover";
import { WorkspaceToolbar } from "@/pages/workspace/components/list/WorkspaceToolbar";
import { WorkspaceCardItem } from "@/pages/workspace/components/list/WorkspaceCardItem";
import { WorkspaceEmptyState } from "@/pages/workspace/components/list/WorkspaceEmptyState";
import { DuplicateWorkspaceDialog } from "@/pages/workspace/components/DuplicateWorkspaceDialog";
import { Pagination } from "@/components/ui/pagination";
import type {
  RoleFilter as WsRoleFilter,
  SortOption as WsSortOption,
} from "@/pages/workspace/hooks/useWorkspaceList";
import { cn } from "@/lib/utils";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

type AgencySortOption =
  "name_asc" | "name_desc" | "workspaces_desc" | "owner_first" | "newest";
type AgencyRoleFilter = "all" | "owner" | "member";

const WS_ROLE_PRIORITY: Record<string, number> = {
  OWNER: 4,
  MANAGER: 3,
  CREATOR: 2,
  CLIENT: 1,
};

export interface AgencyHubPageProps {
  defaultTab?: HubViewMode;
}

export function AgencyPage({ defaultTab }: AgencyHubPageProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const user = useAuthStore((s) => s.user);

  // Determine initial view mode from URL query (?tab=...) or pathname (/workspace vs /agency)
  const resolveTabFromUrl = (): HubViewMode => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "workspaces" || tabParam === "agencies") {
      return tabParam;
    }
    if (defaultTab) return defaultTab;
    if (location.pathname.startsWith("/workspace")) return "workspaces";
    return "agencies";
  };

  const [activeTab, setActiveTab] = useState<HubViewMode>(resolveTabFromUrl);

  // Sync activeTab when URL pathname or ?tab= query changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "workspaces" || tabParam === "agencies") {
      setActiveTab(tabParam);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname.startsWith("/workspace")) {
      setActiveTab("workspaces");
    } else {
      setActiveTab("agencies");
    }
  }, [location.pathname, searchParams, defaultTab]);

  // ── Agency Tab Filter & Sort State ──
  const [agencySearch, setAgencySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [agencyRoleFilter, setAgencyRoleFilter] =
    useState<AgencyRoleFilter>("all");
  const [agencySort, setAgencySort] =
    useState<AgencySortOption>("workspaces_desc");
  const [agencyAdvFilters, setAgencyAdvFilters] =
    useState<AgencyAdvancedFilters>(DEFAULT_AGENCY_ADVANCED_FILTERS);
  const [expandedAgencyIds, setExpandedAgencyIds] = useState<Set<string>>(
    new Set(),
  );

  // ── Workspace Tab Filter & Sort State ──
  const [wsSearch, setWsSearch] = useState("");
  const [wsAgencyFilter, setWsAgencyFilter] = useState<string>(
    () => searchParams.get("agencyId") || "",
  );
  const [wsRoleFilter, setWsRoleFilter] = useState<WsRoleFilter>("all");
  const [wsIndustryFilter, setWsIndustryFilter] = useState<string>("");
  const [wsSort, setWsSort] = useState<WsSortOption>("newest");
  const [wsAdvFilters, setWsAdvFilters] = useState<WorkspaceAdvancedFilters>(
    DEFAULT_WORKSPACE_ADVANCED_FILTERS,
  );
  const [duplicateSource, setDuplicateSource] = useState<Workspace | null>(
    null,
  );

  useEffect(() => {
    Promise.all([
      agencyService.list().catch(() => ({ data: { data: [] } })),
      workspaceService.list().catch(() => ({ data: { data: [] } })),
    ])
      .then(([agencyRes, workspaceRes]) => {
        const agencyList = agencyRes.data.data ?? [];
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

  const handleTabChange = (nextTab: HubViewMode) => {
    setActiveTab(nextTab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  const handleFilterWorkspacesByAgency = (agencyId: string) => {
    setWsAgencyFilter(agencyId);
    setActiveTab("workspaces");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "workspaces");
    if (agencyId) {
      nextParams.set("agencyId", agencyId);
    } else {
      nextParams.delete("agencyId");
    }
    setSearchParams(nextParams, { replace: true });
  };

  // Lookup map for agencies by ID
  const agenciesById = useMemo(() => {
    const map = new Map<string, Agency>();
    agencies.forEach((a) => map.set(a.id, a));
    return map;
  }, [agencies]);

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

  // Filtered & Sorted Agencies
  const filteredAgencies = useMemo(() => {
    return agencies
      .filter((a) => {
        if (categoryFilter && a.category !== categoryFilter) return false;

        const isOwner = a.ownerId === user?.id;
        if (agencyRoleFilter === "owner" && !isOwner) return false;
        if (agencyRoleFilter === "member" && isOwner) return false;

        if (
          agencyAdvFilters.companySize &&
          a.companySize !== agencyAdvFilters.companySize
        ) {
          return false;
        }

        const agencyWorkspaces = workspacesByAgency.get(a.id) || [];
        const wsCount = agencyWorkspaces.length;
        if (
          agencyAdvFilters.workspaceScale === "has_workspaces" &&
          wsCount === 0
        ) {
          return false;
        }
        if (agencyAdvFilters.workspaceScale === "empty" && wsCount > 0) {
          return false;
        }
        if (agencyAdvFilters.workspaceScale === "3_plus" && wsCount < 3) {
          return false;
        }

        if (agencyAdvFilters.hasWebsite === "with_website" && !a.website) {
          return false;
        }
        if (agencyAdvFilters.hasWebsite === "verified_tax") {
          const hasTaxOrContact = Boolean(
            (a as { taxId?: string | null }).taxId || (a.phone && a.location),
          );
          if (!hasTaxOrContact) return false;
        }

        if (agencySearch.trim()) {
          const q = agencySearch.trim().toLowerCase();
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
        if (agencySort === "name_asc") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (agencySort === "name_desc") {
          return b.name.localeCompare(a.name, "vi");
        }
        if (agencySort === "workspaces_desc") {
          const countA = workspacesByAgency.get(a.id)?.length || 0;
          const countB = workspacesByAgency.get(b.id)?.length || 0;
          return countB - countA;
        }
        if (agencySort === "owner_first") {
          const isOwnerA = a.ownerId === user?.id ? 1 : 0;
          const isOwnerB = b.ownerId === user?.id ? 1 : 0;
          if (isOwnerA !== isOwnerB) return isOwnerB - isOwnerA;
          return a.name.localeCompare(b.name, "vi");
        }
        const yearA = a.foundedYear || 0;
        const yearB = b.foundedYear || 0;
        return yearB - yearA;
      });
  }, [
    agencies,
    categoryFilter,
    agencyRoleFilter,
    agencyAdvFilters,
    agencySearch,
    agencySort,
    user?.id,
    workspacesByAgency,
  ]);

  // Filtered & Sorted Workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces
      .filter((w) => {
        if (wsAgencyFilter && w.agencyId !== wsAgencyFilter) return false;
        if (wsRoleFilter !== "all" && w.myRole !== wsRoleFilter) return false;
        if (wsIndustryFilter && w.industry !== wsIndustryFilter) return false;

        if (
          wsAdvFilters.companySize &&
          w.companySize !== wsAdvFilters.companySize
        ) {
          return false;
        }

        if (wsAdvFilters.packageStatus === "APPROVED") {
          if (w.packageNegotiationStatus !== "APPROVED") return false;
        } else if (wsAdvFilters.packageStatus === "NEGOTIATING") {
          const isNegotiating =
            w.packageNegotiationStatus === "DRAFT" ||
            w.packageNegotiationStatus === "CLIENT_REQUESTED_CHANGE" ||
            w.packageNegotiationStatus === "AGENCY_COUNTERED";
          if (!isNegotiating) return false;
        } else if (wsAdvFilters.packageStatus === "NONE") {
          if (w.packageNegotiationStatus || w.workspaceMediaPackageId) {
            return false;
          }
        }

        if (wsAdvFilters.hasWebsite === "with_website" && !w.website) {
          return false;
        }

        if (wsSearch.trim()) {
          const q = wsSearch.trim().toLowerCase();
          const parentAgency = w.agencyId ? agenciesById.get(w.agencyId) : null;
          const agencyName = parentAgency?.name?.toLowerCase() || "";
          const name = w.name?.toLowerCase() || "";
          const tagline = w.tagline?.toLowerCase() || "";
          const description = w.description?.toLowerCase() || "";
          const location = w.location?.toLowerCase() || "";
          const industry = w.industry?.toLowerCase() || "";

          const matches =
            name.includes(q) ||
            tagline.includes(q) ||
            description.includes(q) ||
            location.includes(q) ||
            industry.includes(q) ||
            agencyName.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (wsSort === "name_asc") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (wsSort === "name_desc") {
          return b.name.localeCompare(a.name, "vi");
        }
        if (wsSort === "newest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
        if (wsSort === "oldest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        }
        if (wsSort === "role") {
          const pA = WS_ROLE_PRIORITY[a.myRole || ""] || 0;
          const pB = WS_ROLE_PRIORITY[b.myRole || ""] || 0;
          if (pA !== pB) return pB - pA;
          return a.name.localeCompare(b.name, "vi");
        }
        return 0;
      });
  }, [
    workspaces,
    wsAgencyFilter,
    wsRoleFilter,
    wsIndustryFilter,
    wsAdvFilters,
    wsSearch,
    wsSort,
    agenciesById,
  ]);

  const totalWorkspacesInFilteredAgencies = useMemo(() => {
    return filteredAgencies.reduce(
      (sum, a) => sum + (workspacesByAgency.get(a.id)?.length || 0),
      0,
    );
  }, [filteredAgencies, workspacesByAgency]);

  // Pagination for Agencies & Workspaces
  const [agencyPage, setAgencyPage] = useState(1);
  const [agencyPageSize, setAgencyPageSize] = useState(6);
  const [wsPage, setWsPage] = useState(1);
  const [wsPageSize, setWsPageSize] = useState(6);

  useEffect(() => {
    setAgencyPage(1);
  }, [agencySearch, categoryFilter, agencyRoleFilter, agencySort, agencyAdvFilters]);

  useEffect(() => {
    setWsPage(1);
  }, [wsSearch, wsAgencyFilter, wsRoleFilter, wsIndustryFilter, wsSort, wsAdvFilters]);

  const totalAgencyPages = Math.max(1, Math.ceil(filteredAgencies.length / agencyPageSize));
  const safeAgencyPage = Math.min(Math.max(1, agencyPage), totalAgencyPages);
  const paginatedAgencies = useMemo(() => {
    const start = (safeAgencyPage - 1) * agencyPageSize;
    return filteredAgencies.slice(start, start + agencyPageSize);
  }, [filteredAgencies, safeAgencyPage, agencyPageSize]);

  const totalWsPages = Math.max(1, Math.ceil(filteredWorkspaces.length / wsPageSize));
  const safeWsPage = Math.min(Math.max(1, wsPage), totalWsPages);
  const paginatedWorkspaces = useMemo(() => {
    const start = (safeWsPage - 1) * wsPageSize;
    return filteredWorkspaces.slice(start, start + wsPageSize);
  }, [filteredWorkspaces, safeWsPage, wsPageSize]);

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

  const clearAgencyFilters = () => {
    setAgencySearch("");
    setCategoryFilter("");
    setAgencyRoleFilter("all");
    setAgencySort("workspaces_desc");
    setAgencyAdvFilters(DEFAULT_AGENCY_ADVANCED_FILTERS);
  };

  const clearWorkspaceFilters = () => {
    setWsSearch("");
    setWsAgencyFilter("");
    setWsRoleFilter("all");
    setWsIndustryFilter("");
    setWsSort("newest");
    setWsAdvFilters(DEFAULT_WORKSPACE_ADVANCED_FILTERS);
    if (searchParams.has("agencyId")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("agencyId");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const agencyAdvFilterCount = getAgencyAdvancedFilterCount(agencyAdvFilters);
  const wsAdvFilterCount = getWorkspaceAdvancedFilterCount(wsAdvFilters);

  const hasActiveAgencyFilters = Boolean(
    agencySearch ||
    categoryFilter ||
    agencyRoleFilter !== "all" ||
    agencyAdvFilterCount > 0,
  );

  const hasActiveWsFilters = Boolean(
    wsSearch ||
    wsAgencyFilter ||
    wsRoleFilter !== "all" ||
    wsIndustryFilter ||
    wsAdvFilterCount > 0,
  );

  const agencyCategoryOptions = useMemo(
    () => [
      {
        value: "",
        label: t("agency.list.filterCategory", "Tất cả ngành nghề"),
      },
      ...AGENCY_CATEGORIES.map((c) => ({
        value: c,
        label: t(`agency.category.${c}`, c),
      })),
    ],
    [t],
  );

  const agencyRoleOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("agency.list.filterRole", "Tất cả vai trò"),
      },
      {
        value: "owner",
        label: t("agency.list.filterRoleOwner", "Công ty tôi sở hữu"),
      },
      {
        value: "member",
        label: t("agency.list.filterRoleMember", "Công ty tham gia"),
      },
    ],
    [t],
  );

  const agencySortOptions = useMemo(
    () => [
      {
        value: "workspaces_desc",
        label: t("agency.list.sortWorkspaces", "Nhiều Workspace nhất"),
      },
      {
        value: "name_asc",
        label: t("agency.list.sortNameAsc", "Tên: A → Z"),
      },
      {
        value: "name_desc",
        label: t("agency.list.sortNameDesc", "Tên: Z → A"),
      },
      {
        value: "owner_first",
        label: t("agency.list.sortOwner", "Chủ sở hữu trước"),
      },
      {
        value: "newest",
        label: t("agency.list.sortNewest", "Mới nhất"),
      },
    ],
    [t],
  );

  if (loading) return null;

  const isAgencyView = activeTab === "agencies";
  const selectedFilterAgency = wsAgencyFilter
    ? agenciesById.get(wsAgencyFilter)
    : undefined;

  return (
    <PageWrapper
      title={
        isAgencyView
          ? t("agency.list.title", "Công ty (Agency)")
          : t("workspace.list.title", "Danh sách workspace")
      }
      description={
        isAgencyView
          ? t(
              "agency.list.description",
              "Quản lý các công ty của bạn và theo dõi các không gian làm việc trực thuộc.",
            )
          : t(
              "workspace.list.description",
              "Quản lý và truy cập các không gian làm việc (workspace) của bạn trên các công ty.",
            )
      }
      bannerBadge={t("agency.list.hubTitle", "Công ty & Không gian làm việc")}
      bannerIcon={
        isAgencyView ? (
          <Building2 className="size-3" />
        ) : (
          <FolderKanban className="size-3" />
        )
      }
      guideUrl={isAgencyView ? "/help/guide#agency" : "/help/guide#workspace"}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isAgencyView ? "default" : "outline"}
            className={cn(
              "cursor-pointer gap-1.5 text-xs shadow-xs",
              isAgencyView
                ? "bg-brand-orange hover:bg-brand-orange/90 text-white"
                : "bg-background/80 hover:border-brand-orange/40 hover:text-brand-orange",
            )}
            onClick={() => navigate("/agency/create")}
          >
            <Plus className="size-3.5" />
            {t("agency.list.createButton", "Tạo công ty")}
          </Button>
          <Button
            variant={!isAgencyView ? "default" : "outline"}
            className={cn(
              "cursor-pointer gap-1.5 text-xs shadow-xs",
              !isAgencyView
                ? "bg-brand-orange hover:bg-brand-orange/90 text-white"
                : "bg-background/80 hover:border-brand-orange/40 hover:text-brand-orange",
            )}
            onClick={() =>
              navigate(
                currentAgencyId
                  ? `/workspaces/create?agencyId=${encodeURIComponent(currentAgencyId)}`
                  : "/workspaces/create",
              )
            }
          >
            <Plus className="size-3.5" />
            {t("workspace.list.createButton", "Tạo workspace mới")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── UNIFIED HUB SWITCHER BAR ── */}
        <div className="border-border bg-card/80 flex flex-col justify-between gap-3 rounded-xl border px-4 py-3 shadow-2xs sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedHubSwitcher
              activeTab={activeTab}
              onChange={handleTabChange}
              agencyCount={agencies.length}
              workspaceCount={workspaces.length}
            />
            {!isAgencyView && selectedFilterAgency && (
              <div className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                <Building2 className="size-3.5 shrink-0" />
                <span>
                  {t("workspace.list.belongsToAgencyLabel", "Thuộc công ty:")}{" "}
                  <strong className="font-semibold">
                    {selectedFilterAgency.name ||
                      t("workspace.list.allAgencies", "Tất cả công ty")}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setWsAgencyFilter("")}
                  className="hover:bg-brand-orange/20 ml-1 cursor-pointer rounded-full p-0.5"
                  title={t("workspace.list.clearFilter", "Xóa bộ lọc")}
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── TAB CONTENT: AGENCIES OR WORKSPACES ── */}
        <AnimatePresence mode="wait">
          {isAgencyView ? (
            <motion.div
              key="hub-agencies-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-5"
            >
              {agencies.length === 0 ? (
                <div className="bg-card/40 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
                  <div className="bg-brand-orange/10 text-brand-orange flex size-14 items-center justify-center rounded-2xl">
                    <Building2 className="size-7" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">
                      {t("agency.list.emptyTitle")}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t("agency.list.emptyDescription")}
                    </p>
                  </div>
                  <Button
                    className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white shadow-xs"
                    onClick={() => navigate("/agency/create")}
                  >
                    <Plus className="size-4" />
                    {t("agency.list.emptyButton")}
                  </Button>
                </div>
              ) : (
                <>
                  {/* AGENCY TOOLBAR: Search, Custom Dropdown Filters, Sort & Advanced Filter Popover */}
                  <div className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-xs">
                    <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
                      <div className="relative flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                          value={agencySearch}
                          onChange={(e) => setAgencySearch(e.target.value)}
                          placeholder={t("agency.list.searchPlaceholder")}
                          className="h-9 pr-8 pl-9 text-xs"
                        />
                        {agencySearch && (
                          <button
                            type="button"
                            onClick={() => setAgencySearch("")}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-border/60 flex flex-wrap items-center justify-between gap-2.5 border-t pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CustomFilterDropdown
                          value={categoryFilter}
                          onChange={setCategoryFilter}
                          options={agencyCategoryOptions}
                          defaultValue=""
                          icon={<Filter className="size-3.5" />}
                          className="w-[155px] sm:w-[175px]"
                        />

                        <CustomFilterDropdown
                          value={agencyRoleFilter}
                          onChange={(val) =>
                            setAgencyRoleFilter(val as AgencyRoleFilter)
                          }
                          options={agencyRoleOptions}
                          defaultValue="all"
                          icon={<Shield className="size-3.5" />}
                          className="w-[140px] sm:w-[160px]"
                        />

                        <CustomFilterDropdown
                          value={agencySort}
                          onChange={(val) =>
                            setAgencySort(val as AgencySortOption)
                          }
                          options={agencySortOptions}
                          defaultValue="workspaces_desc"
                          icon={<ArrowUpDown className="size-3.5" />}
                          className="w-[180px] sm:w-[205px]"
                        />

                        <HubAdvancedFilterPopover
                          mode="agencies"
                          filters={agencyAdvFilters}
                          onChange={setAgencyAdvFilters}
                          onReset={() =>
                            setAgencyAdvFilters(DEFAULT_AGENCY_ADVANCED_FILTERS)
                          }
                        />
                      </div>

                      <div className="text-muted-foreground flex items-center gap-2.5 text-xs">
                        <span className="text-foreground/80 font-medium">
                          {filteredAgencies.length} / {agencies.length}{" "}
                          {t("agency.list.companiesCount", "công ty")}
                        </span>
                        <span>•</span>
                        <span>
                          {t("agency.list.totalWorkspacesCount", {
                            count: totalWorkspacesInFilteredAgencies,
                            defaultValue: "{{count}} workspace",
                          })}
                        </span>
                        {hasActiveAgencyFilters && (
                          <button
                            type="button"
                            onClick={clearAgencyFilters}
                            className="text-brand-orange ml-1 cursor-pointer text-xs font-medium hover:underline"
                          >
                            {t("agency.list.clearFilter")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Advanced Filter Chips */}
                    {agencyAdvFilterCount > 0 && (
                      <div className="border-border/50 flex flex-wrap items-center gap-1.5 border-t pt-2">
                        <span className="text-muted-foreground mr-1 text-[11px]">
                          {t("agency.list.activeFiltersLabel", "Đang lọc:")}
                        </span>
                        {agencyAdvFilters.companySize !== "" && (
                          <span className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                            {t(
                              `agency.companySize.${agencyAdvFilters.companySize}`,
                              agencyAdvFilters.companySize,
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setAgencyAdvFilters((prev) => ({
                                  ...prev,
                                  companySize: "",
                                }))
                              }
                              className="hover:bg-brand-orange/20 ml-0.5 cursor-pointer rounded-full p-0.5"
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        )}
                        {agencyAdvFilters.workspaceScale !== "all" && (
                          <span className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                            {agencyAdvFilters.workspaceScale ===
                            "has_workspaces"
                              ? t(
                                  "agency.list.scaleHasWorkspaces",
                                  "Có workspace (>0)",
                                )
                              : agencyAdvFilters.workspaceScale === "empty"
                                ? t(
                                    "agency.list.scaleEmpty",
                                    "Chưa có workspace (0)",
                                  )
                                : t(
                                    "agency.list.scaleThreePlus",
                                    "Từ 3+ workspace",
                                  )}
                            <button
                              type="button"
                              onClick={() =>
                                setAgencyAdvFilters((prev) => ({
                                  ...prev,
                                  workspaceScale: "all",
                                }))
                              }
                              className="hover:bg-brand-orange/20 ml-0.5 cursor-pointer rounded-full p-0.5"
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        )}
                        {agencyAdvFilters.hasWebsite !== "all" && (
                          <span className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                            {agencyAdvFilters.hasWebsite === "with_website"
                              ? t(
                                  "agency.list.completenessWithWebsite",
                                  "Có Website",
                                )
                              : t(
                                  "agency.list.completenessVerifiedTax",
                                  "Có MST / Liên hệ",
                                )}
                            <button
                              type="button"
                              onClick={() =>
                                setAgencyAdvFilters((prev) => ({
                                  ...prev,
                                  hasWebsite: "all",
                                }))
                              }
                              className="hover:bg-brand-orange/20 ml-0.5 cursor-pointer rounded-full p-0.5"
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AGENCY CARDS GRID */}
                  {filteredAgencies.length === 0 ? (
                    <div className="border-border bg-card/40 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center">
                      <Search className="text-muted-foreground/60 size-8" />
                      <p className="text-foreground text-sm font-semibold">
                        {t("agency.list.noResults")}
                      </p>
                      <p className="text-muted-foreground max-w-sm text-xs">
                        {t(
                          "agency.list.noResultsHint",
                          "Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để xem danh sách đầy đủ.",
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAgencyFilters}
                        className="mt-2 cursor-pointer text-xs"
                      >
                        {t("agency.list.clearFilter")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedAgencies.map((a) => (
                          <AgencyHubCard
                            key={a.id}
                            agency={a}
                            workspaces={workspacesByAgency.get(a.id) || []}
                            isExpanded={expandedAgencyIds.has(a.id)}
                            isOwner={a.ownerId === user?.id}
                            onToggleExpand={toggleAgencyExpand}
                            onSelectAgency={setCurrentAgencyId}
                            onFilterWorkspacesByAgency={
                              handleFilterWorkspacesByAgency
                            }
                          />
                        ))}
                      </div>

                      {filteredAgencies.length > 0 && (
                        <Pagination
                          page={safeAgencyPage}
                          size={agencyPageSize}
                          total={filteredAgencies.length}
                          totalPages={totalAgencyPages}
                          pageSizeOptions={[6, 9, 12, 18]}
                          itemLabel={t("agency.hub.agencyItemLabel", "công ty")}
                          onPageChange={setAgencyPage}
                          onSizeChange={(size) => {
                            setAgencyPageSize(size);
                            setAgencyPage(1);
                          }}
                          className="pt-2"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="hub-workspaces-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-5"
            >
              {workspaces.length === 0 ? (
                <WorkspaceEmptyState type="no_workspaces" />
              ) : (
                <>
                  <WorkspaceToolbar
                    searchQuery={wsSearch}
                    onSearchChange={setWsSearch}
                    agencyFilter={wsAgencyFilter}
                    onAgencyChange={setWsAgencyFilter}
                    roleFilter={wsRoleFilter}
                    onRoleChange={setWsRoleFilter}
                    industryFilter={wsIndustryFilter}
                    onIndustryChange={setWsIndustryFilter}
                    sortOption={wsSort}
                    onSortChange={setWsSort}
                    advancedFilters={wsAdvFilters}
                    onAdvancedFiltersChange={setWsAdvFilters}
                    agencies={agencies}
                    workspaces={workspaces}
                    filteredCount={filteredWorkspaces.length}
                    totalCount={workspaces.length}
                    hasActiveFilters={hasActiveWsFilters}
                    onClearFilters={clearWorkspaceFilters}
                  />

                  {filteredWorkspaces.length === 0 ? (
                    <WorkspaceEmptyState
                      type="no_results"
                      onClearFilters={clearWorkspaceFilters}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedWorkspaces.map((ws) => (
                          <WorkspaceCardItem
                            key={ws.id}
                            workspace={ws}
                            parentAgency={
                              ws.agencyId ? agenciesById.get(ws.agencyId) : null
                            }
                            currentUserId={user?.id}
                            onDuplicate={setDuplicateSource}
                            onFilterByAgency={(agencyId) =>
                              setWsAgencyFilter(agencyId)
                            }
                          />
                        ))}
                      </div>

                      {filteredWorkspaces.length > 0 && (
                        <Pagination
                          page={safeWsPage}
                          size={wsPageSize}
                          total={filteredWorkspaces.length}
                          totalPages={totalWsPages}
                          pageSizeOptions={[6, 9, 12, 18]}
                          itemLabel={t("workspace.list.itemLabel", "không gian làm việc")}
                          onPageChange={setWsPage}
                          onSizeChange={(size) => {
                            setWsPageSize(size);
                            setWsPage(1);
                          }}
                          className="pt-2"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duplicate Workspace Dialog */}
      {duplicateSource && (
        <DuplicateWorkspaceDialog
          source={duplicateSource}
          onClose={() => setDuplicateSource(null)}
        />
      )}
    </PageWrapper>
  );
}

export default AgencyPage;
