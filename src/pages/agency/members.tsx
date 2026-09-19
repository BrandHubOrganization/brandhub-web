import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/store/authStore";
import type { AgencyMember } from "@/types/agency";

export function AgencyMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    agencyService
      .listMembers(id)
      .then(({ data }) => setMembers(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.membersLoadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(load, [load]);

  const isOwner = members.some(
    (m) => m.userId === currentUser?.id && m.role === "OWNER",
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setInviting(true);
    try {
      const { data } = await agencyService.inviteMember(id, {
        email: email.trim(),
      });
      setInviteLink(
        `${window.location.origin}/invitations/accept?token=${data.data.token}`,
      );
      toast.success(t("agency.members.inviteSuccess", { email: email.trim() }));
      setEmail("");
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
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success(t("agency.members.removeSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.removeFailed")));
    }
  };

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
            <form onSubmit={handleInvite} className="flex items-end gap-2">
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
            </form>
            {inviteLink && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted p-2">
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

        <div className="rounded-xl border">
          <div className="divide-y">
            {members.length === 0 ? (
              <p className="text-muted-foreground p-5 text-sm">
                {t("agency.members.empty")}
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.fullName || "—"}
                      {m.userId === currentUser?.id && t("agency.members.you")}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {m.email || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {m.role}
                    </span>
                    {isOwner && m.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-xs text-destructive"
                        onClick={() => handleRemove(m.id)}
                      >
                        {t("agency.members.remove")}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AgencyMembersPage;
