import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Plus,
  Trash2,
  Check,
  Search,
  Users,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AGENCY_PERMISSIONS,
  AGENCY_ROLES_UPDATED_EVENT,
  INITIAL_AGENCY_ROLES,
  agencyRoleService,
} from "@/services/agencyRoleService";
import type {
  AgencyRoleDefinition,
  PermissionScopeGroup,
} from "@/types/agency";
import { useAgencyStore } from "@/store/agencyStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AgencyRolesPage() {
  const params = useParams<{ id: string }>();
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const agencyId = params.id || currentAgencyId || "default";
  const { t } = useTranslation();
  const [roles, setRoles] = useState<AgencyRoleDefinition[]>(() =>
    agencyRoleService.getRoles(agencyId),
  );
  const [activeTab, setActiveTab] = useState<"matrix" | "roles">("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  const GROUP_LABELS: Record<
    PermissionScopeGroup,
    { title: string; subtitle: string }
  > = {
    AGENCY: {
      title: t("agency.roles.groupAgencyTitle", "Quản trị Agency"),
      subtitle: t(
        "agency.roles.groupAgencySub",
        "Cấu hình chung, thành viên, vai trò, nhật ký hoạt động và thanh toán",
      ),
    },
    WORKSPACE: {
      title: t(
        "agency.roles.groupWorkspaceTitle",
        "Không gian làm việc & Khách hàng",
      ),
      subtitle: t(
        "agency.roles.groupWorkspaceSub",
        "Khởi tạo, gán quyền workspace và quản lý đối tác client",
      ),
    },
    CONTENT: {
      title: t("agency.roles.groupContentTitle", "Nội dung & Xuất bản"),
      subtitle: t(
        "agency.roles.groupContentSub",
        "Soạn thảo bài viết, tài nguyên media, quy trình duyệt và đăng tải",
      ),
    },
    ANALYTICS: {
      title: t("agency.roles.groupAnalyticsTitle", "Phân tích & Báo cáo"),
      subtitle: t(
        "agency.roles.groupAnalyticsSub",
        "Xem bảng phân tích số liệu mạng xã hội và trích xuất báo cáo",
      ),
    },
  };

  // State cho Modal tạo Custom Role
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [baseRoleKey, setBaseRoleKey] = useState<string>("CREATOR");

  // Load và lắng nghe sự kiện Realtime cập nhật
  useEffect(() => {
    setRoles(agencyRoleService.getRoles(agencyId));

    // Lắng nghe realtime event cùng window/tab
    const handleRoleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        agencyId: string;
        roles: AgencyRoleDefinition[];
      }>;
      if (customEvent.detail && customEvent.detail.agencyId === agencyId) {
        setRoles(customEvent.detail.roles);
      }
    };

    // Lắng nghe storage event nếu người dùng mở nhiều tab khác nhau
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `brandhub_agency_roles_${agencyId}`) {
        setRoles(agencyRoleService.getRoles(agencyId));
      }
    };

    window.addEventListener(AGENCY_ROLES_UPDATED_EVENT, handleRoleUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AGENCY_ROLES_UPDATED_EVENT, handleRoleUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [agencyId]);

  const handleToggle = (roleKey: string, permKey: string) => {
    if (roleKey === "OWNER") {
      toast.info(
        t(
          "agency.roles.ownerNotice",
          "Chủ sở hữu mặc định có toàn bộ đặc quyền trên hệ thống.",
        ),
      );
      return;
    }
    const updated = agencyRoleService.togglePermission(
      agencyId,
      roleKey,
      permKey,
    );
    setRoles([...updated]);
  };

  const handleResetToDefault = () => {
    if (!agencyId) return;
    if (
      confirm(
        t(
          "agency.roles.resetConfirm",
          "Bạn có chắc chắn muốn đặt lại tất cả vai trò và quyền hạn về mặc định không?",
        ),
      )
    ) {
      agencyRoleService.saveRoles(agencyId, INITIAL_AGENCY_ROLES);
      setRoles(INITIAL_AGENCY_ROLES);
      toast.success(
        t(
          "agency.roles.resetSuccess",
          "Đã khôi phục ma trận phân quyền về mặc định.",
        ),
      );
    }
  };

  const handleCreateRole = () => {
    if (!agencyId || !newRoleName.trim()) {
      toast.error(t("agency.roles.nameRequired", "Vui lòng nhập tên vai trò."));
      return;
    }
    const created = agencyRoleService.createCustomRole(agencyId, {
      name: newRoleName,
      description: newRoleDesc,
      baseRoleKey,
    });
    setRoles(agencyRoleService.getRoles(agencyId));
    setIsCreateOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
    toast.success(t("agency.roles.createSuccess", { name: created.name }));
  };

  const handleDeleteRole = (roleKey: string, roleName: string) => {
    if (!agencyId) return;
    if (confirm(t("agency.roles.deleteConfirm", { name: roleName }))) {
      const updated = agencyRoleService.deleteCustomRole(agencyId, roleKey);
      setRoles(updated);
      toast.success(t("agency.roles.deleteSuccess", { name: roleName }));
    }
  };

  // Lọc permissions theo search và group
  const filteredPermissions = useMemo(() => {
    return AGENCY_PERMISSIONS.filter((perm) => {
      const matchesSearch =
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "ALL" || perm.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, selectedGroup]);

  // Gom theo từng nhóm group
  const groupedPermissions = useMemo(() => {
    const groups: Record<PermissionScopeGroup, typeof AGENCY_PERMISSIONS> = {
      AGENCY: [],
      WORKSPACE: [],
      CONTENT: [],
      ANALYTICS: [],
    };
    filteredPermissions.forEach((p) => {
      groups[p.group].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  return (
    <PageWrapper
      title={t("agency.roles.pageTitle", "Vai trò & Phân quyền")}
      description={t(
        "agency.roles.pageDesc",
        "Quản lý ma trận phân quyền linh hoạt theo mô hình GitHub & Jira cho toàn bộ nhân sự Agency.",
      )}
      introSummary={t(
        "agency.roles.introSummary",
        "Hệ thống quản lý vai trò và phân quyền (RBAC) giúp chủ agency phân định rõ quyền hạn của từng nhân sự, hạn chế rủi ro và tăng cường bảo mật.",
      )}
      guideUrl="/help/guide#roles"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="h-9 border-zinc-200 text-xs text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("agency.roles.resetDefault", "Khôi phục mặc định")}
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 h-9 gap-1.5 text-xs font-medium text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("agency.roles.createButton", "Tạo vai trò mới")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs & Header Stats */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("matrix")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "matrix"
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              {t("agency.roles.matrixTab", "Ma trận phân quyền (Matrix)")}
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "roles"
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
              )}
            >
              <Users className="h-3.5 w-3.5" />
              {t("agency.roles.rolesTab", "Danh sách vai trò")} ({roles.length})
            </button>
          </div>

          {/* Quick Notice */}
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
            <ShieldCheck className="text-brand-primary h-3.5 w-3.5 shrink-0" />
            <span>
              {t(
                "agency.roles.ownerNotice",
                "Chủ sở hữu mặc định có toàn bộ đặc quyền trên hệ thống.",
              )}
            </span>
          </div>
        </div>

        {/* TAB 1: MA TRẬN PHÂN QUYỀN (PERMISSION MATRIX - JIRA / GITHUB STYLE) */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder={t(
                    "agency.roles.searchPlaceholder",
                    "Tìm kiếm quyền hạn, mô tả...",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus-visible:ring-brand-primary h-8.5 border-zinc-200 bg-transparent pl-9 text-xs focus-visible:ring-1 dark:border-zinc-800"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    "ALL",
                    "AGENCY",
                    "WORKSPACE",
                    "CONTENT",
                    "ANALYTICS",
                  ] as const
                ).map((groupKey) => (
                  <button
                    key={groupKey}
                    onClick={() => setSelectedGroup(groupKey)}
                    className={cn(
                      "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                      selectedGroup === groupKey
                        ? "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-700/60",
                    )}
                  >
                    {groupKey === "ALL"
                      ? t("agency.roles.allGroups", "Tất cả nhóm")
                      : GROUP_LABELS[groupKey]?.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-300">
                      <th className="w-[340px] px-4 py-3">
                        {t(
                          "agency.roles.permissionsHeader",
                          "Quyền hạn & Hành động",
                        )}
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role.key}
                          className="min-w-[120px] px-3 py-3 text-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                "inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-semibold",
                                role.badgeColor,
                              )}
                            >
                              {role.name.split("(")[0].trim()}
                            </span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              {role.isSystem
                                ? t("agency.roles.systemBadge", "Hệ thống")
                                : t("agency.roles.customBadge", "Tùy biến")}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800/50">
                    {(
                      Object.keys(groupedPermissions) as PermissionScopeGroup[]
                    ).map((groupKey) => {
                      const groupItems = groupedPermissions[groupKey];
                      if (groupItems.length === 0) return null;

                      return (
                        <React.Fragment key={`group_${groupKey}`}>
                          <tr className="bg-zinc-50/50 dark:bg-zinc-800/20">
                            <td
                              colSpan={roles.length + 1}
                              className="px-4 py-2 text-[11px] font-bold tracking-wider text-zinc-600 uppercase dark:text-zinc-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-brand-primary inline-block h-3 w-1.5 rounded-full" />
                                <span>{GROUP_LABELS[groupKey]?.title}</span>
                                <span className="text-[10px] font-normal text-zinc-400 lowercase">
                                  — {GROUP_LABELS[groupKey]?.subtitle}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {groupItems.map((perm) => (
                            <tr
                              key={perm.key}
                              className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20"
                            >
                              <td className="px-4 py-2.5 align-top">
                                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                  {perm.name}
                                </div>
                                <div className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {perm.description}
                                </div>
                                <div className="mt-0.5 font-mono text-[10px] text-zinc-400/80">
                                  {perm.key}
                                </div>
                              </td>

                              {roles.map((role) => {
                                const isChecked =
                                  role.key === "OWNER" ||
                                  role.permissions.includes(perm.key);
                                const isOwner = role.key === "OWNER";

                                return (
                                  <td
                                    key={`${role.key}_${perm.key}`}
                                    className="px-3 py-2.5 text-center align-middle"
                                  >
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleToggle(role.key, perm.key);
                                      }}
                                      className={cn(
                                        "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition-all duration-150 select-none",
                                        isChecked
                                          ? "bg-brand-primary border-brand-primary text-white shadow-xs hover:brightness-105 active:scale-95"
                                          : "border-zinc-200 bg-zinc-50/60 text-transparent hover:border-zinc-400 hover:bg-zinc-100/70 dark:border-zinc-700/80 dark:bg-zinc-800/40",
                                        isOwner &&
                                          "cursor-not-allowed border-zinc-600 bg-zinc-600 text-white opacity-75 hover:brightness-100 active:scale-100",
                                      )}
                                      title={
                                        isOwner
                                          ? t(
                                              "agency.roles.ownerNotice",
                                              "Chủ sở hữu mặc định có toàn bộ đặc quyền trên hệ thống.",
                                            )
                                          : isChecked
                                            ? t(
                                                "agency.roles.toggleRevoke",
                                                "Nhấn để hủy quyền",
                                              )
                                            : t(
                                                "agency.roles.toggleGrant",
                                                "Nhấn để cấp quyền",
                                              )
                                      }
                                    >
                                      {isChecked ? (
                                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                      ) : null}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DANH SÁCH VAI TRÒ & QUẢN LÝ (ROLE CARDS - GITHUB STYLE) */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.key}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold",
                        role.badgeColor,
                      )}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {role.name}
                    </span>
                    {role.isSystem ? (
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                        {t("agency.roles.systemBadge", "Hệ thống")}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.key, role.name)}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <p className="min-h-[38px] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {role.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800/80">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-zinc-400" />
                      {role.key === "OWNER"
                        ? t(
                            "agency.roles.ownerFullAccess",
                            "Toàn bộ quyền (100%)",
                          )
                        : t("agency.roles.permissionsCount", {
                            count: role.permissions.length,
                            total: AGENCY_PERMISSIONS.length,
                          })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      {t("agency.roles.membersCount", {
                        count: role.memberCount ?? 0,
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("matrix")}
                    className="h-8 w-full border-zinc-200 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    {t(
                      "agency.roles.viewMatrixBtn",
                      "Xem & sửa quyền trong ma trận",
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Thẻ tạo vai trò mới */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="hover:border-brand-primary/50 hover:bg-brand-primary/5 group flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 p-5 text-center transition-all dark:border-zinc-800"
            >
              <div className="group-hover:bg-brand-primary/10 group-hover:text-brand-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors dark:bg-zinc-800">
                <Plus className="h-5 w-5" />
              </div>
              <div className="group-hover:text-brand-primary text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t("agency.roles.createCardTitle", "Tạo vai trò tùy biến mới")}
              </div>
              <div className="max-w-[200px] text-xs text-zinc-400">
                {t(
                  "agency.roles.createCardDesc",
                  "Thiết lập vai trò riêng biệt theo mô hình phòng ban công ty bạn.",
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* DIALOG TẠO CUSTOM ROLE */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Sparkles className="text-brand-primary h-5 w-5" />
              {t("agency.roles.dialogTitle", "Tạo vai trò mới (Custom Role)")}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(
                "agency.roles.dialogDesc",
                "Định nghĩa một vai trò tùy chỉnh để phân bổ chính xác trách nhiệm công việc cho nhân sự Agency.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("agency.roles.roleNameLabel", "Tên vai trò")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t(
                  "agency.roles.roleNamePlaceholder",
                  "Ví dụ: Lead Designer, Copywriter, Media Planner...",
                )}
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="h-9 border-zinc-200 bg-transparent text-xs dark:border-zinc-800"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("agency.roles.roleDescLabel", "Mô tả ngắn gọn")}
              </label>
              <Textarea
                placeholder={t(
                  "agency.roles.roleDescPlaceholder",
                  "Mô tả phạm vi quyền hạn và trách nhiệm của vai trò này...",
                )}
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                rows={2}
                className="border-zinc-200 bg-transparent text-xs dark:border-zinc-800"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("agency.roles.inheritLabel", "Kế thừa quyền hạn ban đầu từ")}
              </label>
              <select
                value={baseRoleKey}
                onChange={(e) => setBaseRoleKey(e.target.value)}
                className="focus:ring-brand-primary w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:ring-1 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="CREATOR">
                  {t("agency.roles.optCreator", "Nhân viên sáng tạo (Creator)")}
                </option>
                <option value="PROJECT_MANAGER">
                  {t("agency.roles.optPM", "Quản lý dự án (Project Manager)")}
                </option>
                <option value="ADMIN">
                  {t(
                    "agency.roles.optAdmin",
                    "Quản lý công ty (Agency Manager)",
                  )}
                </option>
                <option value="VIEWER">
                  {t("agency.roles.optViewer", "Chỉ xem (Viewer)")}
                </option>
              </select>
              <p className="mt-1 text-[11px] text-zinc-400">
                {t(
                  "agency.roles.inheritHint",
                  "Sau khi tạo, bạn có thể thoải mái bật/tắt từng quyền riêng lẻ trong bảng ma trận.",
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              className="border-zinc-200 text-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              {t("agency.roles.cancel", "Hủy")}
            </Button>
            <Button
              size="sm"
              onClick={handleCreateRole}
              className="bg-brand-primary hover:bg-brand-primary/90 text-xs font-medium text-white shadow-xs"
            >
              {t("agency.roles.confirmCreate", "Khởi tạo vai trò")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
