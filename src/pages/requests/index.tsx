import PageWrapper from "@/components/layout/PageWrapper";
import { ContentRequestFilterBar } from "@/pages/requests/components/ContentRequestFilterBar";
import { ContentRequestTable } from "@/pages/requests/components/ContentRequestTable";
import { AssigneePickerModal } from "@/pages/requests/components/AssigneePickerModal";
import { RefreshCw } from "lucide-react";
import { useContentRequests } from "./hooks/useContentRequests";
import { RequestTabs } from "./components/RequestTabs";

export function ContentRequestListPage() {
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
    handleSearchChange,
    handleStatusToggle,
    handlePlatformToggle,
    handleStartDateChange,
    handleEndDateChange,
    handleResetFilters,
    handleTabChange,
    handlePageChange,
    handleConfirmAssign,
    fetchRequests,
  } = useContentRequests();

  return (
    <PageWrapper
      title="Content Requests"
      description="Quản lý và phân công các yêu cầu sản xuất nội dung bài viết từ các thương hiệu đối tác."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRequests()}
            className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            title="Làm mới"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
        />

        <AssigneePickerModal
          isOpen={selectedRequestForAssign !== null}
          requestTitle={selectedRequestForAssign?.topic || ""}
          currentAssignee={selectedRequestForAssign?.assignee}
          onClose={() => setSelectedRequestForAssign(null)}
          onConfirm={handleConfirmAssign}
        />
      </div>
    </PageWrapper>
  );
}

export default ContentRequestListPage;
