import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import type {
  ContentRequest,
  ContentRequestStatus,
  SocialPlatform,
  ContentRequestPaginatedResponse,
} from '@/types/contentRequest';
import { mockContentRequestService } from '@/services/mockContentRequestService';
import { ContentRequestFilterBar } from '@/components/request/ContentRequestFilterBar';
import { ContentRequestTable } from '@/components/request/ContentRequestTable';
import { AssigneePickerModal } from '@/components/request/AssigneePickerModal';
import { useAuthStore } from '@/store/authStore';
import { FileText, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type ActiveTab = 'all' | 'my-tasks';

export function ContentRequestListPage() {
  const { user } = useAuthStore();
  const userRole = user?.role || 'ACCOUNT_MANAGER';
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL query parameters
  const searchQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'all';

  const selectedStatuses: ContentRequestStatus[] = searchParams.getAll('status') as ContentRequestStatus[];
  const selectedPlatforms: SocialPlatform[] = searchParams.getAll('platform') as SocialPlatform[];
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // Response state
  const [data, setData] = useState<ContentRequestPaginatedResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Assign modal state
  const [selectedRequestForAssign, setSelectedRequestForAssign] = useState<ContentRequest | null>(null);

  // Helper to update query params
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | string[] | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            next.delete(key);
          } else if (Array.isArray(value)) {
            next.delete(key);
            value.forEach((val) => next.append(key, val));
          } else {
            next.set(key, value);
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockContentRequestService.getRequests({
        search: searchQuery,
        status: selectedStatuses,
        platform: selectedPlatforms,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
        myTasksOnly: activeTab === 'my-tasks',
      });
      setData(res);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách yêu cầu nội dung');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatuses, selectedPlatforms, startDate, endDate, page, activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handlers for filter bar
  const handleSearchChange = (q: string) => {
    updateQueryParams({ q, page: '1' });
  };

  const handleStatusToggle = (status: ContentRequestStatus) => {
    const nextStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    updateQueryParams({ status: nextStatuses, page: '1' });
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const nextPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];
    updateQueryParams({ platform: nextPlatforms, page: '1' });
  };

  const handleStartDateChange = (date: string) => {
    updateQueryParams({ startDate: date, page: '1' });
  };

  const handleEndDateChange = (date: string) => {
    updateQueryParams({ endDate: date, page: '1' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleTabChange = (tab: ActiveTab) => {
    updateQueryParams({ tab, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
  };

  // Assignee confirmation
  const handleConfirmAssign = async (assigneeId: string) => {
    if (!selectedRequestForAssign) return;
    const updated = await mockContentRequestService.assignRequest(
      selectedRequestForAssign.id,
      assigneeId
    );
    toast.success(`Đã phân công thành công cho ${updated.assignee?.name}!`);
    fetchRequests();
  };

  return (
    <PageWrapper
      title="Content Requests"
      description="Quản lý và phân công các yêu cầu sản xuất nội dung bài viết từ các thương hiệu đối tác."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRequests()}
            className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-medium">
          <button
            onClick={() => handleTabChange('all')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-brand-orange text-brand-orange font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tất Cả Yêu Cầu ({data.total})</span>
          </button>

          <button
            onClick={() => handleTabChange('my-tasks')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'my-tasks'
                ? 'border-brand-orange text-brand-orange font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Nhiệm Vụ Của Tôi</span>
          </button>
        </div>

        {/* Filter Bar with URL query params sync & 300ms debounce */}
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

        {/* Table View */}
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

        {/* Assignee Picker Modal */}
        <AssigneePickerModal
          isOpen={selectedRequestForAssign !== null}
          requestTitle={selectedRequestForAssign?.topic || ''}
          currentAssignee={selectedRequestForAssign?.assignee}
          onClose={() => setSelectedRequestForAssign(null)}
          onConfirm={handleConfirmAssign}
        />
      </div>
    </PageWrapper>
  );
}

export default ContentRequestListPage;
