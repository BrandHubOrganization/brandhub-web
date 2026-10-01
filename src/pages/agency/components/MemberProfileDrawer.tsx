import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Briefcase, Phone } from "lucide-react";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import type { AgencyMemberActivity, AgencyMemberProfile } from "@/types/agency";

export interface MemberProfileTarget {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: string | null;
  joinedAt: string | null;
}

interface Props {
  agencyId: string;
  member: MemberProfileTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function MemberProfileDrawer({ agencyId, member, onOpenChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<AgencyMemberActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<AgencyMemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!member) return;
    setLoading(true);
    agencyService
      .getMemberActivity(agencyId, member.userId)
      .then(({ data }) => setActivity(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(
            err,
            t("agency.members.profile.activityLoadError"),
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [agencyId, member, t]);

  useEffect(() => {
    if (!member) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    agencyService
      .getMemberProfile(agencyId, member.userId)
      .then(({ data }) => setProfile(data.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [agencyId, member]);

  return (
    <Sheet open={member !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>{t("agency.members.profile.title")}</SheetTitle>
        </SheetHeader>
        {member && (
          <div className="space-y-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt=""
                  className="size-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="bg-brand-orange-soft text-brand-orange flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {member.displayName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">
                  {t("agency.members.profile.role")}
                </p>
                <p className="text-foreground font-medium">
                  {member.role ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  {t("agency.members.profile.joinedAt")}
                </p>
                <p className="text-foreground font-medium">
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            {!profileLoading &&
              profile &&
              (profile.phone || profile.professionalTitle) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {profile.professionalTitle && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Briefcase className="size-3" />
                        {t("agency.members.profile.professionalTitle")}
                      </p>
                      <p className="text-foreground font-medium">
                        {profile.professionalTitle}
                      </p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Phone className="size-3" />
                        {t("agency.members.profile.phone")}
                      </p>
                      <p className="text-foreground font-medium">
                        {profile.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {!profileLoading && profile && profile.workspaces.length > 0 && (
              <div>
                <p className="text-foreground mb-3 text-sm font-semibold">
                  {t("agency.members.profile.workspacesTitle")}
                </p>
                <ul className="space-y-2">
                  {profile.workspaces.map((w) => (
                    <li key={w.workspaceId}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/workspaces/${w.workspaceId}/settings`)
                        }
                        className="hover:border-brand-orange/50 flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-colors"
                      >
                        <span className="text-foreground truncate text-sm font-medium">
                          {w.workspaceName}
                        </span>
                        <span className="text-muted-foreground bg-muted text-3xs shrink-0 rounded-full px-2 py-0.5 font-semibold">
                          {w.role}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-foreground mb-3 text-sm font-semibold">
                {t("agency.members.profile.activityTitle")}
              </p>
              {loading ? (
                <p className="text-muted-foreground text-xs">…</p>
              ) : activity.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  {t("agency.members.profile.activityEmpty")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((a) => (
                    <li
                      key={a.id}
                      className="border-border relative border-l pl-4 text-sm"
                    >
                      <span className="bg-brand-orange absolute top-1.5 -left-[3.5px] size-1.5 rounded-full" />
                      <p className="text-foreground">
                        {t(`agency.members.auditAction.${a.action}`, {
                          resource: a.resourceType,
                        })}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
