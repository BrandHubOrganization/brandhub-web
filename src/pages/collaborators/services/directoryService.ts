import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type { DirectoryPartner, PartnerFields, PartnerPage } from "../types";
const base = (agencyId: string) => `/api/v1/agencies/${agencyId}/collaborators`;
export const directoryService = {
  list: (agencyId: string, params: { page: number; search: string; active?: boolean; type?: string }) =>
    api.get<ApiResponse<PartnerPage<DirectoryPartner>>>(base(agencyId), { params: { ...params, size: 20 } }),
  create: (agencyId: string, fields: PartnerFields) => api.post(base(agencyId), fields),
  update: (agencyId: string, partner: DirectoryPartner, fields: PartnerFields) =>
    api.patch(`${base(agencyId)}/${partner.id}`, { ...fields, expectedVersion: partner.version }),
  deactivate: (agencyId: string, partner: DirectoryPartner) =>
    api.post(`${base(agencyId)}/${partner.id}/deactivate`, { expectedVersion: partner.version }),
  delete: (agencyId: string, partner: DirectoryPartner) =>
    api.delete(`${base(agencyId)}/${partner.id}`, { params: { expectedVersion: partner.version } }),
};
