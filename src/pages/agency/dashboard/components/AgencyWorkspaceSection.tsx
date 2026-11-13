import { canAccess } from "@/routes/access";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardIdentity } from "@/pages/dashboard/components/DashboardIdentity";
import { SelectMenu } from "@/components/ui/select-menu";
import { getWorkspaceClientName } from "@/utils/workspaceHelper";
import type { Workspace } from "@/types/workspace";
import type { ClientProfile } from "@/types/clientProfile";
export function AgencyWorkspaceSection({
  workspaces,
  clients = [],
}: {
  workspaces: Workspace[];
  clients?: ClientProfile[];
}) {
  const { t } = useTranslation();
  const systemRole = useAuthStore((s) => s.user?.role || null);
  const roleLabel = (role: string | null) =>
    role
      ? t(`dashboard.experience.roles.${role}`, { defaultValue: role })
      : t("dashboard.experience.member");
  const clientLabel = (ws: Workspace) => {
    const label = getWorkspaceClientName(ws, clients);
    return label === "Chưa liên kết"
      ? t("dashboard.experience.noClient")
      : label;
  };
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [page, setPage] = useState(0);
  const roles = [
    ...new Set(
      workspaces
        .map((w) => w.myRole)
        .filter((r): r is NonNullable<typeof r> => !!r),
    ),
  ];
  const filtered = workspaces.filter(
    (w) =>
      (role === "ALL" || role === w.myRole) &&
      `${w.name} ${getWorkspaceClientName(w, clients)}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages - 1);
  return (
    <section className="bg-card min-w-0 space-y-4 rounded-xl border p-4">
      <div>
        <h2 className="text-sm font-semibold">
          {t("dashboard.experience.workspaces")}{" "}
          <span className="text-muted-foreground ml-1">
            {workspaces.length}
          </span>
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("dashboard.experience.workspaceHint")}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label={t("dashboard.experience.search")}
          placeholder={t("dashboard.experience.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1"
        />
        <SelectMenu
          value={role}
          onChange={(v) => {
            setRole(v);
            setPage(0);
          }}
          ariaLabel={t("dashboard.experience.role")}
          options={[
            { value: "ALL", label: t("dashboard.experience.all") },
            ...roles.map((r) => ({ value: r, label: roleLabel(r) })),
          ]}
          className="sm:w-48"
        />
      </div>
      {filtered.length ? (
        <div className="divide-y">
          {filtered.slice(current * 8, current * 8 + 8).map((ws) => (
            <div
              key={ws.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <Link
                to={`/workspaces/${ws.id}/dashboard`}
                className="focus-visible:outline-brand-orange flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-2"
              >
                <DashboardIdentity name={ws.name} src={ws.logoUrl} />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium" title={ws.name}>
                    {ws.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {roleLabel(ws.myRole)} · {clientLabel(ws)}
                  </p>
                </div>
              </Link>
              <div className="flex gap-1">
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/workspaces/${ws.id}/tasks`}>
                    {t("dashboard.experience.tasks")}
                  </Link>
                </Button>
                {canAccess(
                  `/workspaces/${ws.id}/campaigns`,
                  systemRole,
                  ws.myRole,
                ) && (
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/workspaces/${ws.id}/campaigns`}>
                      {t("dashboard.experience.campaign")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-6 text-sm">
          {t(
            `dashboard.experience.${workspaces.length ? "noMatch" : "noWorkspace"}`,
          )}
        </p>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-muted-foreground text-xs">
            {t("dashboard.experience.page", {
              page: current + 1,
              total: pages,
            })}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            {t("dashboard.experience.previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            {t("dashboard.experience.next")}
          </Button>
        </div>
      )}
    </section>
  );
}
