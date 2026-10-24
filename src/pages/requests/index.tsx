import PageWrapper from "@/components/layout/PageWrapper";
import { ContentRequestFilterBar } from "@/pages/requests/components/ContentRequestFilterBar";
import { ContentRequestTable } from "@/pages/requests/components/ContentRequestTable";
import { AssigneePickerModal } from "@/pages/requests/components/AssigneePickerModal";
import { CreateRequestModal } from "@/pages/requests/components/CreateRequestModal";
import { RequestDetailDrawer } from "@/pages/requests/components/RequestDetailDrawer";
import { ReviseRequestModal } from "@/pages/requests/components/ReviseRequestModal";
import { CancelRequestDialog } from "@/pages/requests/components/CancelRequestDialog";
import { RequestStatsOverview } from "@/pages/requests/components/RequestStatsOverview";
import { RequestTabs } from "./components/RequestTabs";
import { RefreshCw, Plus } from "lucide-react";
import { useContentRequests } from "./hooks/useContentRequests";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function ContentRequestListPage() {
  const { t } = useTranslation();
  const {
    userRole,
    searchQuery,
    activeTab,
    selectedStatuses,
    selectedPlatforms,
    startDate,
    endDate,
    data,
    loading,
    selectedRequestForAssign,
    setSelectedRequestForAssign,
    isCreateOpen,
    setIsCreateOpen,
    selectedRequestForDetail,
    setSelectedRequestForDetail,
    selectedRequestForRevise,
    setSelectedRequestForRevise,
    selectedRequestForCancel,
    setSelectedRequestForCancel,
    handleSearchChange,
    handleStatusToggle,
    handlePlatformToggle,
    handleStartDateChange,
    handleEndDateChange,
    handleResetFilters,
    handleTabChange,
    handlePageChange,
    handleConfirmAssign,
    handleCreateRequest,
    handleReviseRequest,
    handleCancelRequest,
    fetchRequests,
  } = useContentRequests();

  return (
    <PageWrapper
      title={t("requests.page.title")}
      description={t("requests.page.description")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRequests()}
            aria-label={t("requests.page.refresh")}
            className="h-8 w-8 p-0 rounded-xl cursor-pointer"
            title={t("requests.page.refresh")}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 rounded-xl px-3 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5 mr-1" />
            {t("requests.create.button")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Mini Metrics Overview */}
        <RequestStatsOverview requests={data.items} total={data.total} />

        {/* Status / Role Tabs */}
        <RequestTabs
          activeTab={activeTab}
          totalCount={data.total}
          onTabChange={handleTabChange}
        />

        {/* Filter Bar */}
        <ContentRequestFilterBar
          searchQuery={searchQuery}
          selectedStatuses={selectedStatuses}
          selectedPlatforms={selectedPlatforms}
          startDate={startDate}
          endDate={endDate}
          onSearchChange={handleSearchChange}
          onStatusToggle={handleStatusToggle}
          onPlatformToggle={handlePlatformToggle}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onResetFilters={handleResetFilters}
        />

        {/* Requests Data Table */}
        <ContentRequestTable
          requests={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          totalPages={data.totalPages}
          userRole={userRole}
          onPageChange={handlePageChange}
          onOpenAssignModal={(req) => setSelectedRequestForAssign(req)}
          onOpenDetail={(req) => setSelectedRequestForDetail(req)}
          onCreateNew={() => setIsCreateOpen(true)}
        />

        {/* Modals & Drawers */}
        <AssigneePickerModal
          isOpen={selectedRequestForAssign !== null}
          requestTitle={selectedRequestForAssign?.topic || ""}
          currentAssignee={selectedRequestForAssign?.assignee}
          onClose={() => setSelectedRequestForAssign(null)}
          onConfirm={handleConfirmAssign}
        />

        <CreateRequestModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onConfirm={handleCreateRequest}
        />

        <RequestDetailDrawer
          request={selectedRequestForDetail}
          onClose={() => setSelectedRequestForDetail(null)}
          onRevise={(req) => setSelectedRequestForRevise(req)}
          onCancel={(req) => setSelectedRequestForCancel(req)}
        />

        <ReviseRequestModal
          request={selectedRequestForRevise}
          onClose={() => setSelectedRequestForRevise(null)}
          onConfirm={async (id, payload) => {
            await handleReviseRequest(id, payload);
            setSelectedRequestForRevise(null);
          }}
        />

        <CancelRequestDialog
          request={selectedRequestForCancel}
          onClose={() => setSelectedRequestForCancel(null)}
          onConfirm={async (id, reason) => {
            await handleCancelRequest(id, reason);
            setSelectedRequestForCancel(null);
          }}
        />
      </div>
    </PageWrapper>
  );
}

export default ContentRequestListPage;
