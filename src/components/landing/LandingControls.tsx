import { useTranslation } from "react-i18next";
import { Languages, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

function useIsDark() {
  const { theme } = useTheme();
  if (theme !== "system") return theme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function LandingControls() {
  const { t, i18n } = useTranslation();
  const { setTheme } = useTheme();
  const isDark = useIsDark();

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("brandhub-lang", next);
  };

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/70 p-1 shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={t("common.switchLanguage")}
        title={t("common.switchLanguage")}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
      >
        <Languages className="size-3.5" />
        {i18n.language === "en" ? "EN" : "VI"}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t("common.toggleTheme")}
        title={t("common.toggleTheme")}
        className="flex size-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  );
}

export default LandingControls;
