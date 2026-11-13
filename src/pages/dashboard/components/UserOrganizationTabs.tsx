import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardIdentity } from "@/pages/dashboard/components/DashboardIdentity";
import { DashboardSkeleton } from "@/pages/dashboard/components/DashboardSkeleton";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";
import type { ClientProfile } from "@/types/clientProfile";
type TabKey = "owned" | "participating" | "brands";
export function UserOrganizationTabs({
  ownedAgencies,
  participatingAgencies,
  brandProfiles,
  workspaces,
  isLoading,
  agenciesError,
  profilesError,
  workspacesError,
  onRetry,
}: {
  ownedAgencies: Agency[];
  participatingAgencies: Agency[];
  brandProfiles: ClientProfile[];
  workspaces: Workspace[];
  isLoading?: boolean;
  agenciesError?: boolean;
  profilesError?: boolean;
  workspacesError?: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<TabKey | null>(null);
  const active =
    selection ??
    (ownedAgencies.length
      ? "owned"
      : participatingAgencies.length
        ? "participating"
        : brandProfiles.length
          ? "brands"
          : "owned");
  const tabs = [
    { id: "owned" as const, label: "owned", count: ownedAgencies.length },
    {
      id: "participating" as const,
      label: "joined",
      count: participatingAgencies.length,
    },
    { id: "brands" as const, label: "brands", count: brandProfiles.length },
  ];
  if (isLoading) return <DashboardSkeleton />;
  const agencies = active === "owned" ? ownedAgencies : participatingAgencies;
  const activeError = active === "brands" ? profilesError : agenciesError;
  return (
    <section className="min-w-0 space-y-4">
      <div
        className="bg-muted/40 flex flex-wrap gap-1 rounded-xl border p-1"
        role="group"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            aria-pressed={active === tab.id}
            onClick={() => setSelection(tab.id)}
            className={
              active === tab.id
                ? "bg-card text-brand-orange shadow-xs"
                : "text-muted-foreground"
            }
          >
            {t(`dashboard.experience.${tab.label}`)}
            <span className="bg-muted ml-2 rounded px-1.5 text-xs tabular-nums">
              {(tab.id === "brands" ? profilesError : agenciesError)
                ? "—"
                : tab.count}
            </span>
          </Button>
        ))}
      </div>
      {activeError ? (
        <div role="alert" className="bg-card rounded-xl border p-4 text-sm">
          {t("dashboard.experience.loadError")}
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("dashboard.experience.retry")}
          </Button>
        </div>
      ) : active === "brands" ? (
        brandProfiles.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {brandProfiles.map((profile) => (
              <Link
                key={profile.id}
                to="/client-profiles"
                className="group bg-card hover:border-brand-orange/50 focus-visible:outline-brand-orange flex min-w-0 items-center gap-3 rounded-xl border p-4 transition-colors focus-visible:outline-2"
              >
                <DashboardIdentity
                  name={profile.displayName}
                  src={profile.logoUrl}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">
                    {profile.displayName}
                  </h2>
                  <p className="text-muted-foreground truncate text-xs">
                    {profile.company || profile.tagline}
                  </p>
                </div>
                <ArrowUpRight className="text-muted-foreground size-4 shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <Empty label={t("dashboard.experience.noBrands")} />
        )
      ) : agencies.length ? (
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              to={`/agency/${agency.id}/dashboard`}
              className="group bg-card hover:border-brand-orange/50 focus-visible:outline-brand-orange flex min-w-0 flex-col gap-4 rounded-xl border p-4 transition-colors focus-visible:outline-2"
            >
              <div className="flex items-center gap-3">
                <DashboardIdentity name={agency.name} src={agency.logoUrl} />
                <div className="min-w-0 flex-1">
                  <h2
                    className="group-hover:text-brand-orange truncate text-sm font-semibold"
                    title={agency.name}
                  >
                    {agency.name}
                  </h2>
                  <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                    {agency.tagline ||
                      agency.description ||
                      t("dashboard.experience.orgHint")}
                  </p>
                </div>
                <ArrowUpRight className="text-muted-foreground size-4 shrink-0" />
              </div>
              <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs">
                <span>
                  {workspacesError
                    ? "—"
                    : workspaces.filter((w) => w.agencyId === agency.id)
                        .length}{" "}
                  {t("dashboard.experience.workspaces")}
                </span>
                <span className="bg-brand-orange/10 text-brand-orange rounded-md px-2 py-1">
                  {t(
                    `dashboard.experience.${active === "owned" ? "owner" : "member"}`,
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty label={t("dashboard.experience.noAgency")} />
      )}
      {active === "owned" && (
        <Button asChild variant="outline" size="sm">
          <Link to="/agency/create">
            <Plus className="mr-2 size-4" />
            {t("dashboard.experience.createAgency")}
          </Link>
        </Button>
      )}
    </section>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div className="bg-card text-muted-foreground flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-sm">
      <Building2 className="text-brand-orange size-6" />
      {label}
    </div>
  );
}
