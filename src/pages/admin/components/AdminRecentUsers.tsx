import { ArrowRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountPage } from "@/services/adminAccountService";

export function AdminRecentUsers({
  result,
  timezone,
}: {
  result: UseQueryResult<AccountPage, Error>;
  timezone: string;
}) {
  const { t, i18n } = useTranslation();
  return (
    <section className="bg-card border-border min-w-0 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 lg:p-6">
        <div>
          <h2 className="text-sm font-semibold">
            {t("admin.overview.recentUsers")}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t("admin.overview.recentUsersHint")}
          </p>
        </div>
        <Link
          to="/admin?view=users"
          className="hover:text-brand-orange focus-visible:outline-ring flex items-center gap-1 rounded text-xs font-medium focus-visible:outline-2"
        >
          {t("admin.overview.viewAll")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {result.isPending && (
        <div
          role="status"
          aria-label={t("admin.loading")}
          className="space-y-3 px-6 pb-6"
        >
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      )}
      {result.isError && (
        <div role="alert" className="space-y-3 px-6 pb-6 text-sm">
          <p>{t("admin.accounts.error")}</p>
          <Button variant="outline" size="sm" onClick={() => result.refetch()}>
            {t("admin.overview.retry")}
          </Button>
        </div>
      )}
      {result.data &&
        !result.isError &&
        (result.data.items.length ? (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                {["name", "role", "status", "registered"].map((key) => (
                  <TableHead
                    key={key}
                    className="text-2xs px-5 font-mono tracking-wide uppercase"
                  >
                    {t(`admin.accounts.${key}`)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4">
                    <div className="flex min-w-48 items-center gap-3">
                      <span
                        className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-medium"
                        aria-hidden="true"
                      >
                        {user.fullName?.trim().slice(0, 2).toUpperCase() || "?"}
                      </span>
                      <div>
                        <p className="text-xs font-medium">{user.fullName}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 text-xs">
                    {t(`admin.roles.${user.role}`)}
                  </TableCell>
                  <TableCell className="px-5">
                    <Badge
                      variant={
                        user.status === "ACTIVE"
                          ? "PUBLISHED"
                          : user.status === "FLAGGED"
                            ? "PENDING_REVIEW"
                            : "outline"
                      }
                      className="text-2xs rounded-full"
                    >
                      {t(`admin.status.${user.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-2xs px-5 font-mono">
                    {new Intl.DateTimeFormat(i18n.language, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      timeZone: timezone,
                    }).format(new Date(user.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
            <span className="bg-muted rounded-full p-4">
              <Users className="size-6" />
            </span>
            {t("admin.overview.noUsers")}
          </div>
        ))}
    </section>
  );
}
