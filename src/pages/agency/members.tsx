import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import {
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  List,
  Mail,
  Network,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { useUserLookup } from "@/hooks/useUserLookup";
import { extractErrorMessage } from "@/utils/error";
import { formatRole } from "@/utils/workspaceHelper";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import { RemoveAgencyMemberDialog } from "./components/RemoveAgencyMemberDialog";
import { AgencyOrgChart } from "./components/AgencyOrgChart";
import {
  MemberProfileDrawer,
  type MemberProfileTarget,
} from "./components/MemberProfileDrawer";
import {
  InviteEmailFields,
  type InviteEmailLanguage,
} from "./components/InviteEmailFields";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgencyMember, AgencyMemberRole } from "@/types/agency";
import type { MemberRole, Workspace } from "@/types/workspace";
import type { TFunction } from "i18next";

// Agency invite chỉ gán trực tiếp qua workspace membership (user_id) — CLIENT
// role gắn với client_profile_id nên không hợp lệ ở đây (giống AssignMemberPicker).
// FR 3.4.7 BR-27: role CLIENT requires a Workspace at invite time (validated
// below); CLIENT joins as WorkspaceMember directly, not as an Agency Member.
const ASSIGNABLE_ROLES: MemberRole[] = ["MANAGER", "CREATOR", "CLIENT"];
const MIN_EXPIRY_DAYS = 1;
const MAX_EXPIRY_DAYS = 30;
const DEFAULT_EXPIRY_DAYS = 30;

// Hiển thị thời gian còn lại của lời mời (vd "Còn 5 ngày", "Còn 3 giờ").
function formatExpiresIn(expiresAt: string, t: TFunction): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return t("agency.members.expiresSoon");
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 1) return t("agency.members.expiresInDays", { count: days });
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return t("agency.members.expiresInHours", { count: hours });
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return t("agency.members.expiresInMinutes", { count: minutes });
}

interface MemberRow {
  id: string;
  userId: string | null;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: AgencyMemberRole | null;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
  joinedAt: string | null;
  expiresAt: string | null;
  isCurrentUser: boolean;
  removable: boolean;
  cancellable: boolean;
}

function SafeAvatar({
  src,
  name,
  className = "size-10",
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "bg-brand-orange-soft text-brand-orange flex shrink-0 items-center justify-center rounded-full font-bold shadow-xs",
          className,
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={cn("shrink-0 rounded-full object-cover shadow-xs", className)}
    />
  );
}

export function AgencyMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [invitationRows, setInvitationRows] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState("");
  const [profileTarget, setProfileTarget] =
    useState<MemberProfileTarget | null>(null);
  const [activeTab, setActiveTab] = useState<string>("members");
  const [memberViewMode, setMemberViewMode] = useState<"list" | "tree">("list");

  useEffect(() => {
    if (id) setCurrentAgencyId(id);
  }, [id, setCurrentAgencyId]);

  const [email, setEmail] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const rawUserMatch = useUserLookup(email);
  // Không gợi ý chính mình hoặc người đã là thành viên công ty rồi.
  const userMatch =
    rawUserMatch &&
    rawUserMatch.id !== currentUser?.id &&
    !members.some((m) => m.userId === rawUserMatch.id)
      ? rawUserMatch
      : null;

  useEffect(() => {
    if (
      userMatch &&
      (!inviteeName.trim() || inviteeName === userMatch.fullName)
    ) {
      setInviteeName(userMatch.fullName);
    }
  }, [userMatch]);

  const [emailLanguage, setEmailLanguage] = useState<InviteEmailLanguage>("vi");
  const [notes, setNotes] = useState({ vi: "", en: "" });
  const note = notes[emailLanguage];
  const [expiryDays, setExpiryDays] = useState(DEFAULT_EXPIRY_DAYS);
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole | "">("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!id) return;
    workspaceService
      .list()
      .then(({ data }) =>
        setWorkspaces(data.data.filter((w) => w.agencyId === id)),
      )
      .catch(() => setWorkspaces([]));
  }, [id]);

  const load = useCallback(() => {
    if (!id) return;
    // listMembers và listInvitations tách riêng: listInvitations là owner-only
    // (throw 403 NOT_AGENCY_OWNER cho non-owner), không được để lỗi đó kéo sập
    // luôn phần hiển thị members mà mọi member đều có quyền xem.
    agencyService
      .listMembers(id)
      .then(({ data }) => {
        const memberRowsData: MemberRow[] = data.data.map((m) => ({
          id: m.id,
          userId: m.userId,
          displayName: m.fullName || m.email || "—",
          email: m.email || "—",
          avatarUrl: m.avatarUrl,
          role: m.role,
          status: "ACTIVE",
          joinedAt: m.joinedAt,
          expiresAt: null,
          isCurrentUser: m.userId === currentUser?.id,
          removable: m.role !== "OWNER",
          cancellable: false,
        }));
        setMembers(data.data);
        setMemberRows(memberRowsData);
      })
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("agency.errors.membersLoadFailed")),
        ),
      )
      .finally(() => setLoading(false));

    agencyService
      .listInvitations(id)
      .then(({ data }) => {
        const invitationRowsData: MemberRow[] = data.data
          .filter((inv) => inv.status === "PENDING" || inv.status === "EXPIRED")
          .map((inv) => ({
            id: inv.id,
            userId: null,
            displayName: inv.invitedEmail,
            email: inv.invitedEmail,
            avatarUrl: null,
            role: null,
            status: inv.status as "PENDING" | "EXPIRED",
            joinedAt: null,
            expiresAt: inv.expiresAt,
            isCurrentUser: false,
            removable: false,
            cancellable: inv.status === "PENDING",
          }));
        setPendingCount(
          invitationRowsData.filter((r) => r.status === "PENDING").length,
        );
        setInvitationRows(invitationRowsData);
      })
      .catch(() => {
        // Non-owner: 403 NOT_AGENCY_OWNER là kỳ vọng — chỉ owner mới xem được
        // danh sách lời mời, im lặng bỏ qua cho member thường.
        setPendingCount(0);
        setInvitationRows([]);
      });
  }, [id, t, currentUser?.id]);

  useEffect(load, [load]);

  const isOwner = members.some(
    (m) => m.userId === currentUser?.id && m.role === "OWNER",
  );

  const filterByQuery = useCallback(
    (list: MemberRow[]) => {
      const q = search.trim().toLowerCase();
      if (!q) return list;
      return list.filter(
        (r) =>
          r.displayName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      );
    },
    [search],
  );
  const filteredMemberRows = useMemo(
    () => filterByQuery(memberRows),
    [filterByQuery, memberRows],
  );
  const filteredInvitationRows = useMemo(
    () => filterByQuery(invitationRows),
    [filterByQuery, invitationRows],
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const finalWorkspaceId = inviteWorkspaceId.trim()
      ? inviteWorkspaceId
      : undefined;
    const finalRole = finalWorkspaceId ? inviteRole || undefined : undefined;

    setInviting(true);
    try {
      const { data } = await agencyService.inviteMember(id, {
        email: email.trim(),
        inviteeName: inviteeName.trim() || undefined,
        note: note.trim() || undefined,
        workspaceId: finalWorkspaceId,
        role: finalRole,
        expiryDays,
        emailLanguage,
      });
      setInviteLink(
        `${window.location.origin}/invitations/accept?token=${data.data.token}`,
      );
      toast.success(t("agency.members.inviteSuccess", { email: email.trim() }));
      setEmail("");
      setInviteeName("");
      setNotes({ vi: "", en: "" });
      setEmailLanguage("vi");
      setExpiryDays(DEFAULT_EXPIRY_DAYS);
      setInviteWorkspaceId("");
      setInviteRole("");
      load();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.inviteFailed")));
    } finally {
      setInviting(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success(t("agency.members.linkCopied"));
    } catch {
      toast.error(t("agency.members.linkCopyFailed"));
    }
  };

  const handleRemove = async () => {
    if (!id || !removeTargetId) return;
    setRemoving(true);
    try {
      await agencyService.removeMember(id, removeTargetId);
      setMemberRows((prev) => prev.filter((r) => r.id !== removeTargetId));
      setMembers((prev) => prev.filter((m) => m.id !== removeTargetId));
      toast.success(t("agency.members.removeSuccess"));
      setRemoveTargetId(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.removeFailed")));
    } finally {
      setRemoving(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!id) return;
    try {
      await agencyService.cancelInvitation(id, invitationId);
      setInvitationRows((prev) => prev.filter((r) => r.id !== invitationId));
      setPendingCount((prev) => Math.max(0, prev - 1));
      toast.success(t("agency.members.cancelInviteSuccess"));
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("agency.errors.cancelInviteFailed")),
      );
    }
  };

  const nameCell = (row: MemberRow, clickable: boolean) => {
    const content = (
      <div className="flex items-center gap-2.5">
        {row.avatarUrl ? (
          <img
            src={row.avatarUrl}
            alt=""
            className="size-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {row.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {row.displayName}
            {row.isCurrentUser && ` ${t("agency.members.you")}`}
          </p>
          <p className="text-muted-foreground truncate text-xs">{row.email}</p>
        </div>
      </div>
    );
    if (!clickable || !row.userId) return content;
    return (
      <button
        type="button"
        className="w-full cursor-pointer text-left"
        onClick={() =>
          setProfileTarget({
            userId: row.userId!,
            displayName: row.displayName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            role: row.role,
            joinedAt: row.joinedAt,
          })
        }
      >
        {content}
      </button>
    );
  };

  const roleCell = (row: MemberRow) => {
    if (!row.role) return "—";

    const isOwnerRole = row.role === "OWNER";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold",
          isOwnerRole
            ? "border border-red-200 bg-red-500/10 text-red-600 dark:border-red-900/50 dark:text-red-400"
            : "border border-blue-200 bg-blue-500/10 text-blue-600 dark:border-blue-900/50 dark:text-blue-400",
        )}
      >
        {formatRole(row.role)}
      </span>
    );
  };

  const memberColumns: Column<MemberRow>[] = [
    {
      header: t("agency.members.columnName"),
      accessorKey: "displayName",
      sortable: true,
      cell: (row) => nameCell(row, true),
    },
    {
      header: t("agency.members.columnRole"),
      accessorKey: "role",
      sortable: true,
      cell: roleCell,
    },
    {
      header: t("agency.members.columnJoined"),
      accessorKey: "joinedAt",
      sortable: true,
      cell: (row) =>
        row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : "—",
    },
    {
      header: t("agency.members.columnActions"),
      accessorKey: "id",
      cell: (row) => {
        if (!isOwner || !row.removable) return "—";
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive cursor-pointer text-xs"
            onClick={() => setRemoveTargetId(row.id)}
          >
            {t("agency.members.remove")}
          </Button>
        );
      },
    },
  ];

  const invitationColumns: Column<MemberRow>[] = [
    {
      header: t("agency.members.columnName"),
      accessorKey: "displayName",
      sortable: true,
      cell: (row) => nameCell(row, false),
    },
    {
      header: t("agency.members.columnStatus"),
      accessorKey: "status",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
              row.status === "PENDING" &&
                "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
              row.status === "EXPIRED" && "bg-muted text-muted-foreground",
            )}
          >
            {t(`agency.members.status.${row.status}`)}
          </span>
          {row.status === "PENDING" && row.expiresAt && (
            <span className="text-muted-foreground text-2xs">
              {formatExpiresIn(row.expiresAt, t)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t("agency.members.columnActions"),
      accessorKey: "id",
      cell: (row) => {
        if (!isOwner || !row.cancellable) return "—";
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive cursor-pointer text-xs"
            onClick={() => handleCancelInvitation(row.id)}
          >
            {t("agency.members.cancelInvite")}
          </Button>
        );
      },
    },
  ];

  if (loading) return null;

  return (
    <PageWrapper
      title={t("agency.members.title")}
      description={t("agency.members.description")}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => navigate("/agency")}
        >
          {t("agency.members.back")}
        </Button>
      }
    >
      <div className="space-y-6">
        {isOwner && (
          <div className="rounded-xl border p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <UserPlus className="size-4" /> {t("agency.members.inviteTitle")}
            </p>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Input
                    label={t("agency.members.emailLabel")}
                    type="email"
                    placeholder={t("agency.members.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label={t("agency.members.inviteeNameLabel")}
                    placeholder={t("agency.members.inviteeNamePlaceholder")}
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                  />
                </div>

                {userMatch && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setInviteeName(userMatch.fullName);
                      toast.success(
                        t("agency.members.nameApplied", {
                          name: userMatch.fullName,
                        }),
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setInviteeName(userMatch.fullName);
                      }
                    }}
                    className={cn(
                      "col-span-1 flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 shadow-xs transition-all sm:col-span-2 sm:flex-row sm:items-center",
                      inviteeName.trim() === userMatch.fullName
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20"
                        : "border-brand-orange/40 bg-brand-orange/5 hover:bg-brand-orange/10",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <SafeAvatar
                        src={userMatch.avatarUrl}
                        name={userMatch.fullName}
                        className="border-background size-11 shrink-0 border-2 shadow-xs"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-foreground truncate text-sm font-semibold">
                            {userMatch.fullName}
                          </span>
                          <span className="text-3xs inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CheckCircle2 className="size-3 shrink-0" />
                            {t("agency.members.userMatchBadge")}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 shrink-0" />
                            {userMatch.email}
                          </span>
                          {userMatch.professionalTitle && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="size-3 shrink-0" />
                              {userMatch.professionalTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end">
                      {inviteeName.trim() === userMatch.fullName ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3.5" />
                          {t("agency.members.userMatchApplied")}
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInviteeName(userMatch.fullName);
                            toast.success(
                              t("agency.members.nameApplied", {
                                name: userMatch.fullName,
                              }),
                            );
                          }}
                        >
                          <Sparkles className="size-3.5" />
                          {t("agency.members.clickToFillName")}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <InviteEmailFields
                language={emailLanguage}
                note={note}
                onLanguageChange={setEmailLanguage}
                onNoteChange={(value) =>
                  setNotes((previous) => ({
                    ...previous,
                    [emailLanguage]: value,
                  }))
                }
              />
              <div className="max-w-50">
                <label className="text-foreground mb-1 block text-xs font-medium">
                  {t("agency.members.expiryLabel")}
                </label>
                <Input
                  type="number"
                  min={MIN_EXPIRY_DAYS}
                  max={MAX_EXPIRY_DAYS}
                  value={expiryDays}
                  onChange={(e) =>
                    setExpiryDays(
                      Math.min(
                        MAX_EXPIRY_DAYS,
                        Math.max(
                          MIN_EXPIRY_DAYS,
                          Number(e.target.value) || MIN_EXPIRY_DAYS,
                        ),
                      ),
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1 block text-xs font-medium">
                    {t("agency.members.assignWorkspaceLabel")}
                  </label>
                  <Select
                    value={inviteWorkspaceId}
                    disabled={workspaces.length === 0}
                    onChange={(e) => {
                      const nextWsId = e.target.value;
                      setInviteWorkspaceId(nextWsId);
                      if (!nextWsId) setInviteRole("");
                    }}
                  >
                    <option value="">
                      {workspaces.length === 0
                        ? t("agency.members.assignWorkspaceEmpty")
                        : t("agency.members.assignWorkspaceNone")}
                    </option>
                    {workspaces.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-xs font-medium">
                    {t("agency.members.assignRoleLabel")}
                  </label>
                  <Select
                    value={inviteWorkspaceId ? inviteRole : ""}
                    disabled={!inviteWorkspaceId}
                    onChange={(e) => {
                      setInviteRole(e.target.value as MemberRole | "");
                    }}
                  >
                    {!inviteWorkspaceId ? (
                      <option value="">
                        {t("agency.members.assignRoleOnlyAgency")}
                      </option>
                    ) : (
                      <>
                        <option value="">
                          {t("agency.members.assignRolePlaceholder")}
                        </option>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {t(`workspace.roles.${r}`)}
                          </option>
                        ))}
                      </>
                    )}
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                variant="orange"
                loading={inviting}
                className="cursor-pointer gap-1.5"
              >
                <Mail className="size-4" />
                {t("agency.members.sendInvite")}
              </Button>
            </form>
            {inviteLink && (
              <div className="bg-muted mt-3 flex items-center gap-2 rounded-lg p-2">
                <code className="min-w-0 flex-1 truncate text-xs">
                  {inviteLink}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  onClick={copyLink}
                >
                  <Copy className="size-3.5" /> {t("agency.members.copyLink")}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {t("agency.members.totalCount", {
                total: members.length,
                pending: pendingCount,
              })}
            </p>
            <div className="relative w-full max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                placeholder={t("agency.members.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs
            defaultValue="members"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="members">
                  {t("agency.members.tabMembers", {
                    count: memberRows.length,
                  })}
                </TabsTrigger>
                <TabsTrigger value="invitations">
                  {t("agency.members.tabInvitations", {
                    count: invitationRows.length,
                  })}
                </TabsTrigger>
              </TabsList>

              {activeTab === "members" && (
                <div className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setMemberViewMode("list")}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all sm:text-sm",
                      memberViewMode === "list"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "hover:text-foreground",
                    )}
                  >
                    <List className="size-3.5 sm:size-4" />
                    {t("agency.members.viewList")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberViewMode("tree")}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all sm:text-sm",
                      memberViewMode === "tree"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "hover:text-foreground",
                    )}
                  >
                    <Network className="size-3.5 sm:size-4" />
                    {t("agency.members.viewTree")}
                  </button>
                </div>
              )}
            </div>

            <TabsContent value="members" className="mt-3">
              {memberViewMode === "list" ? (
                <DataTable
                  columns={memberColumns}
                  data={filteredMemberRows}
                  pageSize={10}
                  emptyState={t("agency.members.empty")}
                />
              ) : (
                id && <AgencyOrgChart agencyId={id} />
              )}
            </TabsContent>
            <TabsContent value="invitations" className="mt-3">
              <DataTable
                columns={invitationColumns}
                data={filteredInvitationRows}
                pageSize={10}
                emptyState={t("agency.members.invitationsEmpty")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RemoveAgencyMemberDialog
        open={removeTargetId !== null}
        onOpenChange={(open) => !open && setRemoveTargetId(null)}
        submitting={removing}
        onSubmit={handleRemove}
      />

      <MemberProfileDrawer
        agencyId={id ?? ""}
        member={profileTarget}
        onOpenChange={(open) => !open && setProfileTarget(null)}
      />
    </PageWrapper>
  );
}

export default AgencyMembersPage;
