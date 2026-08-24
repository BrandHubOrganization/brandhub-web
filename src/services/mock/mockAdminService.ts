import type {
  AdminUser,
  ModerationItem,
  PlatformStat,
  SystemHealthMetric,
} from "@/pages/admin/types/admin";

const MOCK_USERS: AdminUser[] = [
  {
    id: "u-1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@brandhub.vn",
    role: "OWNER",
    status: "ACTIVE",
    workspaceCount: 2,
    createdAt: "2026-01-12T00:00:00Z",
  },
  {
    id: "u-2",
    name: "Trần Thị Bình",
    email: "binh.tran@brandhub.vn",
    role: "ACCOUNT",
    status: "ACTIVE",
    workspaceCount: 3,
    createdAt: "2026-02-03T00:00:00Z",
  },
  {
    id: "u-3",
    name: "Lê Minh Cường",
    email: "cuong.le@brandhub.vn",
    role: "CREATOR",
    status: "PENDING_VERIFICATION",
    workspaceCount: 1,
    createdAt: "2026-08-18T00:00:00Z",
  },
  {
    id: "u-4",
    name: "Phạm Thu Duyên",
    email: "duyen.pham@brandhub.vn",
    role: "CREATOR",
    status: "ACTIVE",
    workspaceCount: 1,
    createdAt: "2026-03-21T00:00:00Z",
  },
  {
    id: "u-5",
    name: "Hoàng Đức Em",
    email: "em.hoang@brandhub.vn",
    role: "VIEWER",
    status: "DISABLED",
    workspaceCount: 1,
    createdAt: "2025-11-30T00:00:00Z",
  },
  {
    id: "u-6",
    name: "Vũ Ngọc Giang",
    email: "giang.vu@brandhub.vn",
    role: "CLIENT",
    status: "ACTIVE",
    workspaceCount: 1,
    createdAt: "2026-05-09T00:00:00Z",
  },
  {
    id: "u-7",
    name: "Đỗ Thanh Hà",
    email: "ha.do@brandhub.vn",
    role: "CREATOR",
    status: "PENDING_VERIFICATION",
    workspaceCount: 1,
    createdAt: "2026-08-20T00:00:00Z",
  },
  {
    id: "u-8",
    name: "Bùi Quốc Huy",
    email: "huy.bui@brandhub.vn",
    role: "ACCOUNT",
    status: "ACTIVE",
    workspaceCount: 4,
    createdAt: "2025-09-14T00:00:00Z",
  },
];

const MOCK_MODERATION: ModerationItem[] = [
  {
    id: "mod-1",
    contentTitle: "Khuyến mãi sốc 50% cuối tuần",
    workspaceName: "Local Brand ABC",
    flagReason: "Nghi ngờ ngôn từ phóng đại sai sự thật",
    submittedAt: "2026-08-22T10:00:00Z",
    status: "PENDING",
  },
  {
    id: "mod-2",
    contentTitle: "Review sản phẩm skincare X",
    workspaceName: "Beauty Store VN",
    flagReason: "Liên kết ngoài không xác định",
    submittedAt: "2026-08-21T15:30:00Z",
    status: "PENDING",
  },
  {
    id: "mod-3",
    contentTitle: "Giveaway 100 phần quà",
    workspaceName: "Fashion Hub",
    flagReason: "Vi phạm chính sách giveaway của nền tảng",
    submittedAt: "2026-08-20T09:00:00Z",
    status: "PENDING",
  },
  {
    id: "mod-4",
    contentTitle: "Video unboxing sản phẩm mới",
    workspaceName: "Tech Gadget Co",
    flagReason: "Âm thanh bản quyền chưa xác minh",
    submittedAt: "2026-08-19T13:00:00Z",
    status: "APPROVED",
  },
  {
    id: "mod-5",
    contentTitle: "Bài đăng so sánh đối thủ",
    workspaceName: "Sport Gear VN",
    flagReason: "Đề cập trực tiếp thương hiệu đối thủ",
    submittedAt: "2026-08-18T08:00:00Z",
    status: "REMOVED",
  },
];

const MOCK_HEALTH: SystemHealthMetric[] = [
  { service: "Gateway", status: "UP", latencyMs: 42, uptime: 99.98 },
  { service: "Auth Service", status: "UP", latencyMs: 65, uptime: 99.95 },
  { service: "Business Service", status: "UP", latencyMs: 88, uptime: 99.9 },
  { service: "AI Service", status: "DEGRADED", latencyMs: 640, uptime: 98.2 },
  { service: "Publisher Service", status: "UP", latencyMs: 120, uptime: 99.7 },
  {
    service: "Notification Service",
    status: "UP",
    latencyMs: 55,
    uptime: 99.99,
  },
];

const MOCK_STATS: PlatformStat[] = [
  { label: "Total Users", value: 1284, changePercent: 4.2 },
  { label: "Total Workspaces", value: 312, changePercent: 2.1 },
  { label: "Posts Published Today", value: 96, changePercent: 12.5 },
  { label: "Active Subscriptions", value: 248, changePercent: 1.8 },
  { label: "AI Generations Today", value: 573, changePercent: 8.9 },
  { label: "Storage Used GB", value: 842, changePercent: 3.4 },
];

export async function getUsers(): Promise<AdminUser[]> {
  return Promise.resolve(MOCK_USERS.map((u) => ({ ...u })));
}

export async function verifyUser(id: string): Promise<AdminUser> {
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.status = "ACTIVE";
  return Promise.resolve({ ...user });
}

export async function disableUser(id: string): Promise<AdminUser> {
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.status = user.status === "DISABLED" ? "ACTIVE" : "DISABLED";
  return Promise.resolve({ ...user });
}

export async function deleteUser(id: string): Promise<void> {
  const idx = MOCK_USERS.findIndex((u) => u.id === id);
  if (idx !== -1) MOCK_USERS.splice(idx, 1);
  return Promise.resolve();
}

export async function getModerationQueue(): Promise<ModerationItem[]> {
  return Promise.resolve(MOCK_MODERATION.map((m) => ({ ...m })));
}

export async function approveModerationItem(
  id: string,
): Promise<ModerationItem> {
  const item = MOCK_MODERATION.find((m) => m.id === id);
  if (!item) throw new Error("Moderation item not found");
  item.status = "APPROVED";
  return Promise.resolve({ ...item });
}

export async function removeModerationItem(
  id: string,
): Promise<ModerationItem> {
  const item = MOCK_MODERATION.find((m) => m.id === id);
  if (!item) throw new Error("Moderation item not found");
  item.status = "REMOVED";
  return Promise.resolve({ ...item });
}

export async function getSystemHealth(): Promise<SystemHealthMetric[]> {
  return Promise.resolve(MOCK_HEALTH.map((h) => ({ ...h })));
}

export async function getPlatformStats(): Promise<PlatformStat[]> {
  return Promise.resolve(MOCK_STATS.map((s) => ({ ...s })));
}
