import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";

export function AdminPage() {
  const { t } = useTranslation();
  return (
    <PageWrapper
      title={t("dashboard.admin.title")}
      description={t("dashboard.admin.description")}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-border bg-card space-y-4 rounded-xl border p-6">
          <h2 className="text-lg font-bold">
            {t("dashboard.admin.userManagementTitle")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("dashboard.admin.userManagementDescription")}
          </p>
          <div className="border-border text-muted-foreground bg-muted/10 flex h-28 items-center justify-center rounded border border-dashed text-xs">
            {t("dashboard.admin.userManagementPlaceholder")}
          </div>
        </div>

        <div className="border-border bg-card space-y-4 rounded-xl border p-6">
          <h2 className="text-lg font-bold">
            {t("dashboard.admin.systemConfigTitle")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("dashboard.admin.systemConfigDescription")}
          </p>
          <div className="border-border text-muted-foreground bg-muted/10 flex h-28 items-center justify-center rounded border border-dashed text-xs">
            {t("dashboard.admin.systemConfigPlaceholder")}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminPage;
