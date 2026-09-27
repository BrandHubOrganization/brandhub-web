import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Tag,
  User,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { clientProfileService } from "@/services/clientProfileService";
import { extractErrorMessage } from "@/utils/error";
import type { ClientProfile } from "@/types/clientProfile";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import { ClientProfileForm } from "./components/ClientProfileForm";

export function ClientProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    clientProfileService
      .getById(id)
      .then(({ data }) => setProfile(data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (
    data: Parameters<typeof clientProfileService.updateById>[1],
  ) => {
    if (!id) return;
    setSaving(true);
    try {
      const { data: resp } = await clientProfileService.updateById(id, data);
      setProfile(resp.data);
      setIsEditing(false);
      toast.success(t("clientProfile.saveSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("clientProfile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  if (notFound || !profile) {
    return (
      <PageWrapper
        title={t("clientProfile.title")}
        description={t("clientProfile.description")}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate("/client-profiles")}
          >
            {t("clientProfile.list.back")}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <User className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {t("clientProfile.notFound")}
          </p>
        </div>
      </PageWrapper>
    );
  }

  const socials = [
    {
      url: profile.socialLinks?.linkedin,
      icon: Link2,
      label: t("clientProfile.linkedinLabel"),
    },
    {
      url: profile.socialLinks?.facebook,
      icon: Link2,
      label: t("clientProfile.facebookLabel"),
    },
  ].filter(
    (s): s is { url: string; icon: typeof Link2; label: string } => !!s.url,
  );

  return (
    <PageWrapper
      title={t("clientProfile.title")}
      description={t("clientProfile.description")}
      actions={
        <Button variant="outline" onClick={() => navigate("/client-profiles")}>
          {t("clientProfile.list.back")}
        </Button>
      }
    >
      <div className="border-border bg-card max-w-2xl rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.displayName}
                className="border-border size-12 rounded-full border object-cover"
              />
            ) : (
              <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-12 items-center justify-center rounded-full border text-lg font-bold">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-foreground text-base font-semibold">
                {profile.displayName}
              </h2>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <Mail className="size-3.5" />
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
              {t("clientProfile.editButton")}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-6">
            <ClientProfileForm
              initial={profile}
              submitting={saving}
              submitLabel={t("clientProfile.save")}
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Building2 className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.companyLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {profile.company || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.phoneLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {profile.phone || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Tag className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.industryLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {profile.industry
                    ? (WORKSPACE_INDUSTRIES as readonly string[]).includes(
                        profile.industry,
                      )
                      ? t(`workspace.industry.${profile.industry}`)
                      : profile.industry
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.locationLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {profile.location || "—"}
                </p>
              </div>
            </div>
            {profile.website && (
              <div className="flex items-center gap-2.5">
                <Globe className="text-muted-foreground size-4" />
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("clientProfile.websiteLabel")}
                  </p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground text-xs font-medium underline-offset-2 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}
            {socials.map(({ url, icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="text-muted-foreground size-4" />
                <div>
                  <p className="text-muted-foreground text-3xs">{label}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground text-xs font-medium underline-offset-2 hover:underline"
                  >
                    {url}
                  </a>
                </div>
              </div>
            ))}
            {profile.description && (
              <div className="col-span-full">
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.descriptionLabel")}
                </p>
                <p className="text-foreground mt-0.5 text-xs">
                  {profile.description}
                </p>
              </div>
            )}
            <div className="col-span-full">
              <p className="text-muted-foreground text-3xs">
                {t("clientProfile.noteLabel")}
              </p>
              <p className="text-foreground mt-0.5 text-xs">
                {profile.note || "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default ClientProfileDetailPage;
