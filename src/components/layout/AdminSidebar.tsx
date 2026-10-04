import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Clock3,
  FileChartColumn,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const sections = [
  { key: "overview", icon: LayoutDashboard, planned: false },
  { key: "users", icon: Users, planned: false },
  { key: "moderation", icon: ShieldCheck, planned: true },
  { key: "health", icon: Activity, planned: false },
  { key: "revenue", icon: Wallet, planned: false },
  { key: "email", icon: Mail, planned: false },
  { key: "reports", icon: FileChartColumn, planned: false },
];
const linkTo = (key: string) =>
  key === "health"
    ? "/admin/system-health"
    : key === "overview"
      ? "/admin"
      : `/admin?view=${key}`;
const labelKey = (key: string) =>
  key === "health" ? "monitoring.title" : `admin.navigation.${key}`;

function useAdminView() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const view = params.get("view") || "overview";
  if (pathname === "/admin/system-health") return "health";
  return sections.some((section) => section.key === view && view !== "health")
    ? view
    : "overview";
}

export function AdminMobileNavigation() {
  const { t } = useTranslation();
  const active = useAdminView();
  return (
    <nav
      aria-label={t("admin.navigation.label")}
      className="flex w-full items-center justify-around"
    >
      {sections.slice(0, 4).map(({ key, icon: Icon }) => (
        <Link
          key={key}
          to={linkTo(key)}
          aria-current={active === key ? "page" : undefined}
          className={cn(
            "focus-visible:outline-ring text-2xs flex min-h-14 w-20 flex-col items-center justify-center gap-1 rounded-md focus-visible:outline-2",
            active === key
              ? "text-brand-orange font-semibold"
              : "text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
          <span>{t(labelKey(key))}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AdminSidebar({
  collapsed,
  className,
  onMobileItemClick,
}: {
  collapsed: boolean;
  className?: string;
  onMobileItemClick?: () => void;
}) {
  const { t } = useTranslation();
  const active = useAdminView();
  const user = useAuthStore((s) => s.user);
  const username = user?.name || user?.email || t("admin.roles.ADMIN");
  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]",
        collapsed ? "w-[60px]" : "w-[220px]",
        className,
      )}
    >
      <Link
        to="/admin"
        onClick={onMobileItemClick}
        aria-label="BrandHub"
        className={cn(
          "focus-visible:outline-ring flex h-14 shrink-0 items-center gap-2.5 border-b border-[hsl(var(--sidebar-border))] px-5 focus-visible:outline-2",
          collapsed && "justify-center px-0",
        )}
      >
        <Workflow className="text-brand-orange size-6 shrink-0" />
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">
            Brand<span className="text-brand-orange">Hub</span>
          </span>
        )}
      </Link>
      <nav
        aria-label={t("admin.navigation.label")}
        className="flex-1 overflow-y-auto px-3 py-6"
      >
        {[
          { title: "workspace", entries: sections.slice(0, 5) },
          { title: "utilities", entries: sections.slice(5) },
        ].map((group) => (
          <div key={group.title} className="mb-7">
            {!collapsed && (
              <p className="text-2xs mb-3 px-3 font-mono tracking-wide uppercase opacity-50">
                {t(`admin.navigation.${group.title}`)}
              </p>
            )}
            <div className="space-y-1">
              {group.entries.map(({ key, icon: Icon, planned }) => (
                <Link
                  key={key}
                  to={linkTo(key)}
                  onClick={onMobileItemClick}
                  aria-label={t(labelKey(key))}
                  aria-current={active === key ? "page" : undefined}
                  title={
                    planned
                      ? `${t(labelKey(key))} · ${t("admin.navigation.planned")}`
                      : t(labelKey(key))
                  }
                  className={cn(
                    "focus-visible:outline-ring flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    collapsed && "justify-center px-0",
                    active === key
                      ? "bg-brand-orange text-primary-foreground font-medium"
                      : "text-[hsl(var(--sidebar-foreground))]/65 hover:bg-[hsl(var(--sidebar-foreground))]/5 hover:text-[hsl(var(--sidebar-foreground))]",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{t(labelKey(key))}</span>
                      {planned && (
                        <Clock3
                          className="size-3 opacity-60"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-t border-[hsl(var(--sidebar-border))] p-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span
          className="bg-brand-orange/15 text-brand-orange grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold"
          aria-hidden="true"
        >
          {username.charAt(0).toUpperCase()}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{username}</p>
            <p className="text-2xs mt-1 font-mono tracking-wide uppercase opacity-50">
              {t("admin.roles.ADMIN")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
