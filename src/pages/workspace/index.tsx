import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Briefcase,
  Building2,
  Calendar,
  Filter,
  Globe,
  LayoutDashboard,
  MapPin,
  Plus,
  Search,
  Settings,
  Users,
  X,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import type { Workspace, MemberRole } from "@/types/workspace";
import type { Agency } from "@/types/agency";

type SortOption = "name_asc" | "name_desc" | "newest" | "oldest" | "role";
type RoleFilter = "all" | MemberRole;

const ROLE_PRIORITY: Record<string, number> = {
  OWNER: 4,
  MANAGER: 3,
  CREATOR: 2,
  CLIENT: 1,
};

export function WorkspacePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    Promise.all([
      workspaceService.list(),
      agencyService.list().catch(() => ({ data: { data: [] } })),
    ])
      .then(([wsRes, agencyRes]) => {
        setWorkspaces(wsRes.data.data ?? []);
        setAgencies(agencyRes.data.data ?? []);
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed", "Tải danh sách thất bại"))),
      )
      .finally(() => setLoading(false));
  }, [t]);

  // Lookup map for agencies by ID
  const agenciesById = useMemo(() => {
    const map = new Map<string, Agency>();
    agencies.forEach((a) => map.set(a.id, a));
    return map;
  }, [agencies]);

  // Filtered & Sorted Workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces
      .filter((w) => {
        // 1. Agency filter
        if (agencyFilter && w.agencyId !== agencyFilter) return false;

        // 2. Role filter
        if (roleFilter !== "all" && w.myRole !== roleFilter) return false;

        // 3. Industry filter
        if (industryFilter && w.industry !== industryFilter) return false;

        // 4. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
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
        if (sortOption === "name_asc") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (sortOption === "name_desc") {
          return b.name.localeCompare(a.name, "vi");
        }
        if (sortOption === "newest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
        if (sortOption === "oldest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        }
        if (sortOption === "role") {
          const pA = ROLE_PRIORITY[a.myRole || ""] || 0;
          const pB = ROLE_PRIORITY[b.myRole || ""] || 0;
          if (pA !== pB) return pB - pA;
          return a.name.localeCompare(b.name, "vi");
        }
        return 0;
      });
  }, [workspaces, agencyFilter, roleFilter, industryFilter, searchQuery, sortOption, agenciesById]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setAgencyFilter("");
    setRoleFilter("all");
    setIndustryFilter("");
    setSortOption("newest");
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.list.title", "Danh sách workspace")}
      description={t("workspace.list.description", "Quản lý và truy cập các không gian làm việc (workspace) của bạn trên các công ty.")}
      introSummary="Không gian làm việc (Workspace) là đơn vị cốt lõi đại diện cho một thương hiệu hoặc chiến dịch. Mỗi workspace chứa lịch nội dung riêng, thư viện bài viết và danh sách cộng tác viên/khách hàng độc lập."
      guideUrl="/help/guide#workspace"
      actions={
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white shadow-xs"
          onClick={() => navigate("/workspaces/create")}
        >
          <Plus className="size-3.5" />
          {t("workspace.list.createButton", "Tạo workspace mới")}
        </Button>
      }
    >
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
            <Briefcase className="size-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {t("workspace.list.emptyTitle", "Chưa có workspace nào")}
            </p>
            <p className="text-muted-foreground text-xs mt-1 max-w-sm">
              {t("workspace.list.emptyDescription", "Bạn chưa tham gia không gian làm việc nào. Hãy tạo workspace mới để bắt đầu.")}
            </p>
          </div>
          <Button
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white shadow-xs text-xs"
            onClick={() => navigate("/workspaces/create")}
          >
            <Plus className="size-3.5" />
            {t("workspace.list.createButton", "Tạo workspace mới")}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* TOOLBAR: Search, Filters, Sort */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("workspace.list.searchPlaceholder", "Tìm kiếm workspace theo tên, công ty, ngành nghề...")}
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
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-2">
                {/* Agency/Company Filter */}
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                    className="h-8 text-xs py-0 pr-7"
                    wrapperClassName="w-[150px] sm:w-[170px]"
                  >
                    <option value="">{t("workspace.list.filterAgency", "Tất cả công ty")}</option>
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Role Filter */}
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                  className="h-8 text-xs py-0 pr-7"
                  wrapperClassName="w-[130px] sm:w-[145px]"
                >
                  <option value="all">{t("workspace.list.filterRole", "Tất cả vai trò")}</option>
                  <option value="OWNER">{t("workspace.roles.OWNER", "Chủ sở hữu")}</option>
                  <option value="MANAGER">{t("workspace.roles.MANAGER", "Quản lý")}</option>
                  <option value="CREATOR">{t("workspace.roles.CREATOR", "Sáng tạo")}</option>
                  <option value="CLIENT">{t("workspace.roles.CLIENT", "Khách hàng")}</option>
                </Select>

                {/* Industry Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="h-8 text-xs py-0 pr-7"
                    wrapperClassName="w-[150px] sm:w-[170px]"
                  >
                    <option value="">{t("workspace.list.filterIndustry", "Tất cả ngành nghề")}</option>
                    {WORKSPACE_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {t(`workspace.industry.${ind}`, ind)}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="h-8 text-xs py-0 pr-7"
                    wrapperClassName="w-[155px] sm:w-[175px]"
                  >
                    <option value="newest">{t("workspace.list.sortNewest", "Mới nhất")}</option>
                    <option value="oldest">{t("workspace.list.sortOldest", "Cũ nhất")}</option>
                    <option value="name_asc">{t("workspace.list.sortNameAsc", "Tên A → Z")}</option>
                    <option value="name_desc">{t("workspace.list.sortNameDesc", "Tên Z → A")}</option>
                    <option value="role">{t("workspace.list.sortRole", "Ưu tiên Owner")}</option>
                  </Select>
                </div>
              </div>

              {/* Counts & Clear Filter summary */}
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {filteredWorkspaces.length} / {workspaces.length}{" "}
                  {t("workspace.list.workspacesCount", "workspace")}
                </span>
                <span>•</span>
                <span>
                  {agencies.length} {t("agency.list.companiesCount", "công ty")}
                </span>
                {(searchQuery || agencyFilter || roleFilter !== "all" || industryFilter) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-brand-orange hover:underline cursor-pointer font-medium text-xs ml-1"
                  >
                    {t("workspace.list.clearFilter", "Xóa bộ lọc")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EMPTY SEARCH RESULTS */}
          {filteredWorkspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center bg-card/40">
              <Search className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">
                {t("workspace.list.noResults", "Không tìm thấy workspace nào")}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {t(
                  "workspace.list.noResultsHint",
                  "Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để xem danh sách đầy đủ.",
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-2 text-xs cursor-pointer"
              >
                {t("workspace.list.clearFilter", "Xóa bộ lọc")}
              </Button>
            </div>
          ) : (
            /* WORKSPACE CARDS GRID */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {filteredWorkspaces.map((ws) => {
                const brandColor = ws.brandColor || "#f05a28";
                const LogoIcon = getLogoIcon(ws.logoIcon);
                const parentAgency = ws.agencyId ? agenciesById.get(ws.agencyId) : null;
                const canManage = ws.myRole === "OWNER" || ws.myRole === "MANAGER";

                return (
                  <div
                    key={ws.id}
                    onClick={() => navigate(`/workspaces/${ws.id}/dashboard`)}
                    className="group bg-card rounded-xl border border-border overflow-hidden shadow-xs transition-all duration-200 hover:border-brand-orange/40 hover:shadow-md flex flex-col cursor-pointer"
                  >
                    {/* Top Cover Banner */}
                    <div className="relative h-28 w-full shrink-0 overflow-hidden bg-muted/40">
                      {ws.bannerUrl ? (
                        <img
                          src={ws.bannerUrl}
                          alt=""
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                        />
                      ) : (
                        <div
                          className="size-full select-none"
                          style={{
                            background: brandColor
                              ? `linear-gradient(135deg, ${brandColor}38 0%, ${brandColor}15 50%, ${brandColor}08 100%)`
                              : "linear-gradient(135deg, hsl(var(--muted)/0.7) 0%, hsl(var(--muted)/0.25) 100%)",
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                      {/* Header info */}
                      <div>
                        {/* Overlapping Avatar + Role */}
                        <div className="relative -mt-8 mb-3 flex items-end justify-between gap-3">
                          {ws.logoUrl ? (
                            <img
                              src={ws.logoUrl}
                              alt={ws.name}
                              className="size-16 shrink-0 rounded-2xl object-cover border-4 border-card bg-card shadow-md transition-transform duration-300 group-hover:scale-102"
                            />
                          ) : (
                            <div
                              className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-base font-bold border-4 border-card shadow-md select-none transition-transform duration-300 group-hover:scale-102 text-white"
                              style={{
                                backgroundColor: brandColor || "#f05a28",
                                color: "#ffffff",
                              }}
                            >
                              {ws.logoIcon ? (
                                <LogoIcon className="size-6 text-white" />
                              ) : (
                                ws.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                          )}

                          {ws.myRole && (
                            <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-[11px] font-semibold text-brand-orange shrink-0 border border-brand-orange/20 shadow-2xs">
                              {t(`workspace.roles.${ws.myRole}`, ws.myRole)}
                            </span>
                          )}
                        </div>

                        {/* Title & Tagline */}
                        <div>
                          <h3
                            className="truncate font-semibold text-sm sm:text-base text-foreground group-hover:text-brand-orange transition-colors"
                          >
                            {ws.name}
                          </h3>
                          <p className="text-muted-foreground truncate text-xs mt-1">
                            {ws.tagline || ws.description || "—"}
                          </p>
                        </div>

                        {/* Parent Company (Agency) Tag */}
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="size-3.5 shrink-0 text-brand-orange" />
                          <span className="truncate">
                            {parentAgency ? (
                              <span
                                onClick={(e) => { e.stopPropagation(); navigate(`/agency/${parentAgency.id}`); }}
                                className="hover:text-foreground transition-colors cursor-pointer font-medium"
                              >
                                {parentAgency.name}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/70">
                                {t("workspace.list.unassignedAgency", "Chưa gán công ty")}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Industry & Size Badges */}
                        {(ws.industry || ws.companySize) && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {ws.industry && (
                              <span className="bg-brand-orange/10 text-brand-orange text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-brand-orange/15">
                                {t(`workspace.industry.${ws.industry}`, ws.industry)}
                              </span>
                            )}
                            {ws.companySize && (
                              <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-border/50">
                                {t(`agency.companySize.${ws.companySize}`, ws.companySize)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Metadata details */}
                        <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                          {ws.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                              <span className="truncate">{ws.location}</span>
                            </div>
                          )}
                          {ws.website && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="size-3.5 shrink-0 text-brand-orange" />
                              <a
                                href={ws.website.startsWith("http") ? ws.website : `https://${ws.website}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="truncate hover:underline hover:text-foreground"
                              >
                                {ws.website}
                              </a>
                            </div>
                          )}
                          {ws.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 shrink-0 text-brand-orange" />
                              <span>
                                {t("workspace.list.createdAt", {
                                  date: new Date(ws.createdAt).toLocaleDateString(
                                    i18n.language === "vi" ? "vi-VN" : "en-US",
                                    { year: "numeric", month: "long" },
                                  ),
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div
                        className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 cursor-pointer gap-1.5 text-xs h-8.5 hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/[0.04]"
                          onClick={() => navigate(`/workspaces/${ws.id}/dashboard`)}
                        >
                          <LayoutDashboard className="size-3.5" />
                          {t("workspace.list.enterDashboard", "Vào Dashboard")}
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              title={t("workspace.list.settings", "Cài đặt")}
                              className="size-8.5 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              onClick={() => navigate(`/workspaces/${ws.id}/settings`)}
                            >
                              <Settings className="size-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title={t("workspace.list.membersButton", "Thành viên")}
                              className="size-8.5 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              onClick={() => navigate(`/workspaces/${ws.id}/members`)}
                            >
                              <Users className="size-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
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

export default WorkspacePage;
