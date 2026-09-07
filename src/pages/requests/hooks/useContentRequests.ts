import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { mockContentRequestService } from "@/services/mock/mockContentRequestService";
import type {
  ContentRequest,
  ContentRequestStatus,
  SocialPlatform,
  ContentRequestPaginatedResponse,
  CreateContentRequestPayload,
  ReviseContentRequestPayload,
} from "@/types/contentRequest";

export type ActiveTab = "all" | "my-tasks";

export function useContentRequests() {
  const { t } = useTranslation();
  const userRole = useWorkspaceStore((s) => s.currentMemberRole) ?? "ACCOUNT";
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const activeTab = (searchParams.get("tab") as ActiveTab) || "all";
  const selectedStatuses = searchParams.getAll(
    "status",
  ) as ContentRequestStatus[];
  const selectedPlatforms = searchParams.getAll("platform") as SocialPlatform[];
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [data, setData] = useState<ContentRequestPaginatedResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequestForAssign, setSelectedRequestForAssign] =
    useState<ContentRequest | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] =
    useState<ContentRequest | null>(null);
  const [selectedRequestForRevise, setSelectedRequestForRevise] =
    useState<ContentRequest | null>(null);
  const [selectedRequestForCancel, setSelectedRequestForCancel] =
    useState<ContentRequest | null>(null);

  const updateQueryParams = useCallback(
    (newParams: Record<string, string | string[] | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
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
    [setSearchParams],
  );

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
        myTasksOnly: activeTab === "my-tasks",
      });
      setData(res);
    } catch (err) {
      toast.error(t("requests.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedStatuses,
    selectedPlatforms,
    startDate,
    endDate,
    page,
    activeTab,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChange = (q: string) => {
    updateQueryParams({ q, page: "1" });
  };

  const handleStatusToggle = (status: ContentRequestStatus) => {
    const nextStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    updateQueryParams({ status: nextStatuses, page: "1" });
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const nextPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];
    updateQueryParams({ platform: nextPlatforms, page: "1" });
  };

  const handleStartDateChange = (date: string) => {
    updateQueryParams({ startDate: date, page: "1" });
  };

  const handleEndDateChange = (date: string) => {
    updateQueryParams({ endDate: date, page: "1" });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleTabChange = (tab: ActiveTab) => {
    updateQueryParams({ tab, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
  };

  const handleConfirmAssign = async (assigneeId: string) => {
    if (!selectedRequestForAssign) return;
    const updated = await mockContentRequestService.assignRequest(
      selectedRequestForAssign.id,
      assigneeId,
    );
    toast.success(
      t("requests.toast.assignSuccess", { name: updated.assignee?.name }),
    );
    fetchRequests();
  };

  const handleCreateRequest = async (payload: CreateContentRequestPayload) => {
    const created = await mockContentRequestService.createRequest(payload);
    toast.success(t("requests.create.success", { topic: created.topic }));
    fetchRequests();
  };

  const handleReviseRequest = async (
    requestId: string,
    payload: ReviseContentRequestPayload,
  ) => {
    const updated = await mockContentRequestService.reviseRequest(
      requestId,
      payload,
    );
    toast.success(t("requests.revise.success", { topic: updated.topic }));
    setSelectedRequestForDetail(null);
    fetchRequests();
  };

  const handleCancelRequest = async (requestId: string, reason?: string) => {
    const updated = await mockContentRequestService.cancelRequest(
      requestId,
      reason,
    );
    toast.success(t("requests.cancelDialog.success", { topic: updated.topic }));
    setSelectedRequestForDetail(null);
    fetchRequests();
  };

  return {
    userRole,
    searchQuery,
    page,
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
  };
}
