import type {
  ReportFrequency,
  ScheduledReport,
  TeamProductivityRow,
} from "@/pages/reports/types/report";

const MOCK_PRODUCTIVITY: TeamProductivityRow[] = [
  {
    memberId: "m-1",
    memberName: "Nguyễn Văn An",
    postsCreated: 42,
    postsApproved: 38,
    avgApprovalTimeHours: 3.2,
    aiGenerationsUsed: 120,
  },
  {
    memberId: "m-2",
    memberName: "Trần Thị Bình",
    postsCreated: 35,
    postsApproved: 33,
    avgApprovalTimeHours: 2.1,
    aiGenerationsUsed: 95,
  },
  {
    memberId: "m-3",
    memberName: "Lê Minh Cường",
    postsCreated: 28,
    postsApproved: 21,
    avgApprovalTimeHours: 5.6,
    aiGenerationsUsed: 64,
  },
  {
    memberId: "m-4",
    memberName: "Phạm Thu Duyên",
    postsCreated: 51,
    postsApproved: 47,
    avgApprovalTimeHours: 2.8,
    aiGenerationsUsed: 143,
  },
  {
    memberId: "m-5",
    memberName: "Đỗ Thanh Hà",
    postsCreated: 19,
    postsApproved: 15,
    avgApprovalTimeHours: 6.4,
    aiGenerationsUsed: 38,
  },
];

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

export async function getTeamProductivity(): Promise<TeamProductivityRow[]> {
  return Promise.resolve(MOCK_PRODUCTIVITY.map((r) => ({ ...r })));
}

// ponytail: mock export — no real file generated, just an honest delay + resolve.
export async function exportReport(_format: "PDF" | "EXCEL"): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Promise.resolve();
}

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
