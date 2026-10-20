export const hashtagPurposes = ["BRAND", "CAMPAIGN", "TRENDING"] as const;
export const clientHashtagPurposes = [...hashtagPurposes, "EVENT_SPECIFIC"] as const;
export type HashtagPurpose =
  (typeof hashtagPurposes)[number] | "EVENT_SPECIFIC";
export interface HashtagEntry {
  id: string;
  workspaceId: string;
  tag: string;
  purpose: HashtagPurpose;
  addedBy: string;
  addedByName: string;
  isRequired: boolean;
  campaignId: string | null;
  version: number;
  createdAt: string;
}
export interface HashtagPage {
  items: HashtagEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface HashtagFilter {
  q: string;
  purpose: string;
  isRequired: boolean | undefined;
  page: number;
}
export interface CreateHashtag {
  tag: string;
  purpose: HashtagPurpose;
  isRequired: boolean;
  campaignId: string | null;
}
export interface HashtagCampaign { id: string; name: string }
