import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COMPANY_SIZES, WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";

interface Props {
  name: string;
  onNameChange: (value: string) => void;
  industry: WorkspaceIndustry | "";
  onIndustryChange: (value: WorkspaceIndustry | "") => void;
  companySize: CompanySize | "";
  onCompanySizeChange: (value: CompanySize | "") => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateWorkspaceForm({
  name,
  onNameChange,
  industry,
  onIndustryChange,
  companySize,
  onCompanySizeChange,
  website,
  onWebsiteChange,
  phone,
  onPhoneChange,
  location,
  onLocationChange,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card flex max-w-lg flex-col gap-4 rounded-xl border p-6"
    >
      <Input
        label={t("workspace.create.nameLabel")}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.create.industryLabel")}
          </Label>
          <Select
            value={industry}
            onChange={(e) =>
              onIndustryChange(e.target.value as WorkspaceIndustry | "")
            }
          >
            <option value="">
              {t("workspace.create.industryPlaceholder")}
            </option>
            {WORKSPACE_INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {t(`workspace.industry.${i}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.create.companySizeLabel")}
          </Label>
          <Select
            value={companySize}
            onChange={(e) =>
              onCompanySizeChange(e.target.value as CompanySize | "")
            }
          >
            <option value="">
              {t("workspace.create.companySizePlaceholder")}
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
        label={t("workspace.create.websiteLabel")}
        value={website}
        onChange={(e) => onWebsiteChange(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("workspace.create.phoneLabel")}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
        <Input
          label={t("workspace.create.locationLabel")}
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>
      <Button
        variant="orange"
        type="submit"
        loading={submitting}
        className="mt-1 gap-2 font-semibold"
      >
        {t("workspace.create.submit")}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
