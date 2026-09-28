export type ReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ReportFrequency;
  recipients: string[];
  lastSentAt?: string;
  isActive: boolean;
}
