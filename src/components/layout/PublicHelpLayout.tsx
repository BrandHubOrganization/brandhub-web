import { Suspense, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageFallback } from "./PageFallback";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  BookOpen,
  HelpCircle,
  LogIn,
  Home,
  Moon,
  Sun,
  Languages,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function PublicHelpLayout() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const systemRole = useAuthStore((s) => s.systemRole);
  const isAdmin = systemRole === "ADMIN";
  const { theme, setTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isBlogActive = location.pathname.startsWith("/blog");
  const isFaqActive = location.pathname.startsWith("/help/faq");
  const isGuideActive = location.pathname.startsWith("/admin/guide");

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("vi") ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ── TOP PUBLIC HEADER ── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="w-full flex h-15 items-center justify-between px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-16">
          {/* Logo BrandHub */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <BrandLogo size="md" />
            </Link>

            {/* Quick Links */}
            <nav className="hidden md:flex items-center gap-2 text-xs">
              <Link
                to="/blog"
                className={cn(
                  "rounded-lg px-3 py-1.5 transition-colors font-medium flex items-center gap-1.5",
                  isBlogActive
                    ? "text-brand-orange bg-brand-orange/10 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <BookOpen className="size-3.5 text-brand-orange" />
                <span>Blog &amp; Cẩm nang</span>
              </Link>
              <Link
                to="/help/faq"
                className={cn(
                  "rounded-lg px-3 py-1.5 transition-colors font-medium flex items-center gap-1.5",
                  isFaqActive
                    ? "text-brand-orange bg-brand-orange/10 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <HelpCircle className="size-3.5 text-brand-orange" />
                <span>Hỏi đáp FAQ</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/guide"
                  className={cn(
                    "rounded-lg px-3 py-1.5 transition-colors font-medium flex items-center gap-1.5",
                    isGuideActive
                      ? "text-brand-orange bg-brand-orange/10 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Compass className="size-3.5 text-brand-orange" />
                  <span>Cẩm nang Quản trị</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Lang switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Đổi ngôn ngữ"
            >
              <Languages className="size-4" />
              <span className="uppercase text-3xs font-semibold">
                {i18n.language.slice(0, 2)}
              </span>
            </button>

            {/* Theme switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
              title="Đổi giao diện"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>

            {isAuthenticated ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1.5 text-xs h-8 ml-1"
              >
                <Home className="size-3.5" />
                <span className="hidden sm:inline">Vào Dashboard</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="cursor-pointer gap-1.5 text-xs h-8 hidden sm:inline-flex"
                >
                  <LogIn className="size-3.5" />
                  <span>Đăng nhập</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1 text-xs h-8"
                >
                  <span>Dùng thử</span>
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted ml-1"
              aria-label={mobileNavOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted font-medium"
            >
              <Home className="size-4 text-brand-orange" />
              <span>Trang chủ</span>
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                isBlogActive
                  ? "text-brand-orange bg-brand-orange/10 font-bold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <BookOpen className="size-4 text-brand-orange" />
              <span>Blog &amp; Cẩm nang</span>
            </Link>
            <Link
              to="/help/faq"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                isFaqActive
                  ? "text-brand-orange bg-brand-orange/10 font-bold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <HelpCircle className="size-4 text-brand-orange" />
              <span>Hỏi đáp FAQ</span>
            </Link>
            {!isAuthenticated && (
              <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileNavOpen(false);
                    navigate("/login");
                  }}
                  className="flex-1 text-xs"
                >
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setMobileNavOpen(false);
                    navigate("/register");
                  }}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs"
                >
                  Đăng ký dùng thử
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {/* ── COMPACT FOOTER ── */}
      <footer className="border-t border-border/80 bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} BrandHub. Trung tâm Trợ giúp & Tài nguyên.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link to="/blog" className="hover:text-foreground transition-colors font-medium">
              Blog &amp; Cẩm nang
            </Link>
            <Link to="/help/faq" className="hover:text-foreground transition-colors">
              Hỏi đáp FAQ
            </Link>
            {isAdmin && (
              <Link to="/admin/guide" className="hover:text-foreground transition-colors">
                Cẩm nang quản trị
              </Link>
            )}
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:brandhub404@gmail.com" className="hover:text-foreground transition-colors">
              brandhub404@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicHelpLayout;
