import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type { RequestFields, RequestPage, RequestTask, ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/content-requests`;
export const workspaceRequestService = {
  async list(workspaceId: string, params: { page: number; status: string; search: string }) {
    const response = await api.get<ApiResponse<RequestPage>>(base(workspaceId), { params });
    return requireApiData<RequestPage>(response.data);
  },
  async detail(workspaceId: string, requestId: string) {
    const response = await api.get<ApiResponse<WorkspaceRequest>>(`${base(workspaceId)}/${requestId}`);
    return requireApiData<WorkspaceRequest>(response.data);
  },
  async create(workspaceId: string, fields: RequestFields) {
    const response = await api.post<ApiResponse<WorkspaceRequest>>(base(workspaceId), fields);
    return requireApiData<WorkspaceRequest>(response.data);
  },
  async update(workspaceId: string, request: WorkspaceRequest, fields: RequestFields) {
    const response = await api.patch<ApiResponse<WorkspaceRequest>>(`${base(workspaceId)}/${request.id}`,
      { ...fields, expectedVersion: request.version });
    return requireApiData<WorkspaceRequest>(response.data);
  },
  async cancel(workspaceId: string, request: WorkspaceRequest) {
    await api.delete(`${base(workspaceId)}/${request.id}`, { params: { expectedVersion: request.version } });
  },
  async review(workspaceId: string, command: { request: WorkspaceRequest; action: ReviewAction; note: string }) {
    const { request, action, note } = command;
    const payload = action === "deny" ? { expectedVersion: request.version, note } : { expectedVersion: request.version };
    const response = await api.post<ApiResponse<WorkspaceRequest>>(`${base(workspaceId)}/${request.id}/${action}`, payload);
    return requireApiData<WorkspaceRequest>(response.data);
  },
  async task(workspaceId: string, requestId: string) {
    const response = await api.get<ApiResponse<RequestTask>>(`${base(workspaceId)}/${requestId}/task`);
    return requireApiData<RequestTask>(response.data);
  },
};
