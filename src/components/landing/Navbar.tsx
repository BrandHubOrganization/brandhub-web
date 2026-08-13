import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Languages, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "features", labelKey: "landing.nav.features" },
  { id: "how-it-works", labelKey: "landing.nav.howItWorks" },
  { id: "templates", labelKey: "landing.nav.templates" },
  { id: "testimonials", labelKey: "landing.nav.testimonials" },
  { id: "team", labelKey: "landing.nav.team" },
  { id: "pricing", labelKey: "landing.nav.pricing" },
  { id: "faq", labelKey: "landing.nav.faq" },
];

function useIsDark() {
  const { theme } = useTheme();
  if (theme !== "system") return theme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Nav ẩn trong lúc cinematic Hero còn đang pin-scroll, chỉ fade-in sau khi
 * user cuộn qua khỏi nó. Dùng viewport height làm ngưỡng ước lượng thay vì
 * con số cứng khớp với GSAP scrollTrigger `end: +=3500` — không cần đồng bộ
 * chính xác timeline, chỉ cần nav xuất hiện sau khi Hero không còn chiếm
 * toàn màn hình.
 */
function useShowAfterHero() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return show;
}

export function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const show = useShowAfterHero();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("brandhub-lang", next);
  };

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        show
          ? "translate-y-0 border-zinc-200 bg-white/90 opacity-100 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90"
          : "pointer-events-none -translate-y-full border-transparent opacity-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex shrink-0 cursor-pointer items-center gap-2"
        >
          <div className="bg-brand-orange flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white">
            B
          </div>
          <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
            BrandHub
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {t(link.labelKey)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t("common.switchLanguage")}
            title={t("common.switchLanguage")}
            className="hidden cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 sm:flex dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Languages className="size-3.5" />
            {i18n.language === "en" ? "EN" : "VI"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("common.toggleTheme")}
            title={t("common.toggleTheme")}
            className="hidden size-8 cursor-pointer items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 sm:flex dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:inline-flex dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("landing.nav.login")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="bg-brand-orange hover:bg-brand-orange/90 hidden cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors sm:inline-flex"
          >
            {t("landing.nav.register")}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md text-zinc-600 lg:hidden dark:text-zinc-300"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="cursor-pointer rounded-md px-3 py-2.5 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {t(link.labelKey)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            >
              <Languages className="size-3.5" />
              {i18n.language === "en" ? "EN" : "VI"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="cursor-pointer rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              {t("landing.nav.login")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="bg-brand-orange cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t("landing.nav.register")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
