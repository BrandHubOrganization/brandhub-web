import PageWrapper from "@/components/layout/PageWrapper";
import { ContentRequestFilterBar } from "@/pages/requests/components/ContentRequestFilterBar";
import { ContentRequestTable } from "@/pages/requests/components/ContentRequestTable";
import { AssigneePickerModal } from "@/pages/requests/components/AssigneePickerModal";
import { CreateRequestModal } from "@/pages/requests/components/CreateRequestModal";
import { RequestDetailDrawer } from "@/pages/requests/components/RequestDetailDrawer";
import { ReviseRequestModal } from "@/pages/requests/components/ReviseRequestModal";
import { CancelRequestDialog } from "@/pages/requests/components/CancelRequestDialog";
import { RefreshCw, Plus } from "lucide-react";
import { useContentRequests } from "./hooks/useContentRequests";
import { RequestTabs } from "./components/RequestTabs";
import { useTranslation } from "react-i18next";

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
          <button
            onClick={() => fetchRequests()}
            className="border-border bg-card text-muted-foreground hover:bg-muted cursor-pointer rounded-xl border p-2 transition-colors"
            title={t("requests.page.refresh")}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="size-3.5" />
            {t("requests.create.button")}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <RequestTabs
          activeTab={activeTab}
          totalCount={data.total}
          onTabChange={handleTabChange}
        />

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
        />

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
