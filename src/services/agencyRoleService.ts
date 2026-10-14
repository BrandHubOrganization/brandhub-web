import type { AgencyPermissionItem, AgencyRoleDefinition } from "@/types/agency";

export const AGENCY_PERMISSIONS: AgencyPermissionItem[] = [
  // A. QUẢN TRỊ AGENCY
  {
    key: "agency.profile.edit",
    name: "Chỉnh sửa thông tin công ty",
    description: "Cập nhật tên, logo, màu sắc thương hiệu, thông tin liên hệ của agency.",
    group: "AGENCY",
  },
  {
    key: "agency.members.manage",
    name: "Quản lý thành viên công ty",
    description: "Mời thành viên mới, xóa thành viên, cập nhật vai trò nội bộ.",
    group: "AGENCY",
  },
  {
    key: "agency.roles.manage",
    name: "Cấu hình vai trò & phân quyền",
    description: "Tạo vai trò tùy biến, chỉnh sửa ma trận quyền hạn cho các vai trò.",
    group: "AGENCY",
  },
  {
    key: "agency.audit.view",
    name: "Xem nhật ký hoạt động (Audit Log)",
    description: "Truy cập toàn bộ lịch sử thao tác, hoạt động của nhân sự trên hệ thống.",
    group: "AGENCY",
  },
  {
    key: "agency.billing.manage",
    name: "Quản lý gói cước & thanh toán",
    description: "Xem hạn mức, nâng cấp gói, quản lý hóa đơn và phương thức thanh toán.",
    group: "AGENCY",
  },

  // B. WORKSPACE & KHÁCH HÀNG
  {
    key: "workspace.create",
    name: "Tạo không gian làm việc (Workspace)",
    description: "Khởi tạo workspace thương hiệu mới cho khách hàng.",
    group: "WORKSPACE",
  },
  {
    key: "workspace.delete",
    name: "Xóa & lưu trữ Workspace",
    description: "Đóng hoặc xóa vĩnh viễn các workspace thương hiệu.",
    group: "WORKSPACE",
  },
  {
    key: "workspace.members.assign",
    name: "Phân công nhân sự vào Workspace",
    description: "Chỉ định thành viên agency vào các workspace cụ thể.",
    group: "WORKSPACE",
  },
  {
    key: "workspace.clients.manage",
    name: "Mời & quản lý khách hàng (Client)",
    description: "Tạo hồ sơ client, cấp quyền truy cập Client Portal cho đối tác.",
    group: "WORKSPACE",
  },

  // C. NỘI DUNG & XUẤT BẢN
  {
    key: "content.create",
    name: "Tạo bài viết & tải lên Media",
    description: "Soạn thảo bài viết mới, tải ảnh, video vào Content Library.",
    group: "CONTENT",
  },
  {
    key: "content.edit",
    name: "Chỉnh sửa nội dung & mẫu thiết kế",
    description: "Chỉnh sửa bài nháp, template mẫu, nhóm hashtag của workspace.",
    group: "CONTENT",
  },
  {
    key: "content.approve",
    name: "Phê duyệt bài viết (Approval Workflow)",
    description: "Duyệt hoặc từ chối bài viết từ nhân viên trước khi xuất bản.",
    group: "CONTENT",
  },
  {
    key: "content.publish",
    name: "Xuất bản bài viết lên Mạng xã hội",
    description: "Lên lịch và đăng tải trực tiếp bài viết qua các kênh mạng xã hội.",
    group: "CONTENT",
  },
  {
    key: "content.delete",
    name: "Xóa bài viết & dữ liệu nội dung",
    description: "Gỡ bỏ bài viết hoặc tài nguyên media đã tải lên.",
    group: "CONTENT",
  },

  // D. PHÂN TÍCH & BÁO CÁO
  {
    key: "analytics.view",
    name: "Xem bảng phân tích số liệu",
    description: "Theo dõi biểu đồ tăng trưởng, tương tác, KPI và khung giờ vàng.",
    group: "ANALYTICS",
  },
  {
    key: "reports.export",
    name: "Xuất báo cáo (PDF / Excel)",
    description: "In và tải về báo cáo tổng hợp kết quả chiến dịch của agency.",
    group: "ANALYTICS",
  },
];

export const INITIAL_AGENCY_ROLES: AgencyRoleDefinition[] = [
  {
    id: "role_owner",
    key: "OWNER",
    name: "Chủ sở hữu (Owner)",
    description: "Toàn quyền quản trị và sở hữu Agency. Không thể xóa hay hạn chế quyền.",
    badgeColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/30",
    isSystem: true,
    permissions: AGENCY_PERMISSIONS.map((p) => p.key),
    memberCount: 1,
  },
  {
    id: "role_admin",
    key: "ADMIN",
    name: "Quản lý công ty (Agency Manager)",
    description: "Quản trị vận hành nhân sự nội bộ, tạo workspace, duyệt chi phí và điều hành hoạt động của Agency.",
    badgeColor: "bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-700",
    isSystem: true,
    permissions: [
      "agency.profile.edit",
      "agency.members.manage",
      "agency.roles.manage",
      "agency.audit.view",
      "workspace.create",
      "workspace.members.assign",
      "workspace.clients.manage",
      "content.create",
      "content.edit",
      "content.approve",
      "content.publish",
      "analytics.view",
      "reports.export",
    ],
    memberCount: 2,
  },
  {
    id: "role_pm",
    key: "PROJECT_MANAGER",
    name: "Quản lý dự án (Project Manager)",
    description: "Quản lý các workspace được chỉ định, phân công nhân sự, mời client và duyệt nội dung.",
    badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700",
    isSystem: true,
    permissions: [
      "workspace.create",
      "workspace.members.assign",
      "workspace.clients.manage",
      "content.create",
      "content.edit",
      "content.approve",
      "content.publish",
      "analytics.view",
      "reports.export",
    ],
    memberCount: 3,
  },
  {
    id: "role_creator",
    key: "CREATOR",
    name: "Nhân viên sáng tạo (Creator)",
    description: "Sáng tạo nội dung, thiết kế hình ảnh, tải media và lên lịch bài viết.",
    badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80",
    isSystem: true,
    permissions: [
      "content.create",
      "content.edit",
      "analytics.view",
    ],
    memberCount: 6,
  },
  {
    id: "role_viewer",
    key: "VIEWER",
    name: "Khách / Kiểm toán (Viewer)",
    description: "Chỉ được phép xem báo cáo thống kê, không có quyền tạo hay sửa dữ liệu.",
    badgeColor: "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800",
    isSystem: true,
    permissions: [
      "analytics.view",
      "reports.export",
    ],
    memberCount: 1,
  },
];

const LOCAL_STORAGE_KEY_PREFIX = "brandhub_agency_roles_";
export const AGENCY_ROLES_UPDATED_EVENT = "brandhub_agency_roles_updated";

function notifyRolesChanged(agencyId: string, roles: AgencyRoleDefinition[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AGENCY_ROLES_UPDATED_EVENT, {
        detail: { agencyId, roles },
      })
    );
  }
}

export const agencyRoleService = {
  getRoles: (agencyId: string): AgencyRoleDefinition[] => {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${agencyId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return INITIAL_AGENCY_ROLES;
  },

  saveRoles: (agencyId: string, roles: AgencyRoleDefinition[]): void => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${agencyId}`, JSON.stringify(roles));
      notifyRolesChanged(agencyId, roles);
    } catch {
      // ignore
    }
  },

  togglePermission: (agencyId: string, roleKey: string, permissionKey: string): AgencyRoleDefinition[] => {
    const roles = agencyRoleService.getRoles(agencyId);
    const updated = roles.map((r) => {
      if (r.key !== roleKey || r.key === "OWNER") return r; // Owner luôn có tất cả quyền
      const exists = r.permissions.includes(permissionKey);
      const newPerms = exists
        ? r.permissions.filter((p) => p !== permissionKey)
        : [...r.permissions, permissionKey];
      return { ...r, permissions: newPerms };
    });
    agencyRoleService.saveRoles(agencyId, updated);
    return updated;
  },

  createCustomRole: (
    agencyId: string,
    payload: { name: string; description: string; baseRoleKey?: string }
  ): AgencyRoleDefinition => {
    const roles = agencyRoleService.getRoles(agencyId);
    const key = `CUSTOM_${payload.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${Date.now().toString().slice(-4)}`;
    
    // Sao chép permissions từ base role nếu có
    let inheritedPermissions: string[] = [];
    if (payload.baseRoleKey) {
      const baseRole = roles.find((r) => r.key === payload.baseRoleKey);
      if (baseRole) inheritedPermissions = [...baseRole.permissions];
    }

    const newRole: AgencyRoleDefinition = {
      id: `role_${Date.now()}`,
      key,
      name: payload.name.trim(),
      description: payload.description.trim() || "Vai trò tùy biến do Agency tự định nghĩa.",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      isSystem: false,
      permissions: inheritedPermissions,
      memberCount: 0,
    };

    const updated = [...roles, newRole];
    agencyRoleService.saveRoles(agencyId, updated);
    return newRole;
  },

  deleteCustomRole: (agencyId: string, roleKey: string): AgencyRoleDefinition[] => {
    const roles = agencyRoleService.getRoles(agencyId);
    const updated = roles.filter((r) => r.key !== roleKey || r.isSystem);
    agencyRoleService.saveRoles(agencyId, updated);
    return updated;
  },
};
