import type {
  ContentRequest,
  Assignee,
  ContentRequestQueryParams,
  ContentRequestPaginatedResponse,
  CreateContentRequestPayload,
  ReviseContentRequestPayload,
} from "@/types/contentRequest";
import { api } from "./api";
import type { ApiResponse } from "./authService";

export const CREATORS: Assignee[] = [
  {
    id: "usr-101",
    name: "Lê Hoàng Nam",
    email: "nam.le@brandhub.vn",
    avatar: "",
    avatarUrl: "",
    role: "CREATOR",
  },
  {
    id: "usr-102",
    name: "Nguyễn Thảo Linh",
    email: "linh.nguyen@brandhub.vn",
    avatar: "",
    avatarUrl: "",
    role: "CREATOR",
  },
  {
    id: "usr-103",
    name: "Trần Minh Quang",
    email: "quang.tran@brandhub.vn",
    avatar: "",
    avatarUrl: "",
    role: "CREATOR",
  },
  {
    id: "usr-104",
    name: "Phạm Hải Đăng",
    email: "dang.pham@brandhub.vn",
    avatar: "",
    avatarUrl: "",
    role: "CREATOR",
  },
];

export const MOCK_CREATORS = CREATORS;

export const contentRequestService = {
  async getRequests(
    params: ContentRequestQueryParams,
  ): Promise<ContentRequestPaginatedResponse> {
    try {
      const res = await api.get<ApiResponse<ContentRequestPaginatedResponse>>(
        "/api/v1/content-requests",
        { params },
      );
      return (
        res.data?.data ?? {
          items: [],
          total: 0,
          page: 0,
          limit: params.limit || 10,
          size: params.size || 10,
          totalPages: 0,
        }
      );
    } catch {
      return {
        items: [],
        total: 0,
        page: 0,
        limit: params.limit || 10,
        size: params.size || 10,
        totalPages: 0,
      };
    }
  },

  async createRequest(
    payload: CreateContentRequestPayload,
  ): Promise<ContentRequest> {
    const res = await api.post<ApiResponse<ContentRequest>>(
      "/api/v1/content-requests",
      payload,
    );
    return res.data?.data;
  },

  async assignRequest(
    id: string,
    assigneeId: string,
  ): Promise<ContentRequest> {
    const res = await api.patch<ApiResponse<ContentRequest>>(
      `/api/v1/content-requests/${id}/assign`,
      { assigneeId },
    );
    return res.data?.data;
  },

  async reviseRequest(
    id: string,
    payload: ReviseContentRequestPayload,
  ): Promise<ContentRequest> {
    const res = await api.patch<ApiResponse<ContentRequest>>(
      `/api/v1/content-requests/${id}/revise`,
      payload,
    );
    return res.data?.data;
  },

  async cancelRequest(
    id: string,
    reason?: string,
  ): Promise<ContentRequest> {
    const res = await api.patch<ApiResponse<ContentRequest>>(
      `/api/v1/content-requests/${id}/cancel`,
      reason ? { reason } : undefined,
    );
    return res.data?.data;
  },
};
