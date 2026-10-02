import { Outlet, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  HelpCircle,
  LogIn,
  Home,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/theme-provider";

export function PublicHelpLayout() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { theme, setTheme } = useTheme();

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
        <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo BrandHub */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-brand-orange flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-xs">
                B
              </div>
              <span className="text-base font-extrabold tracking-tight text-foreground">
                BrandHub
              </span>
            </Link>

            {/* Quick Links */}
            <nav className="hidden md:flex items-center gap-4 text-xs">
              <Link
                to="/help/faq"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2.5 py-1.5 transition-colors font-medium flex items-center gap-1.5"
              >
                <HelpCircle className="size-3.5 text-brand-orange" />
                Hỏi đáp FAQ
              </Link>
              <Link
                to="/help/guide"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2.5 py-1.5 transition-colors font-medium flex items-center gap-1.5"
              >
                <BookOpen className="size-3.5 text-brand-orange" />
                Cẩm nang Quản trị
              </Link>
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
                className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1.5 text-xs h-8 ml-2"
              >
                <Home className="size-3.5" />
                Vào Dashboard
              </Button>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="cursor-pointer gap-1.5 text-xs h-8"
                >
                  <LogIn className="size-3.5" />
                  Đăng nhập
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1 text-xs h-8"
                >
                  Dùng thử ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* ── COMPACT FOOTER ── */}
      <footer className="border-t border-border/80 bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} BrandHub. Trung tâm Trợ giúp & Tài nguyên.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/help/faq" className="hover:text-foreground transition-colors">
              Hỏi đáp FAQ
            </Link>
            <Link to="/help/guide" className="hover:text-foreground transition-colors">
              Cẩm nang quản trị
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
