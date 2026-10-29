import { api } from "@/lib/axios";

export interface CustomerDriveStatus {
  enabled: boolean;
  connected: boolean;
  disconnecting?: boolean;
  syncEnabled?: boolean;
  syncReady?: boolean;
  email: string | null;
  folderId: string | null;
}
const path = (workspace: string) =>
  `/api/v1/workspaces/${workspace}/storage/drive`;
export const customerDriveService = {
  async status(workspace: string, signal?: AbortSignal) {
    const response = await api.get<{ data: CustomerDriveStatus }>(
      path(workspace),
      { signal },
    );
    return response.data.data;
  },
  async authorize(workspace: string) {
    const response = await api.post<{ data: { authorizationUrl: string } }>(
      `${path(workspace)}/authorize`,
    );
    return response.data.data.authorizationUrl;
  },
  async complete(workspace: string, code: string, state: string) {
    const response = await api.post<{ data: CustomerDriveStatus }>(
      `${path(workspace)}/complete`,
      { code, state },
    );
    return response.data.data;
  },
  async disconnect(workspace: string) {
    await api.delete(path(workspace));
  },
};
