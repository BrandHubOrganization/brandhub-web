import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "../types/client";
import { Zap, Eye, Trash2 } from "lucide-react";

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  isOwner: boolean;
  onSelectPackage: (client: Client) => void;
  onSelectDelete: (client: Client) => void;
}

export function ClientTable({
  clients,
  isLoading,
  isOwner,
  onSelectPackage,
  onSelectDelete,
}: ClientTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-border bg-muted/40 text-muted-foreground border-b text-2xs font-bold tracking-wider uppercase">
            <th className="px-4 py-3">Thương hiệu / Client</th>
            <th className="px-4 py-3">Account Manager</th>
            <th className="px-4 py-3 text-center">Active Posts</th>
            <th className="px-4 py-3">Gói Dịch Vụ</th>
            <th className="px-4 py-3 text-center">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-border/60 divide-y text-xs">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-4 w-12" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-5 w-16" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Skeleton className="ml-auto h-7 w-20" />
                </td>
              </tr>
            ))
          ) : clients.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-muted-foreground py-8 text-center"
              >
                Không tìm thấy Client nào phù hợp.
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-muted/30 group transition-colors"
              >
                {/* Logo & Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {client.logoUrl ? (
                      <img
                        src={client.logoUrl}
                        alt={client.name}
                        className="border-border size-8 shrink-0 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {client.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-foreground group-hover:text-brand-orange block truncate font-bold transition-colors">
                        {client.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-2xs">
                        {client.contactEmail}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Account Manager */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {client.assignedAccountManagerAvatar ? (
                      <img
                        src={client.assignedAccountManagerAvatar}
                        alt=""
                        className="size-5 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex size-5 items-center justify-center rounded-full text-3xs font-bold">
                        A
                      </div>
                    )}
                    <span className="text-foreground font-medium">
                      {client.assignedAccountManagerName || "Chưa phân công"}
                    </span>
                  </div>
                </td>

                {/* Active Posts Count */}
                <td className="px-4 py-3 text-center">
                  <span className="text-foreground font-semibold">
                    {client.activePostsCount}
                  </span>
                  <span className="text-muted-foreground text-3xs">
                    /{client.servicePackage?.monthlyPostQuota || 30}
                  </span>
                </td>

                {/* Service Package Badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-3xs font-bold ${
                      client.servicePackage?.packageTier === "ENTERPRISE"
                        ? "border-purple-500/20 bg-purple-500/10 text-purple-600"
                        : client.servicePackage?.packageTier === "GROWTH"
                          ? "border-brand-orange/20 bg-brand-orange/10 text-brand-orange"
                          : "border-brand-orange/20 bg-brand-orange/10 text-brand-orange"
                    }`}
                  >
                    <Zap className="size-3" />{" "}
                    {client.servicePackage?.packageTier || "STARTER"}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-3xs font-medium ${
                      client.status === "ACTIVE"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "border border-gray-500/20 bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {client.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-7 cursor-pointer"
                      title="Xem chi tiết Client"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    {isOwner && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-brand-orange size-7 cursor-pointer"
                          title="Đổi gói dịch vụ"
                          onClick={() => onSelectPackage(client)}
                        >
                          <Zap className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-7 cursor-pointer hover:text-rose-500"
                          title="Xóa Client"
                          onClick={() => onSelectDelete(client)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
