import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceList } from "./hooks/useWorkspaceList";
import { WorkspaceToolbar } from "./components/list/WorkspaceToolbar";
import { WorkspaceCardItem } from "./components/list/WorkspaceCardItem";
import { WorkspaceEmptyState } from "./components/list/WorkspaceEmptyState";
import { DuplicateWorkspaceDialog } from "./components/DuplicateWorkspaceDialog";

export function WorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const {
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
  } = useWorkspaceList();

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.list.title", "Danh sách workspace")}
      description={t(
        "workspace.list.description",
        "Quản lý và truy cập các không gian làm việc (workspace) của bạn trên các công ty.",
      )}
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
        <WorkspaceEmptyState type="no_workspaces" />
      ) : (
        <div className="space-y-5">
          {/* TOOLBAR: Search, Filters, Sort */}
          <WorkspaceToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            agencyFilter={agencyFilter}
            onAgencyChange={setAgencyFilter}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
            industryFilter={industryFilter}
            onIndustryChange={setIndustryFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            agencies={agencies}
            filteredCount={filteredWorkspaces.length}
            totalCount={workspaces.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />

          {/* EMPTY SEARCH RESULTS */}
          {filteredWorkspaces.length === 0 ? (
            <WorkspaceEmptyState
              type="no_results"
              onClearFilters={clearAllFilters}
            />
          ) : (
            /* WORKSPACE CARDS GRID */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {filteredWorkspaces.map((ws) => (
                <WorkspaceCardItem
                  key={ws.id}
                  workspace={ws}
                  parentAgency={ws.agencyId ? agenciesById.get(ws.agencyId) : null}
                  currentUserId={currentUser?.id}
                  onDuplicate={setDuplicateSource}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Duplicate Workspace Dialog */}
      {duplicateSource && (
        <DuplicateWorkspaceDialog
          source={duplicateSource}
          onClose={() => setDuplicateSource(null)}
          onSuccess={(newWs) => {
            setDuplicateSource(null);
            navigate(`/workspaces/${newWs.id}/dashboard`);
          }}
        />
      )}
    </PageWrapper>
  );
}

export default WorkspacePage;
