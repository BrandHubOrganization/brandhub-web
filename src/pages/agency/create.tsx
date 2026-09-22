import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProvinceSelect } from "@/components/ui/province-select";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";
import type { AgencyCategory, CompanySize } from "@/types/agency";

const CURRENT_YEAR = new Date().getFullYear();

export function CreateAgencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgencyCategory | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [brandColor, setBrandColor] = useState("#f05a28");
  const [logoIcon, setLogoIcon] = useState(LOGO_ICON_OPTIONS[0].name);
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const yearNum = foundedYear ? Number(foundedYear) : undefined;
      const { data } = await agencyService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum >= 1900 && yearNum <= CURRENT_YEAR
            ? yearNum
            : undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
      });
      toast.success(t("agency.create.success"));
      navigate(`/agency/${data.data.id}`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.createFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title={t("agency.create.title")}
      description={t("agency.create.description")}
    >
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          label={t("agency.create.nameLabel")}
          placeholder={t("agency.create.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <RichTextInput
          label={t("agency.create.descriptionLabel")}
          placeholder={t("agency.create.descriptionPlaceholder")}
          value={description}
          onChange={setDescription}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("agency.create.categoryLabel")}
            </Label>
            <Select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as AgencyCategory | "")
              }
            >
              <option value="">{t("agency.create.categoryPlaceholder")}</option>
              {AGENCY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`agency.category.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("agency.create.companySizeLabel")}
            </Label>
            <Select
              value={companySize}
              onChange={(e) =>
                setCompanySize(e.target.value as CompanySize | "")
              }
            >
              <option value="">
                {t("agency.create.companySizePlaceholder")}
              </option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {t(`agency.companySize.${s}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Input
          label={t("agency.create.websiteLabel")}
          placeholder={t("agency.create.websitePlaceholder")}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("agency.create.phoneLabel")}
            placeholder={t("agency.create.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <ProvinceSelect
            label={t("agency.create.locationLabel")}
            value={location}
            onChange={setLocation}
          />
        </div>

        <Input
          label={t("agency.create.taglineLabel")}
          placeholder={t("agency.create.taglinePlaceholder")}
          maxLength={140}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("agency.create.brandColorLabel")}
            </Label>
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="border-input h-9 w-full cursor-pointer rounded-md border"
            />
          </div>
          <Input
            label={t("agency.create.foundedYearLabel")}
            type="number"
            min={1900}
            max={CURRENT_YEAR}
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("agency.create.logoIconLabel")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {LOGO_ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setLogoIcon(name)}
                className={cn(
                  "flex size-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                  logoIcon === name
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={t("agency.create.facebookUrlLabel")}
            placeholder="https://facebook.com/..."
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
          <Input
            label={t("agency.create.linkedinUrlLabel")}
            placeholder="https://linkedin.com/..."
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
          <Input
            label={t("agency.create.instagramUrlLabel")}
            placeholder="https://instagram.com/..."
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/agency")}
            className="cursor-pointer"
          >
            {t("agency.create.cancel")}
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
          >
            {t("agency.create.submit")}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}

export default CreateAgencyPage;
