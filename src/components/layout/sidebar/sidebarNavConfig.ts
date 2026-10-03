import type * as React from "react";
import {
  LayoutDashboard,
  FileEdit,
  CalendarDays,
  Users,
  BarChart3,
  ShieldAlert,
  FolderKanban,
  LayoutTemplate,
  Hash,
  Send,
  Link2,
  CreditCard,
  Sparkles,
  Palette,
  Building2,
  FileBarChart,
  User,
  Inbox,
  UserCheck,
  Briefcase,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  BookOpen,
} from "lucide-react";

export interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  /** Chỉ hiện khi role hiện tại là CLIENT — cần currentAgencyId để build URL. */
  clientOnly?: boolean;
  /** URL cần currentAgencyId để build (thay {agencyId} trong `to`) — ẩn nếu chưa có agency active. */
  agencyScoped?: boolean;
  /** Ẩn hẳn với role CLIENT (client không phải nhân sự agency nội bộ). */
  hiddenForClient?: boolean;
  /** Route agency-wide (đọc theo currentAgencyId, không mang workspaceId) —
   * ẩn khi đang trong 1 workspace cụ thể để tránh bấm nhầm rồi bị đẩy ra
   * khỏi ngữ cảnh workspace về agency. */
  hideInWorkspace?: boolean;
  /** Chỉ hiện khi CHƯA chọn agency nào (currentAgencyId null) — mục
   * user-level, không gắn agency/workspace cụ thể nào. */
  noAgencyOnly?: boolean;
  /** URL đổi theo activeWorkspace — thay {workspaceId} trong `to`. Khi
   * chưa có activeWorkspace, giữ nguyên `to` gốc (route agency-level, vd
   * /dashboard, /analytics landing chung). */
  workspaceScoped?: boolean;
  /** Route CHỈ tồn tại dạng /workspaces/:id/... — không có bản fallback ở
   * `to` gốc (khác /dashboard vẫn có cả 2 bản). Thiếu activeWorkspace thì
   * ẩn hẳn thay vì để `to` trỏ vào route đã bị xoá. */
  requiresWorkspace?: boolean;
  /** Ẩn khi đang chọn 1 agency cụ thể (currentAgencyId != null). Dùng cho
   * các mục thuộc "user module" (client-profiles, social-accounts, subscription,
   * client/invitations, ...) — không gắn với ngữ cảnh agency cụ thể nào,
   * chỉ hiện khi user chưa vào agency hoặc đang dùng tính năng cá nhân. */
  hideInAgency?: boolean;
  /** Mục con hiển thị thụt lề dưới item cha. Dùng cho các anchor trong cùng
   * 1 trang (vd 4 mục của /settings) — `to` gồm cả hash. */
  children?: { to: string; labelKey: string }[];
}

export interface NavSection {
  key: string;
  titleKey: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "overview",
    titleKey: "nav.sections.overview",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        labelKey: "nav.dashboard",
        workspaceScoped: true,
      },
      {
        to: "/analytics",
        icon: BarChart3,
        labelKey: "nav.analytics",
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "create",
    titleKey: "nav.sections.create",
    items: [
      {
        to: "/requests",
        icon: FileEdit,
        labelKey: "nav.requests",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/editor",
        icon: FileEdit,
        labelKey: "nav.editor",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/content-writing",
        icon: FileEdit,
        labelKey: "nav.contentWriting",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/templates",
        icon: LayoutTemplate,
        labelKey: "nav.templates",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/hashtag-groups",
        icon: Hash,
        labelKey: "nav.hashtagGroups",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/calendar",
        icon: CalendarDays,
        labelKey: "nav.calendar",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/library",
        icon: FolderKanban,
        labelKey: "nav.library",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/publish",
        icon: Send,
        labelKey: "nav.publish",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
    ],
  },
  {
    key: "agency",
    titleKey: "nav.sections.agency",
    items: [
      {
        to: "/agency/{agencyId}",
        icon: Building2,
        labelKey: "nav.agencySub.profile",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
      {
        to: "/agency/{agencyId}/members",
        icon: Users,
        labelKey: "nav.agencySub.members",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
      {
        to: "/agency/{agencyId}/roles",
        icon: Shield,
        labelKey: "nav.agencySub.roles",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "workspaceSettings",
    titleKey: "nav.sections.workspaceSettings",
    items: [
      {
        to: "/settings",
        icon: Settings,
        labelKey: "nav.workspaceSub.settings",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/members",
        icon: Users,
        labelKey: "nav.workspaceSub.members",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/clients",
        icon: Building2,
        labelKey: "nav.workspaceSub.clients",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/client-profile",
        icon: Palette,
        labelKey: "nav.workspaceClientProfile",
        workspaceScoped: true,
        requiresWorkspace: true,
        clientOnly: true,
      },
      {
        to: "/portal",
        icon: Users,
        labelKey: "nav.portal",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
    ],
  },
  {
    key: "lists",
    titleKey: "nav.sections.lists",
    items: [
      {
        to: "/agency",
        icon: Building2,
        labelKey: "nav.agencyList",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/workspace",
        icon: Briefcase,
        labelKey: "nav.workspaceList",
        hideInWorkspace: true,
      },
      {
        to: "/client-profiles",
        icon: Palette,
        labelKey: "nav.clientProfile",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/clients",
        icon: Building2,
        labelKey: "nav.clients",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/ai-studio/ambassadors",
        icon: Sparkles,
        labelKey: "nav.aiStudio",
        hideInWorkspace: true,
      },
      {
        to: "/reports",
        icon: FileBarChart,
        labelKey: "nav.reports",
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "invitations",
    titleKey: "nav.sections.invitations",
    items: [
      {
        to: "/agency/invitations",
        icon: Inbox,
        labelKey: "nav.agencyInvitationInbox",
        hiddenForClient: true,
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/client/invitations",
        icon: UserCheck,
        labelKey: "nav.clientInvitations",
        hideInWorkspace: true,
        hideInAgency: true,
      },
    ],
  },
  {
    key: "settings",
    titleKey: "nav.sections.settings",
    items: [
      {
        to: "/settings/profile",
        icon: User,
        labelKey: "nav.profile",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/security",
        icon: Shield,
        labelKey: "nav.security",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/connections",
        icon: Link2,
        labelKey: "nav.connections",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/notifications",
        icon: Bell,
        labelKey: "nav.notificationSettings",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/social-accounts",
        icon: Link2,
        labelKey: "nav.socialAccounts",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/subscription/plans",
        icon: CreditCard,
        labelKey: "nav.subscription",
        hideInWorkspace: true,
        hideInAgency: true,
      },
    ],
  },
  {
    key: "help",
    titleKey: "nav.sections.help",
    items: [
      {
        to: "/help/faq",
        icon: HelpCircle,
        labelKey: "nav.faq",
      },
      {
        to: "/help/guide",
        icon: BookOpen,
        labelKey: "nav.guide",
      },
    ],
  },
  {
    key: "system",
    titleKey: "nav.sections.system",
    items: [
      { to: "/admin", icon: ShieldAlert, labelKey: "nav.admin" },
      {
        to: "/admin/system-health",
        icon: ShieldAlert,
        labelKey: "monitoring.title",
      },
    ],
  },
];
