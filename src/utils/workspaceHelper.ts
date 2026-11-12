import type { Workspace } from "@/types/workspace";
import type { ClientProfile } from "@/types/clientProfile";

export const INDUSTRY_LABELS: Record<string, string> = {
  FNB: "Ẩm thực & Đồ uống",
  FASHION: "Thời trang",
  BEAUTY: "Làm đẹp",
  TECHNOLOGY: "Công nghệ",
  REAL_ESTATE: "Bất động sản",
  EDUCATION: "Giáo dục",
  HEALTHCARE: "Y tế & Sức khỏe",
  SERVICES: "Dịch vụ",
  RETAIL: "Bán lẻ",
  MARKETING: "Tiếp thị & Truyền thông",
  FINANCE: "Tài chính & Ngân hàng",
  ENTERTAINMENT: "Giải trí",
  OTHER: "Khác",
};

export function formatIndustry(code?: string | null): string {
  if (!code) return "Chưa phân loại";
  const upper = code.trim().toUpperCase();
  return INDUSTRY_LABELS[upper] || code;
}

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
  MANAGER: "Quản lý",
  PROJECT_MANAGER: "Quản lý dự án",
  CREATOR: "Sáng tạo nội dung",
  CLIENT: "Khách hàng",
  VIEWER: "Người xem",
};

export function formatRole(role?: string | null): string {
  if (!role) return "Thành viên";
  const upper = role.trim().toUpperCase();
  return ROLE_LABELS[upper] || role;
}

/**
 * Resolve client / brand profile name for a workspace:
 * 1. Matches ws.clientProfileId with clientProfiles list
 * 2. Extracts brand name from workspace name pattern (e.g. "Momo x Agency" -> "Momo")
 * 3. Falls back to "Chưa liên kết"
 */
export function getWorkspaceClientName(
  ws: Workspace,
  clientProfiles?: ClientProfile[]
): string {
  if (ws.clientProfileId && clientProfiles && clientProfiles.length > 0) {
    const found = clientProfiles.find((p) => p.id === ws.clientProfileId);
    if (found?.displayName?.trim()) return found.displayName.trim();
    if (found?.company?.trim()) return found.company.trim();
  }

  if (ws.name) {
    // Match "Momo x ...", "Shopee X ...", "Brand - ...", "Brand | ..."
    const parts = ws.name.split(/\s+(?:[xX]|[-–—|])\s+/);
    if (parts.length > 1 && parts[0].trim()) {
      return parts[0].trim();
    }
  }

  if (ws.clientProfileId) {
    return `Khách hàng #${ws.clientProfileId.slice(0, 6)}`;
  }

  return "Chưa liên kết";
}

export type WorkspaceImplementationStage =
  | "NEGOTIATING"
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface ImplementationStageInfo {
  key: WorkspaceImplementationStage;
  label: string;
  badgeClass: string;
}

export const STAGE_CONFIGS: Record<
  WorkspaceImplementationStage,
  ImplementationStageInfo
> = {
  NEGOTIATING: {
    key: "NEGOTIATING",
    label: "Đang đàm phán Media Package",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  PLANNING: {
    key: "PLANNING",
    label: "Lên kế hoạch triển khai",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    key: "IN_PROGRESS",
    label: "Đang triển khai kế hoạch",
    badgeClass:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  COMPLETED: {
    key: "COMPLETED",
    label: "Hoàn thành",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

/**
 * Get the implementation stage for a workspace:
 * 1. "Đang đàm phán Media Package" (amber) when packageNegotiationStatus !== 'APPROVED' or no package
 * 2. "Lên kế hoạch triển khai" (blue)
 * 3. "Đang triển khai kế hoạch" (indigo)
 * 4. "Hoàn thành" (emerald)
 */
export function getWorkspaceImplementationStage(
  ws: Workspace,
  index = 0
): ImplementationStageInfo {
  const isApproved =
    ws.packageNegotiationStatus === "APPROVED" &&
    Boolean(ws.workspaceMediaPackageId || ws.packageNegotiationStatus);

  const explicitStage =
    (ws as { implementationStage?: string }).implementationStage ||
    (ws.settings as { implementationStage?: string } | undefined)
      ?.implementationStage;

  if (
    explicitStage &&
    explicitStage in STAGE_CONFIGS
  ) {
    return STAGE_CONFIGS[explicitStage as WorkspaceImplementationStage];
  }

  if (!isApproved) {
    return STAGE_CONFIGS.NEGOTIATING;
  }

  // Deterministic fallback for approved workspaces
  const hash = Math.abs(
    ws.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), index)
  );
  const stages: WorkspaceImplementationStage[] = [
    "PLANNING",
    "IN_PROGRESS",
    "IN_PROGRESS",
    "COMPLETED",
  ];
  const chosenKey = stages[hash % stages.length];
  return STAGE_CONFIGS[chosenKey];
}
