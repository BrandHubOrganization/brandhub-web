import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import type { Workspace, MemberRole } from "@/types/workspace";
import type { Agency } from "@/types/agency";

export type SortOption = "name_asc" | "name_desc" | "newest" | "oldest" | "role";
export type RoleFilter = "all" | MemberRole;

const ROLE_PRIORITY: Record<string, number> = {
  OWNER: 4,
  MANAGER: 3,
  CREATOR: 2,
  CLIENT: 1,
};

export function useWorkspaceList() {
  const { t } = useTranslation();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicateSource, setDuplicateSource] = useState<Workspace | null>(null);

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
        toast.error(
          extractErrorMessage(err, t("common.loadFailed", "Tải danh sách thất bại")),
        ),
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
        if (agencyFilter && w.agencyId !== agencyFilter) return false;
        if (roleFilter !== "all" && w.myRole !== roleFilter) return false;
        if (industryFilter && w.industry !== industryFilter) return false;

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
  }, [
    workspaces,
    agencyFilter,
    roleFilter,
    industryFilter,
    searchQuery,
    sortOption,
    agenciesById,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setAgencyFilter("");
    setRoleFilter("all");
    setIndustryFilter("");
    setSortOption("newest");
  };

  const hasActiveFilters = Boolean(
    searchQuery || agencyFilter || roleFilter !== "all" || industryFilter,
  );

  return {
    workspaces,
    agencies,
    loading,
    searchQuery,
    setSearchQuery,
    agencyFilter,
    setAgencyFilter,
    roleFilter,
    setRoleFilter,
    industryFilter,
    setIndustryFilter,
    sortOption,
    setSortOption,
    filteredWorkspaces,
    agenciesById,
    clearAllFilters,
    hasActiveFilters,
    duplicateSource,
    setDuplicateSource,
  };
}
