import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  Pencil,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  XCircle,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { AdminAccountsPagination } from "@/pages/admin/components/AdminAccountsPagination";
import { presetRange } from "@/services/adminRevenueService";

const STORAGE_KEY = "brandhub_admin_accounts_visible_columns";

interface VisibleColumns {
  phone: boolean;
  role: boolean;
  status: boolean;
  emailVerified: boolean;
  strikes: boolean;
  cleanPeriod: boolean;
  createdAt: boolean;
}

const DEFAULT_COLUMNS: VisibleColumns = {
  phone: true,
  role: true,
  status: true,
  emailVerified: true,
  strikes: true,
  cleanPeriod: true,
  createdAt: true,
};

function loadStoredColumns(): VisibleColumns {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COLUMNS, ...parsed };
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "—";
  }
}

function UserAvatar({ url, name }: { url?: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  const initials = name?.trim() ? name.trim().slice(0, 2).toUpperCase() : "?";

  if (url && !errored) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setErrored(true)}
        className="border-border/50 size-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold">
      {initials}
    </span>
  );
}

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

  const allowedSizes = [10, 20, 50, 100];
  const parsedSize = Number(params.get("size"));
  const size = allowedSizes.includes(parsedSize) ? parsedSize : 20;

  const filter = {
    page: Math.max(1, Number(params.get("page")) || 1),
    size,
    search: params.get("search") || "",
    status: statuses.includes(params.get("status") || "")
      ? params.get("status")!
      : "",
    role: ["ADMIN", "USER"].includes(params.get("role") || "")
      ? params.get("role")!
      : "",
    strikeFilter: ["ANY", "YELLOW", "ORANGE", "RED", "CLEAN"].includes(
      params.get("strike") || "",
    )
      ? params.get("strike")!
      : "",
    sortBy: [
      "NEWEST",
      "RISK",
      "NAME_ASC",
      "CLEAN_PERIOD",
      "OLDEST",
    ].includes(params.get("sort") || "")
      ? params.get("sort")!
      : "NEWEST",
  };

  const [visibleColumns, setVisibleColumns] =
    useState<VisibleColumns>(loadStoredColumns);

  const toggleColumn = (col: keyof VisibleColumns, val: boolean) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [col]: val };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_COLUMNS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(filter.search);
  const [syncedSearch, setSyncedSearch] = useState(filter.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  if (syncedSearch !== filter.search) {
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

  const update = (
    values: Partial<typeof filter> & {
      strike?: string;
      sort?: string;
      size?: number;
    },
  ) => {
    const strikeFilter =
      values.strike !== undefined ? values.strike : values.strikeFilter;
    const sortBy = values.sort !== undefined ? values.sort : values.sortBy;
    const nextPage = values.page !== undefined ? values.page : 1;
    const next = {
      ...filter,
      ...values,
      page: nextPage,
      ...(strikeFilter !== undefined ? { strikeFilter } : {}),
      ...(sortBy !== undefined ? { sortBy } : {}),
    };

    setParams(
      (current) => {
        current.set("view", "users");
        for (const key of ["search", "status", "role", "page"] as const) {
          if (next[key] && !(key === "page" && next.page === 1))
            current.set(key, String(next[key]));
          else current.delete(key);
        }
        if (next.size && next.size !== 20) {
          current.set("size", String(next.size));
        } else {
          current.delete("size");
        }
        if (next.strikeFilter) current.set("strike", next.strikeFilter);
        else current.delete("strike");
        if (next.sortBy && next.sortBy !== "NEWEST")
          current.set("sort", next.sortBy);
        else current.delete("sort");
        return current;
      },
      { replace: true },
    );
  };

  const totalCount = result.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filter.size));

  const columnDefs: { key: keyof VisibleColumns; label: string }[] = [
    { key: "phone", label: t("admin.accounts.columnPhone") },
    { key: "role", label: t("admin.accounts.role") },
    { key: "status", label: t("admin.accounts.status") },
    { key: "emailVerified", label: t("admin.accounts.columnVerified") },
    { key: "strikes", label: t("admin.accounts.columnStrikes") },
    { key: "cleanPeriod", label: t("admin.accounts.columnCleanPeriod") },
    { key: "createdAt", label: t("admin.accounts.columnJoinedAt") },
  ];

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

        <SelectMenu
          className="h-10 min-w-44"
          ariaLabel={t("admin.accounts.strike")}
          value={filter.strikeFilter}
          onChange={(val) => update({ strikeFilter: val })}
          options={[
            { value: "", label: t("admin.accounts.allStrikes") },
            { value: "ANY", label: t("admin.accounts.hasStrike") },
            { value: "YELLOW", label: t("admin.accounts.yellowStrike") },
            { value: "ORANGE", label: t("admin.accounts.orangeStrike") },
            { value: "RED", label: t("admin.accounts.redStrike") },
            { value: "CLEAN", label: t("admin.accounts.noStrike") },
          ]}
        />

        <SelectMenu
          className="h-10 min-w-44"
          ariaLabel={t("admin.accounts.sortLabel")}
          value={filter.sortBy}
          onChange={(val) => update({ sortBy: val })}
          options={[
            { value: "NEWEST", label: t("admin.accounts.sortNewest") },
            { value: "RISK", label: t("admin.accounts.sortRisk") },
            { value: "NAME_ASC", label: t("admin.accounts.sortNameAsc") },
            {
              value: "CLEAN_PERIOD",
              label: t("admin.accounts.sortCleanPeriod"),
            },
            { value: "OLDEST", label: t("admin.accounts.sortOldest") },
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
          variant="orange"
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
              <TableHeader className="bg-muted/40 [&_th]:text-xs [&_th]:font-sans [&_th]:tracking-wide [&_th]:uppercase">
                <TableRow>
                  <TableHead className="min-w-56">
                    {t("admin.accounts.name")}
                  </TableHead>
                  {visibleColumns.phone && (
                    <TableHead>{t("admin.accounts.columnPhone")}</TableHead>
                  )}
                  {visibleColumns.role && (
                    <TableHead>{t("admin.accounts.role")}</TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead>{t("admin.accounts.status")}</TableHead>
                  )}
                  {visibleColumns.emailVerified && (
                    <TableHead>{t("admin.accounts.columnVerified")}</TableHead>
                  )}
                  {visibleColumns.strikes && (
                    <TableHead>{t("admin.accounts.columnStrikes")}</TableHead>
                  )}
                  {visibleColumns.cleanPeriod && (
                    <TableHead>
                      {t("admin.accounts.columnCleanPeriod")}
                    </TableHead>
                  )}
                  {visibleColumns.createdAt && (
                    <TableHead>{t("admin.accounts.columnJoinedAt")}</TableHead>
                  )}
                  <TableHead className="text-right min-w-36">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{t("admin.accounts.actions")}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted size-7 p-0 cursor-pointer"
                            title={t("admin.accounts.columnsCustomize")}
                            aria-label={t("admin.accounts.columnsCustomize")}
                          >
                            <SlidersHorizontal className="size-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64 space-y-3 p-3">
                          <div className="border-border flex items-center justify-between border-b pb-2">
                            <span className="text-xs font-semibold">
                              {t("admin.accounts.columns")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={resetColumns}
                              className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                            >
                              <RotateCcw className="mr-1 size-3" />
                              {t("admin.accounts.resetColumns")}
                            </Button>
                          </div>
                          <div className="space-y-1.5">
                            {columnDefs.map(({ key, label }) => (
                              <label
                                key={key}
                                className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium"
                              >
                                <span>{label}</span>
                                <Switch
                                  checked={visibleColumns[key]}
                                  onCheckedChange={(val) => toggleColumn(key, val)}
                                />
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-muted-foreground h-32 text-center"
                    >
                      {t("admin.accounts.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  result.data.items.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      {/* Cột Tài khoản */}
                      <TableCell>
                        <div className="flex min-w-56 items-center gap-3 py-1">
                          <UserAvatar
                            url={user.avatarUrl}
                            name={user.fullName}
                          />
                          <div className="min-w-0">
                            <p className="text-foreground truncate text-sm font-semibold">
                              {user.fullName || "—"}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột Số điện thoại */}
                      {visibleColumns.phone && (
                        <TableCell>
                          {user.phone ? (
                            <span className="font-mono text-xs">
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                      )}

                      {/* Cột Quyền hệ thống */}
                      {visibleColumns.role && (
                        <TableCell>
                          {user.role === "ADMIN" ? (
                            <Badge
                              variant="secondary"
                              className="border-brand-orange/30 bg-brand-orange-soft text-brand-orange gap-1 text-xs font-medium"
                            >
                              <ShieldCheck className="size-3" />
                              {t("admin.roles.ADMIN")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs font-medium"
                            >
                              {t("admin.roles.USER")}
                            </Badge>
                          )}
                        </TableCell>
                      )}

                      {/* Cột Trạng thái tài khoản */}
                      {visibleColumns.status && (
                        <TableCell>
                          <Badge
                            className="rounded-full text-xs"
                            variant={
                              user.status === "ACTIVE"
                                ? "PUBLISHED"
                                : user.status === "FLAGGED"
                                  ? "PENDING_REVIEW"
                                  : user.status === "PENDING_VERIFICATION"
                                    ? "SCHEDULED"
                                    : user.status === "DEACTIVATED" ||
                                        user.status === "SUSPENDED"
                                      ? "destructive"
                                      : "outline"
                            }
                          >
                            {t(`admin.status.${user.status}`)}
                          </Badge>
                        </TableCell>
                      )}

                      {/* Cột Xác thực Email */}
                      {visibleColumns.emailVerified && (
                        <TableCell>
                          {user.emailVerifiedAt ? (
                            <span className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                              <CheckCircle2 className="size-3" />
                              {t("admin.accounts.verified")}
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                              <XCircle className="size-3" />
                              {t("admin.accounts.unverified")}
                            </span>
                          )}
                        </TableCell>
                      )}

                      {/* Cột Thẻ vi phạm */}
                      {visibleColumns.strikes && (
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span
                              className="text-muted-foreground inline-flex items-center gap-1"
                              title={`${t("admin.level.YELLOW")}: ${user.yellow}/3`}
                            >
                              <span className="size-2 shrink-0 rounded-full bg-amber-400" />
                              <span>{user.yellow}/3</span>
                            </span>
                            <span
                              className="text-muted-foreground inline-flex items-center gap-1"
                              title={`${t("admin.level.ORANGE")}: ${user.orange}/3`}
                            >
                              <span className="bg-brand-orange size-2 shrink-0 rounded-full" />
                              <span>{user.orange}/3</span>
                            </span>
                            <span
                              className="text-muted-foreground inline-flex items-center gap-1"
                              title={`${t("admin.level.RED")}: ${user.red}`}
                            >
                              <span className="bg-destructive size-2 shrink-0 rounded-full" />
                              <span>{user.red}</span>
                            </span>
                          </div>
                        </TableCell>
                      )}

                      {/* Cột Hạn ân hạn */}
                      {visibleColumns.cleanPeriod && (
                        <TableCell>
                          {user.cleanPeriodEndsAt || user.reactivateAt ? (
                            <span className="font-mono text-xs whitespace-nowrap">
                              {formatDate(
                                user.cleanPeriodEndsAt || user.reactivateAt,
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                      )}

                      {/* Cột Ngày tham gia */}
                      {visibleColumns.createdAt && (
                        <TableCell>
                          <span className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                            {formatDateTime(user.createdAt)}
                          </span>
                        </TableCell>
                      )}

                      {/* Cột Thao tác */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="size-8 p-0"
                            aria-label={t("admin.users.editAction")}
                            title={t("admin.users.editAction")}
                            onClick={() => setEditing(user.id)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 px-2.5 text-xs"
                            onClick={() => setSelected(user.id)}
                          >
                            <ShieldAlert className="text-brand-orange size-3.5" />
                            <span>{t("admin.accounts.manage")}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <AdminAccountsPagination
            page={filter.page}
            size={filter.size}
            total={totalCount}
            totalPages={totalPages}
            isFetching={result.isFetching}
            onPageChange={(page) => update({ page })}
            onSizeChange={(size) => update({ size, page: 1 })}
          />
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
