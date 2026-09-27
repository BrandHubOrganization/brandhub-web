// TODO(mock): replace with real workspace dashboard API once content/campaign
// timeline endpoints exist (content_requests/publish_logs in Mongo have no
// repository yet — see AgencyStatsResponse.contentByStatus for the same gap
// on the Agency side). Shapes here match StatCharts + the list UI below so
// swapping to real data is just replacing these constants with fetched state.

export const MOCK_CAMPAIGN_TREND: { month: string; count: number }[] = [
  { month: "T4", count: 2 },
  { month: "T5", count: 3 },
  { month: "T6", count: 1 },
  { month: "T7", count: 4 },
  { month: "T8", count: 3 },
  { month: "T9", count: 5 },
];

export const MOCK_CONTENT_BY_STATUS: Record<string, number> = {
  DRAFT: 6,
  PENDING_APPROVAL: 3,
  APPROVED: 2,
  PUBLISHED: 12,
};

export interface MockUpcomingContent {
  id: string;
  title: string;
  platform: string;
  scheduledAt: string;
}

export const MOCK_UPCOMING_CONTENT: MockUpcomingContent[] = [
  {
    id: "mock-1",
    title: "Bài đăng ra mắt sản phẩm mới",
    platform: "Facebook",
    scheduledAt: "2026-10-02T09:00:00Z",
  },
  {
    id: "mock-2",
    title: "Video hậu trường sản xuất",
    platform: "TikTok",
    scheduledAt: "2026-10-04T14:00:00Z",
  },
  {
    id: "mock-3",
    title: "Bộ ảnh khuyến mãi tháng 10",
    platform: "Instagram",
    scheduledAt: "2026-10-06T10:30:00Z",
  },
];

export interface MockActivityItem {
  id: string;
  actor: string;
  action: string;
  at: string;
}

export const MOCK_RECENT_ACTIVITY: MockActivityItem[] = [
  {
    id: "act-1",
    actor: "Nguyễn Văn A",
    action: "đã duyệt bài đăng \"Khuyến mãi cuối tuần\"",
    at: "2026-09-26T08:15:00Z",
  },
  {
    id: "act-2",
    actor: "Trần Thị B",
    action: "đã tạo chiến dịch mới \"Back to school\"",
    at: "2026-09-25T15:40:00Z",
  },
  {
    id: "act-3",
    actor: "Lê Văn C",
    action: "đã mời thành viên mới vào workspace",
    at: "2026-09-24T11:05:00Z",
  },
];
