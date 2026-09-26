import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/ui/table";
import { Copy, Mail, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { useUserLookup } from "@/hooks/useUserLookup";
import { extractErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import { InviteMessagePresets } from "@/components/shared/InviteMessagePresets";
import { RemoveAgencyMemberDialog } from "./components/RemoveAgencyMemberDialog";
import { Select } from "@/components/ui/select";
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

export function AgencyMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState("");

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
  const [note, setNote] = useState("");
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
    Promise.all([
      agencyService.listMembers(id),
      agencyService.listInvitations(id),
    ])
      .then(([membersRes, invitationsRes]) => {
        const memberRows: MemberRow[] = membersRes.data.data.map((m) => ({
          id: m.id,
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
        const invitationRows: MemberRow[] = invitationsRes.data.data
          .filter((inv) => inv.status === "PENDING" || inv.status === "EXPIRED")
          .map((inv) => ({
            id: inv.id,
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
        setMembers(membersRes.data.data);
        setPendingCount(
          invitationRows.filter((r) => r.status === "PENDING").length,
        );
        setRows([...memberRows, ...invitationRows]);
      })
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("agency.errors.membersLoadFailed")),
        ),
      )
      .finally(() => setLoading(false));
  }, [id, t, currentUser?.id]);

  useEffect(load, [load]);

  const isOwner = members.some(
    (m) => m.userId === currentUser?.id && m.role === "OWNER",
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (inviteRole === "CLIENT" && !inviteWorkspaceId) {
      toast.error(t("agency.members.clientRequiresWorkspace"));
      return;
    }
    setInviting(true);
    try {
      const { data } = await agencyService.inviteMember(id, {
        email: email.trim(),
        inviteeName: inviteeName.trim() || undefined,
        note: note.trim() || undefined,
        workspaceId: inviteWorkspaceId || undefined,
        role: inviteRole || undefined,
        expiryDays,
      });
      setInviteLink(
        `${window.location.origin}/invitations/accept?token=${data.data.token}`,
      );
      toast.success(t("agency.members.inviteSuccess", { email: email.trim() }));
      setEmail("");
      setInviteeName("");
      setNote("");
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
      setRows((prev) => prev.filter((r) => r.id !== removeTargetId));
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
      setRows((prev) => prev.filter((r) => r.id !== invitationId));
      setPendingCount((prev) => Math.max(0, prev - 1));
      toast.success(t("agency.members.cancelInviteSuccess"));
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("agency.errors.cancelInviteFailed")),
      );
    }
  };

  const columns: Column<MemberRow>[] = [
    {
      header: t("agency.members.columnName"),
      accessorKey: "displayName",
      sortable: true,
      cell: (row) => (
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
            <p className="text-muted-foreground truncate text-xs">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t("agency.members.columnRole"),
      accessorKey: "role",
      sortable: true,
      cell: (row) =>
        row.role ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              row.role === "OWNER"
                ? "bg-brand-orange-soft text-brand-orange"
                : "bg-muted text-muted-foreground",
            )}
          >
            {row.role}
          </span>
        ) : (
          "—"
        ),
    },
    {
      header: t("agency.members.columnStatus"),
      accessorKey: "status",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
              row.status === "ACTIVE" &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
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
        if (!isOwner) return "—";
        if (row.status === "ACTIVE" && row.removable) {
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
        }
        if (row.cancellable) {
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
        }
        return "—";
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
                <Input
                  label={t("agency.members.inviteeNameLabel")}
                  placeholder={t("agency.members.inviteeNamePlaceholder")}
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                />
                <div>
                  <Input
                    label={t("agency.members.emailLabel")}
                    type="email"
                    placeholder={t("agency.members.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {userMatch && (
                    <button
                      type="button"
                      onClick={() => setInviteeName(userMatch.fullName)}
                      className="hover:bg-muted mt-1.5 flex w-full cursor-pointer items-center gap-2 rounded-md border p-2 text-left transition-colors"
                    >
                      {userMatch.avatarUrl ? (
                        <img
                          src={userMatch.avatarUrl}
                          alt=""
                          className="size-6 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-brand-orange-soft text-brand-orange text-2xs flex size-6 shrink-0 items-center justify-center rounded-full font-bold">
                          {userMatch.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-xs">
                        <span className="font-medium">
                          {userMatch.fullName}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {t("agency.members.userMatchHint")}
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium">
                  {t("agency.members.noteLabel")}
                </label>
                <InviteMessagePresets onPick={setNote} className="mb-1.5" />
                <Textarea
                  placeholder={t("agency.members.notePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
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
                    {t("agency.members.assignRoleLabel")}
                  </label>
                  <Select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as MemberRole | "")
                    }
                  >
                    <option value="">
                      {t("agency.members.assignRolePlaceholder")}
                    </option>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {t(`workspace.roles.${r}`)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-xs font-medium">
                    {t("agency.members.assignWorkspaceLabel")}
                    {inviteRole === "CLIENT" && (
                      <span className="text-rose-500"> *</span>
                    )}
                  </label>
                  <Select
                    value={inviteWorkspaceId}
                    disabled={workspaces.length === 0}
                    required={inviteRole === "CLIENT"}
                    onChange={(e) => setInviteWorkspaceId(e.target.value)}
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
              </div>
              <Button
                type="submit"
                loading={inviting}
                className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white"
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

          <DataTable
            columns={columns}
            data={filteredRows}
            pageSize={10}
            emptyState={t("agency.members.empty")}
          />
        </div>
      </div>

      <RemoveAgencyMemberDialog
        open={removeTargetId !== null}
        onOpenChange={(open) => !open && setRemoveTargetId(null)}
        submitting={removing}
        onSubmit={handleRemove}
      />
    </PageWrapper>
  );
}

export default AgencyMembersPage;
