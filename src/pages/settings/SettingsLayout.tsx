import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

/**
 * Layout trang Cài đặt — mỗi mục (Hồ sơ/Bảo mật/Đổi mật khẩu/Thông báo) là
 * 1 route riêng dưới /settings/*. Điều hướng nằm ở sub-nav trong Sidebar chính,
 * không còn sub-nav riêng trong trang.
 */
export function SettingsLayout() {
  const { t } = useTranslation();
  const systemRole = useAuthStore((s) => s.user?.role ?? s.systemRole);

  useEffect(() => {
    document.title = `${t("settings.title")} | BrandHub`;
  }, [t]);

  if (systemRole === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default SettingsLayout;
