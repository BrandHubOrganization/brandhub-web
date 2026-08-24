export interface TeamProductivityRow {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  postsCreated: number;
  postsApproved: number;
  avgApprovalTimeHours: number;
  aiGenerationsUsed: number;
}

export type ReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ReportFrequency;
  recipients: string[];
  lastSentAt?: string;
  isActive: boolean;
}
