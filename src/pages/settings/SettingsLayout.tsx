import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, IdCard, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfilePage } from "@/pages/profile";
import { SecurityPage } from "@/pages/security";
import { ChangePasswordPage } from "@/pages/change-password";
import { NotificationSettingsPage } from "@/pages/notification-settings";

const SETTINGS_NAV = [
  { id: "profile", icon: IdCard, labelKey: "nav.profile" },
  { id: "security", icon: ShieldCheck, labelKey: "nav.security" },
  {
    id: "change-password",
    icon: KeyRound,
    labelKey: "nav.changePassword",
  },
  {
    id: "notifications",
    icon: Bell,
    labelKey: "settings.nav.notifications",
  },
];

/**
 * Trang Cài đặt one-page: tất cả mục (Hồ sơ/Bảo mật/Đổi mật khẩu/Thông báo)
 * render chung trong cùng 1 route /settings, không đổi URL khi chuyển mục.
 * Sub-nav trái chỉ scroll tới section tương ứng (anchor), không route.
 */
export function SettingsLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("settings.title")} | BrandHub`;
  }, [t]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-6 p-4 pb-24 md:flex-row md:p-8">
      <aside className="shrink-0 md:sticky md:top-4 md:h-fit md:w-56">
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {SETTINGS_NAV.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-10">
        <ProfilePage />
        <div className="border-border border-t" />
        <SecurityPage />
        <div className="border-border border-t" />
        <ChangePasswordPage />
        <div className="border-border border-t" />
        <NotificationSettingsPage />
      </div>
    </div>
  );
}

export default SettingsLayout;
