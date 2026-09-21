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
import { extractErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import type { AgencyMember, AgencyMemberRole } from "@/types/agency";

interface MemberRow {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: AgencyMemberRole | null;
  status: "ACTIVE" | "PENDING";
  joinedAt: string | null;
  isCurrentUser: boolean;
  removable: boolean;
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
  const [note, setNote] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

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
          isCurrentUser: m.userId === currentUser?.id,
          removable: m.role !== "OWNER",
        }));
        const pendingRows: MemberRow[] = invitationsRes.data.data
          .filter((inv) => inv.status === "PENDING")
          .map((inv) => ({
            id: inv.id,
            displayName: inv.invitedEmail,
            email: inv.invitedEmail,
            avatarUrl: null,
            role: null,
            status: "PENDING",
            joinedAt: null,
            isCurrentUser: false,
            removable: false,
          }));
        setMembers(membersRes.data.data);
        setPendingCount(pendingRows.length);
        setRows([...memberRows, ...pendingRows]);
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
    setInviting(true);
    try {
      const { data } = await agencyService.inviteMember(id, {
        email: email.trim(),
        note: note.trim() || undefined,
      });
      setInviteLink(
        `${window.location.origin}/invitations/accept?token=${data.data.token}`,
      );
      toast.success(t("agency.members.inviteSuccess", { email: email.trim() }));
      setEmail("");
      setNote("");
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

  const handleRemove = async (memberId: string) => {
    if (!id) return;
    try {
      await agencyService.removeMember(id, memberId);
      setRows((prev) => prev.filter((r) => r.id !== memberId));
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success(t("agency.members.removeSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.removeFailed")));
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
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            row.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
          )}
        >
          {t(`agency.members.status.${row.status}`)}
        </span>
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
      cell: (row) =>
        isOwner && row.status === "ACTIVE" && row.removable ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive cursor-pointer text-xs"
            onClick={() => handleRemove(row.id)}
          >
            {t("agency.members.remove")}
          </Button>
        ) : (
          "—"
        ),
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
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={t("agency.members.emailLabel")}
                    type="email"
                    placeholder={t("agency.members.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  loading={inviting}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white"
                >
                  <Mail className="size-4" />
                  {t("agency.members.sendInvite")}
                </Button>
              </div>
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium">
                  {t("agency.members.noteLabel")}
                </label>
                <Textarea
                  placeholder={t("agency.members.notePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
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
    </PageWrapper>
  );
}

export default AgencyMembersPage;
