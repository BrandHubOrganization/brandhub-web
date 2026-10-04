import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Pencil, Search, ShieldCheck, UserPlus } from "lucide-react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { adminAccountService } from "@/services/adminAccountService";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminStrikeDialog } from "@/pages/admin/components/AdminStrikeDialog";
import { AdminReportDialog } from "@/pages/admin/components/AdminReportExport";
import {
  CreateUserDialog,
  EditUserDialog,
} from "@/pages/admin/components/AdminUserDialogs";
import { presetRange } from "@/services/adminRevenueService";

export function AdminAccountsPanel() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <Accounts />
    </QueryClientProvider>
  );
}

function Accounts() {
  const { t } = useTranslation();
  const actorId = useAuthStore((s) => s.user?.id);
  const [params, setParams] = useSearchParams();
  const statuses = [
    "ACTIVE",
    "FLAGGED",
    "PENDING_VERIFICATION",
    "DEACTIVATED",
    "SUSPENDED",
    "DELETED",
  ];
  const filter = {
    page: Math.max(1, Number(params.get("page")) || 1),
    size: 20,
    search: params.get("search") || "",
    status: statuses.includes(params.get("status") || "")
      ? params.get("status")!
      : "",
    role: ["ADMIN", "USER"].includes(params.get("role") || "")
      ? params.get("role")!
      : "",
  };
  const [selected, setSelected] = useState<string | null>(null);
  // Live search: the list follows typing after a short pause; Enter applies it at once.
  const [searchText, setSearchText] = useState(filter.search);
  const [syncedSearch, setSyncedSearch] = useState(filter.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  if (syncedSearch !== filter.search) {
    // The URL changed elsewhere (drill-down, nav reset): show what is actually applied.
    setSyncedSearch(filter.search);
    if (searchText.trim() !== filter.search) setSearchText(filter.search);
  }
  const [exporting, setExporting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const result = useQuery({
    queryKey: ["admin-accounts", actorId, filter],
    queryFn: () => adminAccountService.list(filter),
  });
  const update = (values: Partial<typeof filter>) => {
    const next = { ...filter, page: 1, ...values };
    setParams(
      (current) => {
        current.set("view", "users");
        for (const key of ["search", "status", "role", "page"] as const) {
          if (next[key] && !(key === "page" && next.page === 1))
            current.set(key, String(next[key]));
          else current.delete(key);
        }
        return current;
      },
      { replace: true },
    );
  };

  return (
    <section className="space-y-4" aria-label={t("admin.accounts.title")}>
      <div className="bg-card border-border flex items-start gap-3 rounded-xl border p-4">
        <ShieldCheck className="text-muted-foreground mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">
            {t("admin.accounts.rulesTitle")}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t("admin.accounts.rulesHint")}
          </p>
        </div>
      </div>
      <form
        className="bg-card border-border flex flex-wrap items-center gap-2 rounded-xl border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          clearTimeout(searchTimer.current);
          update({ search: searchText.trim() });
        }}
      >
        <div className="relative min-w-[200px] flex-1 [&>div]:w-full">
          <Search className="text-muted-foreground pointer-events-none absolute top-3 left-3 z-10 size-4" />
          <Input
            aria-label={t("admin.accounts.search")}
            placeholder={t("admin.accounts.search")}
            name="search"
            value={searchText}
            onChange={(event) => {
              const text = event.target.value;
              setSearchText(text);
              clearTimeout(searchTimer.current);
              // Touch only `search` so a filter chosen meanwhile is kept.
              searchTimer.current = setTimeout(
                () =>
                  setParams(
                    (current) => {
                      current.set("view", "users");
                      current.delete("page");
                      if (text.trim()) current.set("search", text.trim());
                      else current.delete("search");
                      return current;
                    },
                    { replace: true },
                  ),
                300,
              );
            }}
            maxLength={255}
            className="h-10 pl-9"
          />
        </div>
        <SelectMenu
          className="h-10 min-w-44"
          ariaLabel={t("admin.accounts.status")}
          value={filter.status}
          onChange={(status) => update({ status })}
          options={[
            { value: "", label: t("admin.accounts.allStatuses") },
            ...statuses.map((status) => ({
              value: status,
              label: t(`admin.status.${status}`),
            })),
          ]}
        />
        <SelectMenu
          className="h-10 min-w-36"
          ariaLabel={t("admin.accounts.role")}
          value={filter.role}
          onChange={(role) => update({ role })}
          options={[
            { value: "", label: t("admin.accounts.allRoles") },
            { value: "ADMIN", label: t("admin.roles.ADMIN") },
            { value: "USER", label: t("admin.roles.USER") },
          ]}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setExporting(true)}
        >
          <Download className="size-4" />
          {t("admin.revenue.export")}
        </Button>
        <Button
          type="button"
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          onClick={() => setCreating(true)}
        >
          <UserPlus className="size-4" />
          {t("admin.users.createButton")}
        </Button>
      </form>
      {exporting && (
        <AdminReportDialog
          defaults={{
            type: "USER",
            ...presetRange("month", "Asia/Ho_Chi_Minh"),
            timezone: "Asia/Ho_Chi_Minh",
          }}
          onClose={() => setExporting(false)}
        />
      )}
      {result.isPending && <p role="status">{t("admin.loading")}</p>}
      {result.isError && (
        <div role="alert" className="text-destructive space-y-2">
          <p>{t("admin.accounts.error")}</p>
          <Button variant="outline" onClick={() => result.refetch()}>
            {t("admin.accounts.retry")}
          </Button>
        </div>
      )}
      {result.data && !result.isError && (
        <>
          <div className="border-border bg-card overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/40 [&_th]:text-2xs [&_th]:font-mono [&_th]:tracking-wide [&_th]:uppercase">
                <TableRow>
                  <TableHead>{t("admin.accounts.name")}</TableHead>
                  <TableHead>{t("admin.accounts.role")}</TableHead>
                  <TableHead>{t("admin.accounts.status")}</TableHead>
                  <TableHead>{t("admin.level.YELLOW")}</TableHead>
                  <TableHead>{t("admin.level.ORANGE")}</TableHead>
                  <TableHead>{t("admin.level.RED")}</TableHead>
                  <TableHead>{t("admin.accounts.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex min-w-48 items-center gap-3 py-2">
                        <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-medium">
                          {user.fullName?.trim().slice(0, 2).toUpperCase() ||
                            "?"}
                        </span>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs">
                        {user.role === "ADMIN" && (
                          <ShieldCheck className="text-muted-foreground size-3.5" />
                        )}
                        {t(`admin.roles.${user.role}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-2xs rounded-full"
                        variant={
                          user.status === "ACTIVE"
                            ? "PUBLISHED"
                            : user.status === "FLAGGED"
                              ? "PENDING_REVIEW"
                              : "outline"
                        }
                      >
                        {t(`admin.status.${user.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                        <span className="bg-warning h-3 w-2 rounded-sm" />
                        {user.yellow}/3
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                        <span className="bg-brand-orange h-3 w-2 rounded-sm" />
                        {user.orange}/3
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                        <span className="bg-destructive h-3 w-2 rounded-sm" />
                        {user.red}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={t("admin.users.editAction")}
                          title={t("admin.users.editAction")}
                          onClick={() => setEditing(user.id)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(user.id)}
                        >
                          {t("admin.accounts.manage")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!result.data.items.length && <p>{t("admin.accounts.empty")}</p>}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">
              {t("admin.accounts.total", { count: result.data.total })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={filter.page === 1 || result.isFetching}
                onClick={() => update({ page: filter.page - 1 })}
              >
                {t("admin.accounts.previous")}
              </Button>
              <Button
                variant="outline"
                disabled={
                  filter.page * filter.size >= result.data.total ||
                  result.isFetching
                }
                onClick={() => update({ page: filter.page + 1 })}
              >
                {t("admin.accounts.next")}
              </Button>
            </div>
          </div>
        </>
      )}
      {creating && <CreateUserDialog onClose={() => setCreating(false)} />}
      {editing && (
        <EditUserDialog
          key={editing}
          userId={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {selected && (
        <AdminStrikeDialog
          key={selected}
          userId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
