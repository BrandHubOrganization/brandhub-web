import {
  Activity,
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Network,
  Radar,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const adminMenuGroups = [
  {
    title: "workspace",
    entries: [
      { key: "overview", icon: LayoutDashboard, planned: false },
      { key: "users", icon: Users, planned: false },
      { key: "moderation", icon: ShieldCheck, planned: false },
      { key: "health", icon: Activity, planned: false },
    ],
  },
  {
    title: "utilities",
    entries: [
      { key: "revenue", icon: Wallet, planned: false },
      { key: "invoices", icon: FileText, planned: false },
      { key: "email", icon: Mail, planned: false },
      { key: "mailSuppressions", icon: Mail, planned: false },
      { key: "workspaceTemplates", icon: LayoutDashboard, planned: false },
    ],
  },
  {
    title: "ai",
    entries: [
      { key: "credit", icon: Wallet, planned: false },
      { key: "crawl", icon: Radar, planned: false },
      { key: "trends", icon: TrendingUp, planned: false },
      { key: "trendGraph", icon: Network, planned: false },
      { key: "trendReplay", icon: Activity, planned: false },
    ],
  },
  {
    title: "help",
    entries: [
      { key: "guide", icon: BookOpen, planned: false },
      { key: "faq", icon: HelpCircle, planned: false },
    ],
  },
];

export const adminSections = adminMenuGroups.flatMap((group) => group.entries);

export const linkTo = (key: string) =>
  key === "credit"
    ? "/admin/credit-prices"
    : key === "invoices"
      ? "/admin/invoices"
      : key === "workspaceTemplates"
        ? "/admin/workspace-templates"
        : key === "health"
          ? "/admin/system-health"
          : key === "guide"
            ? "/admin/guide"
            : key === "faq"
              ? "/help/faq"
              : key === "overview"
                ? "/admin"
                : `/admin?view=${key}`;

export const labelKey = (key: string) =>
  key === "credit"
    ? "credit.price.title"
    : key === "health"
      ? "monitoring.title"
      : key === "guide"
        ? "admin.navigation.guide"
        : key === "faq"
          ? "admin.navigation.faq"
          : `admin.navigation.${key}`;

export function resolveAdminActiveKey(
  pathname: string,
  search: string,
): string {
  if (pathname === "/admin/guide") return "guide";
  if (pathname === "/admin/system-health") return "health";
  if (pathname === "/admin/credit-prices") return "credit";
  if (pathname === "/admin/invoices") return "invoices";
  if (pathname === "/admin/workspace-templates") return "workspaceTemplates";

  const params = new URLSearchParams(search);
  const rawView = params.get("view") || "overview";
  if (rawView === "reports") return "overview";
  const view = rawView === "trendPipeline" ? "crawl" : rawView;

  return adminSections.some(
    (section) => section.key === view && view !== "health",
  )
    ? view
    : "overview";
}

export interface AdminBreadcrumbData {
  groupTitleKey: string;
  groupPath: string;
  itemLabelKey: string;
  itemPath: string;
}

export function getAdminBreadcrumbData(
  pathname: string,
  search: string,
): AdminBreadcrumbData | null {
  if (!pathname.startsWith("/admin")) return null;

  const activeKey = resolveAdminActiveKey(pathname, search);
  const group = adminMenuGroups.find((g) =>
    g.entries.some((entry) => entry.key === activeKey),
  );

  if (!group) return null;

  return {
    groupTitleKey: `admin.navigation.${group.title}`,
    groupPath: linkTo(group.entries[0].key),
    itemLabelKey: labelKey(activeKey),
    itemPath: linkTo(activeKey),
  };
}
