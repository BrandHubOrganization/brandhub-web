import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, string> = {
  CONTENT_CREATOR: "Creator",
  ACCOUNT_MANAGER: "Account Manager (AM)",
  BRAND_CLIENT: "Brand Client",
  AGENCY_OWNER: "Agency Owner",
  ADMIN: "Admin",
};

export interface NavbarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  onMobileMenuOpen: () => void;
}

export function Navbar({
  collapsed,
  toggleCollapsed,
  onMobileMenuOpen,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, setAuth } = useAuthStore();

  const currentRole = user?.role || "CONTENT_CREATOR";
  const username = user?.name || user?.email?.split("@")[0] || "User";

  // Dynamic breadcrumbs trail calculation
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard")
      return [{ label: "Dashboard", active: true }];

    const parts = path.split("/").filter(Boolean);
    return parts.map((part, index) => {
      const labelMap: Record<string, string> = {
        workspace: "Workspaces",
        portal: "Client Portal",
        editor: "Content Editor",
        calendar: "Calendar",
        analytics: "Analytics",
        admin: "Admin Panel",
        components: "Components",
        examples: "UI Primitives",
      };
      const label =
        labelMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
      return {
        label,
        active: index === parts.length - 1,
      };
    });
  };

  // Helper for simulating logins with different roles for testing
  const handleRoleSimulation = (role: UserRole) => {
    if (user) {
      setAuth(
        {
          ...user,
          role,
        },
        "simulated-access-token",
      );

      // Navigate to respective route on change
      if (role === "AGENCY_OWNER") navigate("/workspace");
      else if (role === "BRAND_CLIENT") navigate("/portal");
      else if (role === "ADMIN") navigate("/admin");
      else navigate("/");
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header
      className="border-border bg-card z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 select-none"
      style={{
        borderColor: "var(--hairline, #e4e4e7)",
        background: "var(--canvas, #fafafa)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-8 md:hidden"
          onClick={onMobileMenuOpen}
        >
          <Menu className="size-4" />
        </Button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggleCollapsed}
          className="text-muted-foreground hover:bg-accent hover:text-foreground hidden h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors md:flex"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="text-muted-foreground hidden items-center gap-1.5 truncate text-xs sm:flex">
          <span
            className="hover:text-foreground cursor-pointer font-medium"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          {getBreadcrumbs().map((b, i) => (
            <React.Fragment key={i}>
              <span className="text-muted-foreground/45 shrink-0">/</span>
              <span
                className={cn(
                  b.active
                    ? "text-foreground truncate font-semibold"
                    : "hover:text-foreground shrink-0 cursor-pointer",
                )}
              >
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Role Simulator Selector (Handy for debugging & evaluation) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-dashed px-2.5 text-xs font-medium transition-colors outline-none"
            style={{
              borderColor: "var(--brand-orange, #f05a28)",
              color: "var(--brand-orange, #f05a28)",
              background: "var(--brand-orange-soft, #fff0eb)",
            }}
          >
            <ShieldAlert className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">
              Role: {ROLE_LABELS[currentRole]}
            </span>
            <span className="sm:hidden">
              {ROLE_LABELS[currentRole].split(" ")[0]}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel className="text-xs">
              Mô phỏng Phân quyền
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleRoleSimulation(key)}
                className={cn(
                  "cursor-pointer text-xs font-medium",
                  currentRole === key ? "bg-accent" : "",
                )}
                style={
                  currentRole === key
                    ? { color: "var(--brand-orange, #f05a28)" }
                    : {}
                }
              >
                {ROLE_LABELS[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:bg-accent hover:text-foreground relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors outline-none">
            <Bell className="size-4" />
            <span
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--brand-orange, #f05a28)" }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-2">
            <DropdownMenuLabel className="flex items-center justify-between text-xs">
              <span>Thông báo</span>
              <Badge
                className="flex h-4 items-center justify-center px-1.5 text-[9px]"
                style={{
                  background: "var(--brand-orange, #f05a28)",
                  color: "white",
                }}
              >
                2 Mới
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-1.5 py-1">
              <div className="hover:bg-accent cursor-pointer rounded-md p-2 text-xs transition-colors">
                <p className="text-foreground font-semibold">
                  Tuấn (Creator) đã gửi bài viết
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Campaign 'Kem chống nắng' đang chờ duyệt.
                </p>
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  2 phút trước
                </span>
              </div>
              <div className="hover:bg-accent cursor-pointer rounded-md p-2 text-xs transition-colors">
                <p className="text-foreground font-semibold">
                  Hùng (Client) từ chối duyệt bài
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Yêu cầu sửa lại thiết kế font chữ trong ảnh.
                </p>
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  1 giờ trước
                </span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 cursor-pointer outline-none">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--brand-orange, #f05a28)" }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-foreground truncate text-xs font-bold">
                {username}
              </span>
              <span className="text-muted-foreground truncate text-[9px]">
                {ROLE_LABELS[currentRole]}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-xs"
              onClick={() => navigate("/")}
            >
              <Settings className="text-muted-foreground size-3.5" /> Thiết lập
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:text-red-650 cursor-pointer gap-2 text-xs text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="size-3.5" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Navbar;
