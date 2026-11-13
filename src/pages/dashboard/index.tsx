import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Settings, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useUserDashboardData } from "./hooks/useUserDashboardData";
import { UserOrganizationTabs } from "./components/UserOrganizationTabs";
import { UserAccountStatusSection } from "./components/UserAccountStatusSection";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    ownedAgencies,
    participatingAgencies,
    brandProfiles,
    workspaces,
    pendingInvitations,
    isLoading,
    isRefreshing,
    hasError,
    agenciesError,
    profilesError,
    workspacesError,
    invitationsLoading,
    invitationsError,
    isActionLoading,
    refresh,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useUserDashboardData();

  const greetingName = user?.name || t("dashboard.experience.you");

  return (
    <PageWrapper
      title={t("dashboard.experience.hello", { name: greetingName })}
      description={t("dashboard.experience.homeHint")}
      hideHeader={true}
      compact={true}
    >
      <div className="space-y-5 pb-8">
        {hasError && (
          <div
            role="alert"
            className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
          >
            <span>{t("dashboard.experience.partial")}</span>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              {t("dashboard.experience.retry")}
            </Button>
          </div>
        )}
        {/* ── 1. HEADER GREETING INLINE ── */}
        <div className="border-border/50 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
              {t("dashboard.experience.hello", { name: greetingName })}
            </h1>
            <p className="text-muted-foreground text-xs">
              {t("dashboard.experience.homeHint")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              onClick={() => refresh()}
              variant="outline"
              size="sm"
              disabled={isLoading || isRefreshing}
              className="border-border hover:border-brand-orange/40 hover:text-brand-orange text-muted-foreground h-8 px-2.5 text-xs shadow-2xs transition-colors"
              aria-label={t("dashboard.experience.refresh")}
              title={t("dashboard.experience.refresh")}
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              onClick={() => navigate("/settings/profile")}
              variant="outline"
              size="sm"
              className="border-border hover:border-brand-orange/40 hover:text-brand-orange text-foreground inline-flex h-8 items-center gap-1.5 px-3 text-xs font-medium shadow-2xs transition-colors"
            >
              <Settings className="size-3.5" />
              <span>{t("dashboard.experience.account")}</span>
            </Button>
          </div>
        </div>

        {/* ── 2. BỐ CỤC 2 CỘT SONG SONG ── */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* CỘT TRÁI (8 COLS): TỔ CHỨC & THƯƠNG HIỆU DẠNG TABS */}
          <div className="lg:col-span-9">
            <UserOrganizationTabs
              ownedAgencies={ownedAgencies}
              participatingAgencies={participatingAgencies}
              brandProfiles={brandProfiles}
              workspaces={workspaces}
              isLoading={isLoading}
              agenciesError={agenciesError}
              profilesError={profilesError}
              workspacesError={workspacesError}
              onRetry={() => void refresh()}
            />
          </div>

          {/* CỘT PHẢI (4 COLS): THÔNG TIN TÀI KHOẢN & LỜI MỜI */}
          <div className="lg:col-span-3">
            <UserAccountStatusSection
              user={user}
              pendingInvitations={pendingInvitations}
              isActionLoading={isActionLoading}
              loading={invitationsLoading}
              error={invitationsError}
              onRetry={() => void refresh()}
              onAcceptInvitation={handleAcceptInvitation}
              onDeclineInvitation={handleDeclineInvitation}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardPage;
