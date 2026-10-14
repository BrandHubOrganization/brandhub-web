import { api } from "@/lib/axios";
import type { StrikeLevel } from "@/services/adminAccountService";

export type ModerationStatus = "PENDING" | "APPROVED" | "BLOCKED";
export type ModerationSource = "FLAGGED_AUTHOR" | "COMPLIANCE" | "COPYRIGHT";
export interface ModerationItem {
  id: string;
  postId: string;
  contentVersion: number;
  currentVersion: number | null;
  workspaceId: string | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorStatus: string;
  yellow: number;
  orange: number;
  red: number;
  source: ModerationSource;
  reason: string;
  status: ModerationStatus;
  decisionNote: string | null;
  strikeLevel: StrikeLevel | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
  rowVersion: number;
  captionPreview: string | null;
  snapshot: {
    contentText: string | null;
    hashtags: string[];
    media: {
      s3_key: string | null;
      external_url: string | null;
      media_type: string | null;
    }[];
    targetPlatforms: string[];
    contentHash: string;
    capturedAt: string;
  } | null;
}
export interface ModerationPage {
  items: ModerationItem[];
  page: number;
  size: number;
  total: number;
  pendingTotal: number;
  processedToday: number;
}

export const adminModerationService = {
  async list(filter: {
    status: ModerationStatus;
    source: string;
    page: number;
    size: number;
  }) {
    return (
      await api.get<{ data: ModerationPage }>("/api/v1/admin/moderation", {
        params: { ...filter, source: filter.source || undefined },
      })
    ).data.data;
  },
  async detail(id: string) {
    return (
      await api.get<{ data: ModerationItem }>(`/api/v1/admin/moderation/${id}`)
    ).data.data;
  },
  decide: (
    id: string,
    body: {
      decision: "APPROVE" | "BLOCK";
      note: string;
      strikeLevel?: StrikeLevel;
      rowVersion: number;
    },
  ) => api.post(`/api/v1/admin/moderation/${id}/decision`, body),
};
