import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Layout trang Cài đặt — mỗi mục (Hồ sơ/Bảo mật/Đổi mật khẩu/Thông báo) là
 * 1 route riêng dưới /settings/*. Điều hướng nằm ở sub-nav trong Sidebar chính,
 * không còn sub-nav riêng trong trang.
 */
export function SettingsLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("settings.title")} | BrandHub`;
  }, [t]);

  return (
    <div className="container mx-auto max-w-4xl p-4 pb-24 md:p-8">
      <Outlet />
    </div>
  );
}

export default SettingsLayout;
