import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  MailAttachment,
  MailBatch,
  MailBatchDetail,
  MailQuota,
  MailSuppression,
  RecipientCandidate,
  RecipientPreview,
  RecipientGroup,
  MailTemplate,
  MailTemplateSummary,
  PageOf,
  Recipient,
  SendResult,
  TemplatePayload,
} from "../types";

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}`;
const data = <T,>(r: { data: ApiResponse<T> }) => r.data.data;

export interface UploadedFile {
  id: string;
  name: string;
  contentType: string;
  size: number;
  kind: "FILE" | "IMAGE";
  url: string | null;
}

export interface SendPayload {
  recipients: Recipient[];
  variables?: Record<string, string>;
  attachmentIds?: string[];
  scheduledAt?: string;
  /** Admin system broadcast above the server threshold must re-confirm the admin password. */
  confirmPassword?: string;
}

export const mailTemplateService = {
  list: (workspaceId: string, params: { q?: string; includeSystem?: boolean; page?: number; size?: number }) =>
    api
      .get<ApiResponse<PageOf<MailTemplateSummary>>>(`${base(workspaceId)}/mail-templates`, { params })
      .then(data),
  get: (workspaceId: string, id: string) =>
    api.get<ApiResponse<MailTemplate>>(`${base(workspaceId)}/mail-templates/${id}`).then(data),
  create: (workspaceId: string, payload: TemplatePayload) =>
    api.post<ApiResponse<MailTemplate>>(`${base(workspaceId)}/mail-templates`, payload).then(data),
  update: (workspaceId: string, id: string, payload: TemplatePayload) =>
    api.patch<ApiResponse<MailTemplate>>(`${base(workspaceId)}/mail-templates/${id}`, payload).then(data),
  remove: (workspaceId: string, id: string) =>
    api.delete(`${base(workspaceId)}/mail-templates/${id}`),
  preview: (workspaceId: string, id: string, variables: Record<string, string>) =>
    api
      .post<ApiResponse<{ subject: string; bodyHtml: string; missingVariables: string[] }>>(
        `${base(workspaceId)}/mail-templates/${id}/preview`,
        { variables },
      )
      .then(data),
  send: (workspaceId: string, id: string, payload: SendPayload, idempotencyKey?: string) =>
    api
      .post<ApiResponse<SendResult>>(`${base(workspaceId)}/mail-templates/${id}/send`, payload, {
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      })
      .then(data),
  sendTest: (workspaceId: string, id: string, variables: Record<string, string>) =>
    api.post(`${base(workspaceId)}/mail-templates/${id}/send-test`, { variables }),
  quota: (workspaceId: string) =>
    api.get<ApiResponse<MailQuota>>(`${base(workspaceId)}/mail-quota`).then(data),
  upload: (workspaceId: string, file: File, kind: "attachments" | "images") => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<ApiResponse<UploadedFile>>(`${base(workspaceId)}/mail-templates/${kind}`, form)
      .then(data);
  },
  batches: (workspaceId: string, params: { status?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageOf<MailBatch>>>(`${base(workspaceId)}/mail-batches`, { params }).then(data),
  batch: (workspaceId: string, id: string, params: { status?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<MailBatchDetail>>(`${base(workspaceId)}/mail-batches/${id}`, { params }).then(data),
  cancelBatch: (workspaceId: string, id: string) =>
    api.post(`${base(workspaceId)}/mail-batches/${id}/cancel`),
  resendFailed: (workspaceId: string, id: string) =>
    api
      .post<ApiResponse<{ requeued: number }>>(`${base(workspaceId)}/mail-batches/${id}/resend-failed`)
      .then(data),
  exportBatchCsv: async (workspaceId: string, id: string) => {
    const res = await api.get<Blob>(`${base(workspaceId)}/mail-batches/${id}/export.csv`, { responseType: "blob" });
    return res.data;
  },
  suppressions: (workspaceId: string, params: { q?: string; page?: number; size?: number }) =>
    api
      .get<ApiResponse<PageOf<MailSuppression>>>(`${base(workspaceId)}/mail-suppressions`, { params })
      .then(data),
  resubscribe: (workspaceId: string, email: string) =>
    api.delete(`${base(workspaceId)}/mail-suppressions`, { params: { email } }),
  recipientCandidates: (workspaceId: string, q: string) =>
    api
      .get<ApiResponse<RecipientCandidate[]>>(`${base(workspaceId)}/mail-recipients`, { params: { q } })
      .then(data),
  recipientGroups: (workspaceId: string) =>
    api.get<ApiResponse<RecipientGroup[]>>(`${base(workspaceId)}/mail-recipient-groups`).then(data),
  createRecipientGroup: (workspaceId: string, name: string, recipients: { email: string; name?: string }[]) =>
    api
      .post<ApiResponse<RecipientGroup>>(`${base(workspaceId)}/mail-recipient-groups`, { name, recipients })
      .then(data),
  deleteRecipientGroup: (workspaceId: string, id: string) =>
    api.delete(`${base(workspaceId)}/mail-recipient-groups/${id}`),
};

export const adminMailTemplateService = {
  list: (params: { q?: string; page?: number; size?: number }) =>
    api
      .get<ApiResponse<PageOf<MailTemplateSummary>>>("/api/v1/admin/mail-templates", { params })
      .then(data),
  get: (id: string) =>
    api.get<ApiResponse<MailTemplate>>(`/api/v1/admin/mail-templates/${id}`).then(data),
  create: (payload: TemplatePayload) =>
    api.post<ApiResponse<MailTemplate>>("/api/v1/admin/mail-templates", payload).then(data),
  update: (id: string, payload: TemplatePayload) =>
    api.patch<ApiResponse<MailTemplate>>(`/api/v1/admin/mail-templates/${id}`, payload).then(data),
  remove: (id: string) => api.delete(`/api/v1/admin/mail-templates/${id}`),
  recipientPreview: (id: string) =>
    api.get<ApiResponse<RecipientPreview>>(`/api/v1/admin/mail-templates/${id}/recipient-preview`).then(data),
  /** Sends one rendered copy to the admin's own address. */
  sendTest: (id: string) => api.post(`/api/v1/admin/mail-templates/${id}/send-test`, { variables: {} }),
  /** ADMIN_SYSTEM_BROADCAST: recipients are resolved by the backend (all active users). */
  send: (id: string, payload: SendPayload, idempotencyKey?: string) =>
    api
      .post<ApiResponse<SendResult>>(`/api/v1/admin/mail-templates/${id}/send`, payload, {
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      })
      .then(data),
};

export const agencyMailTemplateService = {
  list: (agencyId: string, params: { q?: string; page?: number; size?: number }) =>
    api
      .get<ApiResponse<PageOf<MailTemplateSummary>>>(`/api/v1/agencies/${agencyId}/mail-templates`, { params })
      .then(data),
  get: (agencyId: string, id: string) =>
    api.get<ApiResponse<MailTemplate>>(`/api/v1/agencies/${agencyId}/mail-templates/${id}`).then(data),
  create: (agencyId: string, payload: TemplatePayload) =>
    api.post<ApiResponse<MailTemplate>>(`/api/v1/agencies/${agencyId}/mail-templates`, payload).then(data),
  update: (agencyId: string, id: string, payload: TemplatePayload) =>
    api.patch<ApiResponse<MailTemplate>>(`/api/v1/agencies/${agencyId}/mail-templates/${id}`, payload).then(data),
  remove: (agencyId: string, id: string) => api.delete(`/api/v1/agencies/${agencyId}/mail-templates/${id}`),
  recipientPreview: (agencyId: string, id: string) =>
    api
      .get<ApiResponse<RecipientPreview>>(`/api/v1/agencies/${agencyId}/mail-templates/${id}/recipient-preview`)
      .then(data),
};

export const publicMailService = {
  describe: (token: string) =>
    api
      .get<ApiResponse<{ workspaceName: string; maskedEmail: string }>>("/api/v1/public/mail/unsubscribe", {
        params: { token },
      })
      .then(data),
  unsubscribe: (token: string) =>
    api.post("/api/v1/public/mail/unsubscribe", null, { params: { token } }),
};

export type { MailAttachment };
