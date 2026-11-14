import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandHubLogo } from "@/components/auth/BrandHubLogo";
import {
  adminMenuGroups,
  adminSections,
  getAdminBreadcrumbData,
  labelKey,
  linkTo,
  resolveAdminActiveKey,
  type AdminBreadcrumbData,
} from "./sidebar/adminNavConfig";

export {
  getAdminBreadcrumbData,
  labelKey,
  linkTo,
  resolveAdminActiveKey,
  type AdminBreadcrumbData,
};

function useAdminView() {
  const { pathname, search } = useLocation();
  return resolveAdminActiveKey(pathname, search);
}

export function AdminMobileNavigation() {
  const { t } = useTranslation();
  const active = useAdminView();
  return (
    <nav
      aria-label={t("admin.navigation.label")}
      className="flex w-full items-center justify-around"
    >
      {adminSections.slice(0, 4).map(({ key, icon: Icon }) => (
        <Link
          key={key}
          to={linkTo(key)}
          aria-current={active === key ? "page" : undefined}
          className={cn(
            "focus-visible:outline-ring flex min-h-14 w-20 flex-col items-center justify-center gap-1 rounded-md text-xs focus-visible:outline-2",
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
  const [closedGroups, setClosedGroups] = React.useState<Set<string>>(
    new Set(),
  );
  const toggleGroup = (title: string) =>
    setClosedGroups((closed) => {
      const next = new Set(closed);
      if (!next.delete(title)) next.add(title);
      return next;
    });

  return (
    <div
      className={cn(
        "surface-dark flex h-full flex-col transition-all duration-200 select-none",
        collapsed ? "w-[60px]" : "w-[220px]",
        className,
      )}
      style={{
        background: "hsl(var(--sidebar, 240 6% 4%))",
        color: "hsl(var(--sidebar-foreground, 0 0% 98%))",
        borderRight: "1px solid hsl(var(--sidebar-border, 240 5% 15%))",
      }}
    >
      <Link
        to="/admin"
        onClick={onMobileItemClick}
        aria-label="BrandHub"
        className={cn(
          "focus-visible:outline-ring flex h-14 shrink-0 items-center border-b px-3 focus-visible:outline-2",
          collapsed ? "justify-center" : "gap-2.5",
        )}
        style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
      >
        <span className="flex size-7 shrink-0 items-center justify-center">
          <BrandHubLogo size={28} />
        </span>
        {!collapsed && (
          <span className="font-sans text-sm font-bold tracking-tight text-white">
            Brand<span className="text-brand-orange">Hub</span>
          </span>
        )}
      </Link>

      <nav
        aria-label={t("admin.navigation.label")}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 pt-4"
      >
        {adminMenuGroups.map((group, idx) => (
          <div key={group.title} className="space-y-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                aria-expanded={!closedGroups.has(group.title)}
                className="text-muted-foreground text-3xs mb-1 flex w-full cursor-pointer items-center justify-between rounded px-2.5 font-bold tracking-wider uppercase hover:text-white"
              >
                {t(`admin.navigation.${group.title}`)}
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform",
                    closedGroups.has(group.title) && "-rotate-90",
                  )}
                  aria-hidden="true"
                />
              </button>
            ) : (
              idx > 0 && <div className="bg-border mx-1 my-2 h-px opacity-20" />
            )}

            <div
              className="space-y-0.5"
              hidden={!collapsed && closedGroups.has(group.title)}
            >
              {group.entries.map(({ key, icon: Icon, planned }) => {
                const isActive = active === key;
                const label = t(labelKey(key));
                return (
                  <Link
                    key={key}
                    to={linkTo(key)}
                    onClick={onMobileItemClick}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    title={
                      collapsed
                        ? planned
                          ? `${label} · ${t("admin.navigation.planned")}`
                          : label
                        : undefined
                    }
                    className={cn(
                      "focus-visible:outline-ring flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                      collapsed && "justify-center",
                      isActive ? "font-semibold" : "hover:text-white",
                    )}
                    style={
                      isActive
                        ? {
                            background: "hsl(var(--primary))",
                            color: "#ffffff",
                          }
                        : {
                            color: "hsl(var(--sidebar-foreground, 0 0% 98%))",
                          }
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{label}</span>
                        {planned && (
                          <Clock3
                            className="size-3 opacity-60"
                            aria-hidden="true"
                          />
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "flex flex-col gap-0.5 border-t p-2",
          collapsed && "items-center",
        )}
        style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
      >
        {!collapsed && (
          <div className="text-muted-foreground text-3xs px-2.5 py-1 leading-snug">
            {t("nav.roleLabelPrefix")}{" "}
            <span className="font-semibold text-white">
              {t("admin.roles.ADMIN")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
