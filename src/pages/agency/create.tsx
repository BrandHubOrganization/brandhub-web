import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import {
  AGENCY_CATEGORIES,
  COMPANY_SIZES,
} from "@/pages/agency/constants";
import type { AgencyCategory, CompanySize } from "@/types/agency";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await agencyService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
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
        <Input
          label={t("agency.create.descriptionLabel")}
          placeholder={t("agency.create.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          <Input
            label={t("agency.create.locationLabel")}
            placeholder={t("agency.create.locationPlaceholder")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
