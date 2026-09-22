import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { clientProfileService } from "@/services/clientProfileService";
import { extractErrorMessage } from "@/utils/error";

export function ClientProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");

  const [missingAgencyId, setMissingAgencyId] = useState(false);

  useEffect(() => {
    if (!agencyId) {
      setLoading(false);
      setMissingAgencyId(true);
      return;
    }
    clientProfileService
      .getMyProfile(agencyId)
      .then((resp) => {
        const p = resp.data.data;
        setDisplayName(p.displayName);
        setCompany(p.company ?? "");
        setPhone(p.phone ?? "");
        setNote(p.note ?? "");
        setLogoUrl(p.logoUrl ?? "");
        setWebsite(p.website ?? "");
        setIndustry(p.industry ?? "");
        setLocation(p.location ?? "");
        setDescription(p.description ?? "");
        setLinkedin(p.socialLinks?.linkedin ?? "");
        setFacebook(p.socialLinks?.facebook ?? "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [agencyId]);

  const handleSave = async () => {
    if (!agencyId) return;
    setSaving(true);
    try {
      const socialLinks: Record<string, string> = {};
      if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();
      if (facebook.trim()) socialLinks.facebook = facebook.trim();

      const resp = await clientProfileService.updateMyProfile(agencyId, {
        displayName,
        company: company || undefined,
        phone: phone || undefined,
        note: note || undefined,
        logoUrl: logoUrl || undefined,
        website: website || undefined,
        industry: industry || undefined,
        location: location || undefined,
        description: description || undefined,
        socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
      });
      const p = resp.data.data;
      setDisplayName(p.displayName);
      setCompany(p.company ?? "");
      setPhone(p.phone ?? "");
      setNote(p.note ?? "");
      setLogoUrl(p.logoUrl ?? "");
      setWebsite(p.website ?? "");
      setIndustry(p.industry ?? "");
      setLocation(p.location ?? "");
      setDescription(p.description ?? "");
      setLinkedin(p.socialLinks?.linkedin ?? "");
      setFacebook(p.socialLinks?.facebook ?? "");
      setIsEditing(false);
      toast.success(t("clientProfile.saveSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("clientProfile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => setIsEditing(false);

  if (loading) return null;

  if (missingAgencyId) {
    return (
      <PageWrapper
        title={t("clientProfile.title")}
        description={t("clientProfile.description")}
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <User className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {t("clientProfile.missingAgencyId")}
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (notFound) {
    return (
      <PageWrapper
        title={t("clientProfile.title")}
        description={t("clientProfile.description")}
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
    { url: linkedin, icon: Link2, label: t("clientProfile.linkedinLabel") },
    { url: facebook, icon: Link2, label: t("clientProfile.facebookLabel") },
  ].filter((s) => s.url);

  return (
    <PageWrapper
      title={t("clientProfile.title")}
      description={t("clientProfile.description")}
    >
      <div className="border-border bg-card max-w-2xl rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="border-border size-12 rounded-full border object-cover"
              />
            ) : (
              <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-12 items-center justify-center rounded-full border text-lg font-bold">
                {(displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-foreground text-base font-semibold">
                {displayName}
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
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.displayNameLabel")}
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.companyLabel")}
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.logoUrlLabel")}
              </label>
              <Input
                value={logoUrl}
                placeholder="https://…"
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.websiteLabel")}
              </label>
              <Input
                value={website}
                placeholder="https://…"
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("clientProfile.industryLabel")}
                </label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("clientProfile.locationLabel")}
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.phoneLabel")}
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("clientProfile.linkedinLabel")}
                </label>
                <Input
                  value={linkedin}
                  placeholder="https://linkedin.com/company/…"
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("clientProfile.facebookLabel")}
                </label>
                <Input
                  value={facebook}
                  placeholder="https://facebook.com/…"
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.descriptionLabel")}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("clientProfile.noteLabel")}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                {t("clientProfile.cancelEdit")}
              </Button>
              <Button variant="orange" onClick={handleSave} loading={saving}>
                {t("clientProfile.save")}
              </Button>
            </div>
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
                  {company || "—"}
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
                  {phone || "—"}
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
                  {industry || "—"}
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
                  {location || "—"}
                </p>
              </div>
            </div>
            {website && (
              <div className="flex items-center gap-2.5">
                <Globe className="text-muted-foreground size-4" />
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("clientProfile.websiteLabel")}
                  </p>
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground text-xs font-medium underline-offset-2 hover:underline"
                  >
                    {website}
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
            {description && (
              <div className="col-span-full">
                <p className="text-muted-foreground text-3xs">
                  {t("clientProfile.descriptionLabel")}
                </p>
                <p className="text-foreground mt-0.5 text-xs">{description}</p>
              </div>
            )}
            <div className="col-span-full">
              <p className="text-muted-foreground text-3xs">
                {t("clientProfile.noteLabel")}
              </p>
              <p className="text-foreground mt-0.5 text-xs">{note || "—"}</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default ClientProfilePage;
