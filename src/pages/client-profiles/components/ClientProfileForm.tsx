import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";

interface Props {
  initial?: ClientProfile | null;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (data: UpdateClientProfileRequest) => void;
  onCancel?: () => void;
}

// Form field set dùng chung cho: tạo mới (list page), sửa (detail page),
// và tạo-mới-lúc-accept-invite (picker) — tránh 3 chỗ khai báo lại field.
export function ClientProfileForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [linkedin, setLinkedin] = useState(
    initial?.socialLinks?.linkedin ?? "",
  );
  const [facebook, setFacebook] = useState(
    initial?.socialLinks?.facebook ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const socialLinks: Record<string, string> = {};
    if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    onSubmit({
      displayName: displayName.trim(),
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.displayNameLabel")}
        </label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.companyLabel")}
        </label>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.logoUrlLabel")}
        </label>
        <Input
          value={logoUrl}
          placeholder="https://…"
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
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
          <label className="text-foreground mb-1 block text-xs font-medium">
            {t("clientProfile.industryLabel")}
          </label>
          <Select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">{t("clientProfile.industryPlaceholder")}</option>
            {industry &&
              !(WORKSPACE_INDUSTRIES as readonly string[]).includes(
                industry,
              ) && <option value={industry}>{industry}</option>}
            {WORKSPACE_INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {t(`workspace.industry.${i}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-foreground mb-1 block text-xs font-medium">
            {t("clientProfile.locationLabel")}
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.phoneLabel")}
        </label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-foreground mb-1 block text-xs font-medium">
            {t("clientProfile.linkedinLabel")}
          </label>
          <Input
            value={linkedin}
            placeholder="https://linkedin.com/company/…"
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
        <div>
          <label className="text-foreground mb-1 block text-xs font-medium">
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
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.descriptionLabel")}
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          {t("clientProfile.noteLabel")}
        </label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("clientProfile.cancelEdit")}
          </Button>
        )}
        <Button type="submit" variant="orange" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
