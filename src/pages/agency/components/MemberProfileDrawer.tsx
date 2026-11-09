import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Phone,
  MapPin,
  Clock,
  Award,
  Globe,
  ExternalLink,
  Calendar,
  Building2,
  Shield,
  PlusCircle,
  Pencil,
  Trash2,
  Key,
  Activity,
  Rocket,
  CheckSquare,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa6";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { cn } from "@/lib/utils";
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

const PRIVATE_ACTIONS = new Set([
  "LOGIN",
  "LOGOUT",
  "TOKEN_REFRESH",
  "PASSWORD_RESET",
]);

function SafeAvatar({
  src,
  name,
  className,
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
          "bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center font-bold text-xl sm:text-2xl select-none",
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
      className={cn("size-full object-cover select-none", className)}
    />
  );
}

function getRoleBadgeStyle(r?: string | null) {
  switch (r) {
    case "OWNER":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50";
    case "ADMIN":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50";
    case "PROJECT_MANAGER":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
    case "CREATOR":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
    case "VIEWER":
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
    default:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
  }
}

function getActivityDisplay(
  activity: AgencyMemberActivity,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const { action, resourceType } = activity;

  if (resourceType === "campaign_deployment") {
    return {
      icon: Rocket,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      title: t("agency.members.profile.deployCampaign", {
        defaultValue: "Triển khai chiến dịch mới",
      }),
    };
  }

  if (resourceType === "task") {
    let color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
    let titleKey = "agency.members.profile.updateTask";
    let defaultTitle = "Cập nhật công việc";

    if (action === "CREATE") {
      color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      titleKey = "agency.members.profile.createTask";
      defaultTitle = "Tạo mới công việc";
    } else if (action === "DELETE") {
      color = "text-red-500 bg-red-500/10 border-red-500/20";
      titleKey = "agency.members.profile.deleteTask";
      defaultTitle = "Xóa công việc";
    }

    return {
      icon: CheckSquare,
      color,
      title: t(titleKey, { defaultValue: defaultTitle }),
    };
  }

  // Các resource khác (workspace, media_campaign, agency_member, client_profile...)
  let icon = Activity;
  let color = "text-brand-orange bg-brand-orange-soft border-brand-orange/20";

  switch (action) {
    case "CREATE":
      icon = PlusCircle;
      color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      break;
    case "UPDATE":
      icon = Pencil;
      color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
      break;
    case "DELETE":
      icon = Trash2;
      color = "text-red-500 bg-red-500/10 border-red-500/20";
      break;
    case "ROLE_CHANGE":
      icon = Shield;
      color = "text-purple-500 bg-purple-500/10 border-purple-500/20";
      break;
    case "PERMISSION_CHANGE":
      icon = Key;
      color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      break;
  }

  const resourceLabel = t(`agency.members.resourceType.${resourceType}`, {
    defaultValue: resourceType,
  });

  const title = t(`agency.members.auditAction.${action}`, {
    resource: resourceLabel,
    defaultValue: `${action} ${resourceLabel}`,
  });

  return { icon, color, title };
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

  if (!member) return null;

  const displayName = profile?.fullName || member.displayName;
  const email = profile?.email || member.email;
  const avatarUrl = profile?.avatarUrl ?? member.avatarUrl;
  const bannerUrl = profile?.bannerUrl;

  const hasQuickInfo = Boolean(
    profile?.professionalTitle ||
      profile?.location ||
      (profile?.yearsOfExperience !== null && profile?.yearsOfExperience !== undefined) ||
      profile?.workingLanguage ||
      profile?.timezone ||
      profile?.phone,
  );

  const hasSocials = Boolean(
    profile?.facebookUrl ||
      profile?.linkedinUrl ||
      profile?.instagramUrl ||
      profile?.tiktokUrl ||
      profile?.website,
  );

  const visibleActivities = activity.filter(
    (a) => !PRIVATE_ACTIONS.has(a.action),
  );

  return (
    <Sheet open={member !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 gap-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("agency.members.profile.title")}</SheetTitle>
        </SheetHeader>

        {/* 1. Header with Compact Banner & Avatar */}
        <div className="relative">
          {/* Banner */}
          <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-gradient-to-r from-brand-orange/20 via-amber-500/10 to-orange-400/20 dark:from-brand-orange/15 dark:via-amber-500/5 dark:to-orange-400/15">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt=""
                className="size-full object-cover select-none"
              />
            ) : (
              <div className="size-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/20 via-transparent to-transparent opacity-80" />
            )}
          </div>

          {/* Overlapping Avatar & Role */}
          <div className="px-5 sm:px-6 -mt-8 sm:-mt-10 relative z-10 flex items-end justify-between">
            <div className="size-16 sm:size-18 rounded-full border-4 border-background bg-background shadow-sm overflow-hidden shrink-0">
              <SafeAvatar src={avatarUrl} name={displayName} />
            </div>
            {member.role && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-xs mb-1",
                  getRoleBadgeStyle(member.role),
                )}
              >
                {member.role}
              </span>
            )}
          </div>

          {/* Name & Introduction Details */}
          <div className="px-5 sm:px-6 pt-2 pb-3 space-y-2.5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground truncate tracking-tight">
                {displayName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-0.5">
                <span className="truncate">{email}</span>
                {member.joinedAt && (
                  <>
                    <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      {t("agency.members.profile.joinedAt")}:{" "}
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Bio - Đưa lên trên ngay đầu */}
            {profile?.bio && (
              <div className="text-xs sm:text-sm text-foreground/90 italic bg-muted/40 p-2.5 sm:p-3 rounded-lg border border-border/60 leading-relaxed">
                “{profile.bio}”
              </div>
            )}

            {/* Quick Info Chips */}
            {hasQuickInfo && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile?.professionalTitle && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    <Briefcase className="size-3 text-brand-orange shrink-0" />
                    <span>{profile.professionalTitle}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    <MapPin className="size-3 text-brand-orange shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.yearsOfExperience !== null &&
                  profile?.yearsOfExperience !== undefined && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Award className="size-3 text-brand-orange shrink-0" />
                      <span>
                        {t("agency.members.profile.yearsExp", {
                          count: profile.yearsOfExperience,
                        })}
                      </span>
                    </div>
                  )}
                {profile?.workingLanguage && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    <Globe className="size-3 text-brand-orange shrink-0" />
                    <span>{profile.workingLanguage}</span>
                  </div>
                )}
                {profile?.timezone && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    <Clock className="size-3 text-brand-orange shrink-0" />
                    <span>{profile.timezone}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    <Phone className="size-3 text-brand-orange shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground border border-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Socials & Links */}
            {(hasSocials || (profile?.portfolioUrls && profile.portfolioUrls.length > 0)) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {profile?.website && (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-brand-orange/50 hover:text-brand-orange transition-colors"
                    title="Website"
                  >
                    <Globe className="size-3.5 text-brand-orange shrink-0" />
                    <span>Website</span>
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a
                    href={
                      profile.linkedinUrl.startsWith("http")
                        ? profile.linkedinUrl
                        : `https://${profile.linkedinUrl}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50/20 transition-colors"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="size-3.5 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.facebookUrl && (
                  <a
                    href={
                      profile.facebookUrl.startsWith("http")
                        ? profile.facebookUrl
                        : `https://${profile.facebookUrl}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-500 hover:border-blue-500 hover:bg-blue-50/20 transition-colors"
                    title="Facebook"
                  >
                    <FaFacebook className="size-3.5 shrink-0" />
                    <span>Facebook</span>
                  </a>
                )}
                {profile?.instagramUrl && (
                  <a
                    href={
                      profile.instagramUrl.startsWith("http")
                        ? profile.instagramUrl
                        : `https://${profile.instagramUrl}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-pink-600 dark:text-pink-400 hover:border-pink-400 hover:bg-pink-50/20 transition-colors"
                    title="Instagram"
                  >
                    <FaInstagram className="size-3.5 shrink-0" />
                    <span>Instagram</span>
                  </a>
                )}
                {profile?.tiktokUrl && (
                  <a
                    href={
                      profile.tiktokUrl.startsWith("http")
                        ? profile.tiktokUrl
                        : `https://${profile.tiktokUrl}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-border hover:bg-muted/40 transition-colors"
                    title="TikTok"
                  >
                    <FaTiktok className="size-3.5 shrink-0" />
                    <span>TikTok</span>
                  </a>
                )}
                {profile?.portfolioUrls?.map((url, idx) => (
                  <a
                    key={idx}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-brand-orange/40 hover:bg-muted/30 transition-colors"
                    title={url}
                  >
                    <ExternalLink className="size-3 shrink-0 text-brand-orange" />
                    <span className="max-w-[120px] truncate">
                      {url.replace(/^https?:\/\/(www\.)?/, "")}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Tabs Section */}
        <div className="px-5 sm:px-6 pt-1 pb-6 border-t border-border/60">
          <Tabs defaultValue="workspaces" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="workspaces" className="text-xs">
                {t("agency.members.profile.tabWorkspaces", {
                  count: profile?.workspaces?.length ?? 0,
                })}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                {t("agency.members.profile.tabActivity", {
                  count: visibleActivities.length,
                })}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Workspaces in this Agency */}
            <TabsContent value="workspaces" className="space-y-2 mt-0 outline-none">
              {profileLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  …
                </div>
              ) : profile && profile.workspaces.length > 0 ? (
                <ul className="space-y-2">
                  {profile.workspaces.map((w) => (
                    <li key={w.workspaceId}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/workspaces/${w.workspaceId}/settings`)
                        }
                        className="hover:border-brand-orange/50 flex w-full cursor-pointer items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-left transition-all hover:shadow-xs group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange-soft text-brand-orange">
                            <Building2 className="size-4" />
                          </div>
                          <span className="text-foreground truncate text-sm font-medium group-hover:text-brand-orange transition-colors">
                            {w.workspaceName}
                          </span>
                        </div>
                        <span className="text-muted-foreground bg-muted text-3xs shrink-0 rounded-full px-2.5 py-0.5 font-semibold">
                          {w.role}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  {t("agency.members.profile.noWorkspaces")}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Activity History */}
            <TabsContent value="activity" className="space-y-4 mt-0 outline-none">
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  …
                </div>
              ) : visibleActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  {t("agency.members.profile.noActivity")}
                </div>
              ) : (
                <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {visibleActivities.map((a) => {
                    const { icon: ActionIcon, color, title } = getActivityDisplay(a, t);
                    return (
                      <div key={a.id} className="relative group">
                        <div
                          className={cn(
                            "absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full border bg-background shadow-xs",
                            color,
                          )}
                        >
                          <ActionIcon className="size-2.5" />
                        </div>
                        <div className="rounded-lg border border-border/60 bg-card p-3 shadow-xs">
                          <p className="text-xs font-medium text-foreground">
                            {title}
                          </p>
                          <p className="text-3xs text-muted-foreground mt-1">
                            {new Date(a.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
