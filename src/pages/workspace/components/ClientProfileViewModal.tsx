import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import {
  Calendar,
  ExternalLink,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { ClientProfileLogo } from "@/pages/client-profiles/components/ClientProfileLogo";
import { clientProfileService } from "@/services/clientProfileService";
import type { ClientProfile } from "@/types/clientProfile";
import type { WorkspaceMember } from "@/types/workspace";

interface ClientProfileViewModalProps {
  client: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientProfileViewModal({
  client,
  open,
  onOpenChange,
}: ClientProfileViewModalProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!open || !client) {
      setProfile(null);
      setLoading(false);
      setFetchError(false);
      return;
    }

    if (!client.clientProfileId) {
      setProfile(null);
      setLoading(false);
      setFetchError(false);
      return;
    }

    setLoading(true);
    setFetchError(false);
    clientProfileService
      .getById(client.clientProfileId)
      .then(({ data }) => {
        setProfile(data.data);
      })
      .catch(() => {
        setFetchError(true);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, client]);

  const displayName =
    profile?.displayName?.trim() ||
    client?.fullName?.trim() ||
    t("workspace.members.clientLabel", "Khách hàng");

  const subtitle =
    profile?.tagline?.trim() ||
    profile?.company?.trim() ||
    client?.email ||
    "";

  const bannerUrl = profile?.bannerUrl || BANNER_PRESETS[0]?.url || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden rounded-2xl max-h-[85vh] flex flex-col border border-border shadow-2xl bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {t("workspace.members.clientProfileModalTitle", "Hồ sơ thương hiệu khách hàng")}
          </DialogTitle>
          <DialogDescription>
            {client?.fullName || client?.email || ""}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[85vh]">
          {loading ? (
            <div className="p-6 space-y-6">
              <Skeleton className="h-44 sm:h-56 w-full rounded-xl" />
              <div className="flex items-end gap-4 -mt-16 px-4">
                <Skeleton className="size-24 rounded-2xl border-4 border-card" />
                <div className="space-y-2 pb-2 flex-1">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <div className="space-y-3 px-4 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : (
            <ProfileBannerHeader
              bannerUrl={bannerUrl}
              bannerEmptyLabel={t("agency.detail.bannerEmptyLabel", "Chưa có ảnh bìa")}
              canEditBanner={false}
              canEditLogo={false}
              title={displayName}
              subtitle={subtitle}
              badges={
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {profile?.industry && (
                    <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {t(`workspace.industry.${profile.industry}`, profile.industry)}
                    </span>
                  )}
                  {profile?.companySize && (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {t(`agency.companySize.${profile.companySize}`, profile.companySize)}
                    </span>
                  )}
                  {profile?.foundedYear && (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      <Calendar className="mr-1 size-3" />
                      {t("clientProfile.preview.foundedPrefix", "Thành lập")}{" "}
                      {profile.foundedYear}
                    </span>
                  )}
                  {profile?.budgetRange && (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      <Wallet className="mr-1 size-3" />
                      {t(`clientProfile.budgetRange.${profile.budgetRange}`, profile.budgetRange)}
                    </span>
                  )}
                </div>
              }
              logo={
                <ClientProfileLogo
                  logoUrl={profile?.logoUrl}
                  displayName={displayName}
                  brandColor="#f05a28"
                  className="size-full"
                  iconClassName="size-10 sm:size-12"
                />
              }
            >
              <div className="space-y-4 pt-2">
                {/* Fallback / notice if client has no detailed brand profile or fetch error */}
                {(!client?.clientProfileId || fetchError) && (
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex items-start gap-3">
                    <Info className="size-4 text-brand-orange shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {fetchError
                        ? t(
                            "clientProfile.fetchError",
                            "Không thể tải hồ sơ chi tiết. Dưới đây là thông tin cơ bản của tài khoản.",
                          )
                        : t(
                            "workspace.members.clientProfileNotSet",
                            "Khách hàng chưa cập nhật hồ sơ thương hiệu chi tiết",
                          )}
                    </div>
                  </div>
                )}

                {/* Company Description */}
                {profile?.description?.trim() && (
                  <div className="border-border border-t pt-4">
                    <h4 className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                      {t("clientProfile.descriptionLabel", "Mô tả công ty")}
                    </h4>
                    <div
                      className="prose prose-sm dark:prose-invert text-foreground/85 max-w-none text-xs sm:text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: profile.description }}
                    />
                  </div>
                )}

                {/* Contact information */}
                {(profile?.website ||
                  profile?.phone ||
                  profile?.contactEmail ||
                  profile?.contactName ||
                  profile?.address ||
                  profile?.location ||
                  profile?.taxCode) && (
                  <div className="border-border space-y-2 border-t pt-4">
                    <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      {t("clientProfile.preview.contactTitle", "Thông tin liên hệ")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {profile.contactName && (
                        <div className="flex items-center gap-2">
                          <User className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.contactNameLabel", "Người liên hệ")}:
                          </span>
                          <span className="text-foreground font-medium truncate">
                            {profile.contactName}
                          </span>
                        </div>
                      )}
                      {profile.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.contactEmailLabel", "Email liên hệ")}:
                          </span>
                          <a
                            href={`mailto:${profile.contactEmail}`}
                            className="text-foreground hover:text-brand-orange truncate transition-colors"
                          >
                            {profile.contactEmail}
                          </a>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.phoneLabel", "Số điện thoại")}:
                          </span>
                          <a
                            href={`tel:${profile.phone}`}
                            className="text-foreground hover:text-brand-orange transition-colors"
                          >
                            {profile.phone}
                          </a>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.websiteLabel", "Website")}:
                          </span>
                          <a
                            href={
                              profile.website.startsWith("http")
                                ? profile.website
                                : `https://${profile.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-brand-orange truncate transition-colors"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {(profile.address || profile.location) && (
                        <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                          <MapPin className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.addressLabel", "Địa chỉ")}:
                          </span>
                          <span className="text-foreground truncate">
                            {profile.address || profile.location}
                          </span>
                        </div>
                      )}
                      {profile.taxCode && (
                        <div className="flex items-center gap-2">
                          <Receipt className="text-brand-orange size-3.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {t("clientProfile.taxCodeLabel", "Mã số thuế")}:
                          </span>
                          <span className="text-foreground font-mono">
                            {profile.taxCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social links */}
                {(profile?.socialLinks?.facebook ||
                  profile?.socialLinks?.linkedin ||
                  profile?.instagramUrl ||
                  profile?.socialLinks?.instagram) && (
                  <div className="border-border space-y-2 border-t pt-4">
                    <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      {t("clientProfile.sectionSocial", "Mạng xã hội")}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {profile.socialLinks?.facebook && (
                        <a
                          href={
                            profile.socialLinks.facebook.startsWith("http")
                              ? profile.socialLinks.facebook
                              : `https://${profile.socialLinks.facebook}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
                        >
                          <FaFacebook className="size-3.5 text-foreground/70" />
                          Facebook
                          <ExternalLink className="size-2.5 text-muted-foreground" />
                        </a>
                      )}
                      {profile.socialLinks?.linkedin && (
                        <a
                          href={
                            profile.socialLinks.linkedin.startsWith("http")
                              ? profile.socialLinks.linkedin
                              : `https://${profile.socialLinks.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
                        >
                          <FaLinkedin className="size-3.5 text-foreground/70" />
                          LinkedIn
                          <ExternalLink className="size-2.5 text-muted-foreground" />
                        </a>
                      )}
                      {(profile.instagramUrl ||
                        profile.socialLinks?.instagram) && (
                        <a
                          href={
                            (
                              profile.instagramUrl ||
                              profile.socialLinks?.instagram
                            )!.startsWith("http")
                              ? (profile.instagramUrl ||
                                  profile.socialLinks?.instagram)!
                              : `https://${profile.instagramUrl || profile.socialLinks?.instagram}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
                        >
                          <FaInstagram className="size-3.5 text-foreground/70" />
                          Instagram
                          <ExternalLink className="size-2.5 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Workspace Collaborator Account info */}
                {client && (
                  <div className="border-border space-y-2 border-t pt-4">
                    <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      {t(
                        "workspace.members.clientAccountInfo",
                        "Thông tin tài khoản cộng tác",
                      )}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/30 rounded-xl p-3 border border-border/60">
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground size-3.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {t("workspace.members.fullNameLabel", "Họ và tên")}:
                        </span>
                        <span className="text-foreground font-medium truncate">
                          {client.fullName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground size-3.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {t("workspace.members.emailLabel", "Email")}:
                        </span>
                        <span className="text-foreground truncate">
                          {client.email || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground size-3.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {t("workspace.members.joinedAtLabel", "Ngày tham gia")}:
                        </span>
                        <span className="text-foreground">
                          {client.joinedAt
                            ? new Date(client.joinedAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="text-muted-foreground size-3.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {t("workspace.members.statusLabel", "Trạng thái")}:
                        </span>
                        {client.isActive ? (
                          <Badge variant="secondary" className="text-[11px] py-0 px-2">
                            {t("workspace.members.active", "Đang hoạt động")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Internal note if available */}
                {profile?.note?.trim() && (
                  <div className="border-border border-t pt-3">
                    <div className="bg-muted/40 rounded-lg p-2.5 text-xs">
                      <span className="text-muted-foreground mb-0.5 block text-[10px] font-semibold tracking-wider uppercase">
                        {t("clientProfile.noteLabel", "Ghi chú")}:
                      </span>
                      <div
                        className="prose prose-sm dark:prose-invert text-foreground/80 max-w-none text-xs italic leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: profile.note }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </ProfileBannerHeader>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClientProfileViewModal;
