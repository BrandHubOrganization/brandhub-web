import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import type { AgencyInvitation } from "@/types/agency";
export function UserAccountStatusSection({
  user,
  pendingInvitations,
  isActionLoading,
  onAcceptInvitation,
  onDeclineInvitation,
  loading,
  error,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  onRetry: () => void;
  user: User | null;
  pendingInvitations: AgencyInvitation[];
  isActionLoading?: boolean;
  onAcceptInvitation: (token: string) => Promise<void>;
  onDeclineInvitation: (token: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <aside className="space-y-4">
      <section
        className={`bg-card rounded-xl border p-4 ${pendingInvitations.length ? "border-brand-orange/40" : ""}`}
      >
        <h2 className="flex items-center justify-between text-sm font-semibold">
          {t("dashboard.experience.invitations")}
          <span className="bg-muted rounded px-2 py-1 text-xs tabular-nums">
            {pendingInvitations.length}
          </span>
        </h2>
        {loading ? (
          <Skeleton className="mt-3 h-12" />
        ) : error ? (
          <div role="alert" className="text-muted-foreground mt-2 text-xs">
            {t("dashboard.experience.loadError")}
            <Button size="sm" variant="ghost" onClick={onRetry}>
              {t("dashboard.experience.retry")}
            </Button>
          </div>
        ) : pendingInvitations.length ? (
          <div className="mt-3 divide-y">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="space-y-2 py-3">
                <p className="text-sm font-medium">{inv.agencyName}</p>
                <p className="text-muted-foreground text-xs">
                  {inv.workspaceName}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={isActionLoading}
                    onClick={() => void onAcceptInvitation(inv.token)}
                  >
                    {t("dashboard.experience.accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isActionLoading}
                    onClick={() => void onDeclineInvitation(inv.token)}
                  >
                    {t("dashboard.experience.decline")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-2 text-xs">
            {t("dashboard.experience.noInvitations")}
          </p>
        )}
      </section>
      <section className="bg-card space-y-3 rounded-xl border p-4">
        <h2 className="text-sm font-semibold">
          {t("dashboard.experience.account")}
        </h2>
        <p className="text-sm break-all">{user?.email}</p>
        <p className="text-muted-foreground text-xs">
          {t("dashboard.experience.profileHint")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link to="/settings/profile">
              {t("dashboard.experience.profile")}
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/settings/security">
              {t("dashboard.experience.security")}
            </Link>
          </Button>
        </div>
      </section>
    </aside>
  );
}
