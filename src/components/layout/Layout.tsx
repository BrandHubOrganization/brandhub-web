import * as React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FolderOpen,
  FileEdit,
  CalendarDays,
  Users,
  BarChart3,
} from "lucide-react";

const MOBILE_TABS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/editor", icon: FileEdit, label: "Editor" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/workspace", icon: FolderOpen, label: "Workspaces" },
  { to: "/portal", icon: Users, label: "Portal" },
];

export function Layout() {
  const { user } = useAuthStore();
  const currentRole = user?.role || "CONTENT_CREATOR";

  // Sidebar collapse state loaded from localStorage
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("brandhub_sidebar_collapsed");
    return saved === "true";
  });

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("brandhub_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Auto-collapse sidebar at window width < 1280px and desktop mode >= 768px
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        const saved = localStorage.getItem("brandhub_sidebar_collapsed");
        setCollapsed(saved === "true");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter mobile tabs based on role
  const filteredMobileTabs = MOBILE_TABS.filter((tab) => {
    if (currentRole === "BRAND_CLIENT" && (tab.to === "/workspace" || tab.to === "/editor")) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* ── SIDEBAR (DESKTOP >= 768px) ── */}
      <aside className="hidden md:block shrink-0 h-full">
        <Sidebar collapsed={collapsed} role={currentRole} />
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        {/* Dynamic Mobile Sheet Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[240px] border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar
              collapsed={false}
              role={currentRole}
              onMobileItemClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#fafafa] dark:bg-[#09090b]">
          <Outlet />
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (MOBILE ONLY <= 768px) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 border-t border-border z-40 flex justify-around items-center md:hidden pb-safe"
        style={{
          background: "var(--card, #ffffff)",
          borderColor: "var(--border, #e4e4e7)",
        }}
      >
        {filteredMobileTabs.slice(0, 5).map(({ to, icon: Icon, label }) => {
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[10px] w-12 py-1.5 transition-colors cursor-pointer ${
                  isActive ? "text-brand-orange font-semibold" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate max-w-[55px]">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default Layout;
