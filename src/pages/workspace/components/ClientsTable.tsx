import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkspaceMember } from "@/types/workspace";

interface Props {
  clients: WorkspaceMember[];
  canManage: boolean;
  onViewProfile: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

export function ClientsTable({
  clients,
  canManage,
  onViewProfile,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasActiveFilters = search.trim() !== "" || sortBy !== "default";
  const handleResetFilters = () => {
    setSearch("");
    setSortBy("default");
    setPage(1);
  };

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (q) {
        const name = (c.fullName || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [clients, search]);

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return (a.fullName || a.email || "").localeCompare(
            b.fullName || b.email || "",
            "vi",
          );
        case "name_desc":
          return (b.fullName || b.email || "").localeCompare(
            a.fullName || a.email || "",
            "vi",
          );
        case "joined_desc": {
          const tA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
          const tB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
          return tB - tA;
        }
        case "joined_asc": {
          const tA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
          const tB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
          return tA - tB;
        }
        default:
          return 0;
      }
    });
  }, [filteredClients, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedClients = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedClients.slice(start, start + pageSize);
  }, [sortedClients, safePage, pageSize]);

  return (
    <div className="space-y-3">
      {clients.length > 0 && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t(
              "workspace.members.searchClientPlaceholder",
              "Tìm theo tên hoặc email khách hàng…",
            )}
            iconPrefix={<Search className="size-3.5" />}
            wrapperClassName="w-full sm:max-w-xs"
            className="h-8.5 text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SelectMenu
              ariaLabel={t("workspace.members.sortBy", "Sắp xếp theo")}
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
              className="h-8.5 min-w-32 text-xs"
              options={[
                { value: "default", label: t("common.sort.default", "Mặc định") },
                {
                  value: "name_asc",
                  label: t("common.sort.nameAsc", "Tên: A → Z"),
                },
                {
                  value: "name_desc",
                  label: t("common.sort.nameDesc", "Tên: Z → A"),
                },
                {
                  value: "joined_desc",
                  label: t("workspace.members.sortNewest", "Mới tham gia"),
                },
                {
                  value: "joined_asc",
                  label: t("workspace.members.sortOldest", "Tham gia lâu nhất"),
                },
              ]}
            />
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground h-8.5 px-2 text-xs"
              >
                <RotateCcw className="mr-1 size-3.5" />
                {t("common.reset", "Đặt lại")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("workspace.members.clientLabel")}</TableHead>
              <TableHead>{t("workspace.members.joinedAtLabel")}</TableHead>
              <TableHead>{t("workspace.members.statusLabel")}</TableHead>
              <TableHead className="text-right">
                {t("workspace.members.actionsLabel")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  {hasActiveFilters
                    ? t(
                        "workspace.members.noFilterResults",
                        "Không tìm thấy khách hàng phù hợp.",
                      )
                    : t(
                        "workspace.members.noClients",
                        "Chưa có khách hàng nào trong workspace.",
                      )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((member) => (
                <TableRow
                  key={member.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onViewProfile(member)}
                >
                  <TableCell>
                    <div className="text-foreground hover:text-brand-orange font-medium transition-colors">
                      {member.fullName || member.email || "—"}
                    </div>
                    {member.fullName && member.email && (
                      <div className="text-muted-foreground text-xs">
                        {member.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {member.isActive && (
                      <Badge variant="secondary">
                        {t("workspace.members.active")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="inline-flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewProfile(member)}
                        title={t(
                          "workspace.members.viewProfileTooltip",
                          "Xem hồ sơ khách hàng",
                        )}
                        aria-label={t(
                          "workspace.members.viewProfileTooltip",
                          "Xem hồ sơ khách hàng",
                        )}
                        className="text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10 cursor-pointer transition-colors"
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(member)}
                          title={t(
                            "workspace.members.removeClientTooltip",
                            "Xóa khách hàng khỏi workspace",
                          )}
                          aria-label={t(
                            "workspace.members.removeClientTooltip",
                            "Xóa khách hàng khỏi workspace",
                          )}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedClients.length > 0 && (
        <Pagination
          page={safePage}
          size={pageSize}
          total={sortedClients.length}
          totalPages={totalPages}
          pageSizeOptions={[5, 10, 20, 50]}
          itemLabel={t("workspace.members.clientItemLabel", "khách hàng")}
          onPageChange={setPage}
          onSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          className="pt-1"
        />
      )}
    </div>
  );
}
