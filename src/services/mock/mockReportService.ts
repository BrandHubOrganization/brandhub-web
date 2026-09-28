import type {
  ReportFrequency,
  ScheduledReport,
} from "@/pages/reports/types/report";

const MOCK_SCHEDULED: ScheduledReport[] = [
  {
    id: "sr-1",
    name: "Weekly Team Productivity",
    frequency: "WEEKLY",
    recipients: ["owner@brandhub.vn", "account@brandhub.vn"],
    lastSentAt: "2026-08-17T08:00:00Z",
    isActive: true,
  },
  {
    id: "sr-2",
    name: "Monthly Platform Summary",
    frequency: "MONTHLY",
    recipients: ["admin@brandhub.vn"],
    lastSentAt: "2026-08-01T08:00:00Z",
    isActive: true,
  },
  {
    id: "sr-3",
    name: "Daily Moderation Digest",
    frequency: "DAILY",
    recipients: ["moderation@brandhub.vn"],
    isActive: false,
  },
];

export async function getScheduledReports(): Promise<ScheduledReport[]> {
  return Promise.resolve(MOCK_SCHEDULED.map((r) => ({ ...r })));
}

export async function createScheduledReport(input: {
  name: string;
  frequency: ReportFrequency;
  recipients: string[];
}): Promise<ScheduledReport> {
  const created: ScheduledReport = {
    id: `sr-${Date.now()}`,
    name: input.name,
    frequency: input.frequency,
    recipients: input.recipients,
    isActive: true,
  };
  MOCK_SCHEDULED.push(created);
  return Promise.resolve({ ...created });
}

export async function toggleScheduledReport(
  id: string,
): Promise<ScheduledReport> {
  const report = MOCK_SCHEDULED.find((r) => r.id === id);
  if (!report) throw new Error("Scheduled report not found");
  report.isActive = !report.isActive;
  return Promise.resolve({ ...report });
}

export async function deleteScheduledReport(id: string): Promise<void> {
  const idx = MOCK_SCHEDULED.findIndex((r) => r.id === id);
  if (idx !== -1) MOCK_SCHEDULED.splice(idx, 1);
  return Promise.resolve();
}
