import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { AssignMemberPicker } from "./AssignMemberPicker";
import { ClientInvitePicker } from "./ClientInvitePicker";
import { IndustrySpecificFields } from "./IndustrySpecificFields";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { RichTextInput } from "@/components/ui/rich-text-input";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import type { AssignEntry } from "@/services/workspaceService";
import type {
  CompanySize,
  WorkspaceIndustry,
  WorkspaceTemplate,
} from "@/types/workspace";

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  brandColor: string;
  onBrandColorChange: (value: string) => void;
  logoIcon: string;
  onLogoIconChange: (value: string) => void;
  tagline: string;
  onTaglineChange: (value: string) => void;
  foundedYear: string;
  onFoundedYearChange: (value: string) => void;
  agencyId: string | null;
  assignMembers: AssignEntry[];
  onAssignMembersChange: (value: AssignEntry[]) => void;
  clientEmails: string[];
  onClientEmailsChange: (value: string[]) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  appliedTemplateName: string | null;
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
  facebookUrl: string;
  onFacebookUrlChange: (value: string) => void;
  linkedinUrl: string;
  onLinkedinUrlChange: (value: string) => void;
  instagramUrl: string;
  onInstagramUrlChange: (value: string) => void;
  industryFields: Record<string, unknown>;
  onIndustryFieldsChange: (value: Record<string, unknown>) => void;
  availableTemplates: WorkspaceTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (id: string) => void;
}

// Các field trùng với Agency (ngành, quy mô, website, phone, khu vực,
// social links) đã bỏ khỏi form này — workspace kế thừa thông tin công ty
// mẹ, chỉ giữ field thật sự riêng cho từng workspace (mô tả, tagline,
// brand color/icon/năm để phân biệt nếu cần, và thành viên phụ trách).
export function CreateWorkspaceForm({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  brandColor,
  onBrandColorChange,
  logoIcon,
  onLogoIconChange,
  tagline,
  onTaglineChange,
  foundedYear,
  onFoundedYearChange,
  agencyId,
  assignMembers,
  onAssignMembersChange,
  clientEmails,
  onClientEmailsChange,
  submitting,
  onSubmit,
  appliedTemplateName,
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
  facebookUrl,
  onFacebookUrlChange,
  linkedinUrl,
  onLinkedinUrlChange,
  instagramUrl,
  onInstagramUrlChange,
  industryFields,
  onIndustryFieldsChange,
  availableTemplates,
  selectedTemplateId,
  onTemplateSelect,
}: Props) {
  const { t } = useTranslation();
  const [previewTemplate, setPreviewTemplate] =
    useState<WorkspaceTemplate | null>(null);

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card w-full grid grid-cols-1 gap-4 rounded-xl border p-6 md:grid-cols-2"
    >
      {availableTemplates.length > 0 && (
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.create.startFromTemplate")}
          </Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTemplateSelect("")}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                selectedTemplateId === ""
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t("workspace.create.noTemplateCard")}
            </button>
            {availableTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setPreviewTemplate(tpl)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                  selectedTemplateId === tpl.id
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {tpl.name}
              </button>
            ))}
          </div>
          <TemplatePreviewDialog
            template={previewTemplate}
            onOpenChange={(open) => !open && setPreviewTemplate(null)}
            onApply={(tpl) => {
              onTemplateSelect(tpl.id);
              setPreviewTemplate(null);
            }}
          />
        </div>
      )}

      {appliedTemplateName && (
        <div className="bg-brand-orange-soft text-brand-orange rounded-lg px-3 py-2 text-xs font-medium md:col-span-2">
          {t("workspace.create.templateApplied", {
            name: appliedTemplateName,
          })}
        </div>
      )}

      <div className="md:col-span-2">
        <Input
          label={t("workspace.create.nameLabel")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div className="md:col-span-2">
        <RichTextInput
          label={t("workspace.create.descriptionLabel")}
          value={description}
          onChange={onDescriptionChange}
        />
      </div>

      {appliedTemplateName && (
        <>
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
          <Input
            label={t("workspace.create.websiteLabel")}
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
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
          <Input
            label={t("workspace.create.facebookUrlLabel")}
            value={facebookUrl}
            onChange={(e) => onFacebookUrlChange(e.target.value)}
          />
          <Input
            label={t("workspace.create.linkedinUrlLabel")}
            value={linkedinUrl}
            onChange={(e) => onLinkedinUrlChange(e.target.value)}
          />
          <Input
            label={t("workspace.create.instagramUrlLabel")}
            value={instagramUrl}
            onChange={(e) => onInstagramUrlChange(e.target.value)}
          />
          <div className="md:col-span-2">
            <IndustrySpecificFields
              industry={industry}
              value={industryFields}
              onChange={onIndustryFieldsChange}
            />
          </div>
        </>
      )}

      <Input
        label={t("workspace.create.taglineLabel")}
        placeholder={t("workspace.create.taglinePlaceholder")}
        maxLength={140}
        value={tagline}
        onChange={(e) => onTaglineChange(e.target.value)}
      />
      <Input
        label={t("workspace.create.foundedYearLabel")}
        type="number"
        min={1900}
        max={CURRENT_YEAR}
        value={foundedYear}
        onChange={(e) => onFoundedYearChange(e.target.value)}
      />

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label className="text-xs font-semibold tracking-wide">
          {t("workspace.create.brandColorLabel")}
        </Label>
        <input
          type="color"
          value={brandColor}
          onChange={(e) => onBrandColorChange(e.target.value)}
          className="border-input h-9 w-full cursor-pointer rounded-md border"
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label className="text-xs font-semibold tracking-wide">
          {t("workspace.create.logoIconLabel")}
        </Label>
        <div className="flex flex-wrap gap-2">
          {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
            <button
              key={iconName}
              type="button"
              onClick={() => onLogoIconChange(iconName)}
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                logoIcon === iconName
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      {agencyId && (
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.create.assignMembersLabel")}
          </Label>
          <p className="text-muted-foreground text-xs">
            {t("workspace.create.assignMembersHint")}
          </p>
          <AssignMemberPicker
            agencyId={agencyId}
            value={assignMembers}
            onChange={onAssignMembersChange}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label className="text-xs font-semibold tracking-wide">
          {t("workspace.create.clientInviteLabel")}
        </Label>
        <p className="text-muted-foreground text-xs">
          {t("workspace.create.clientInviteHint")}
        </p>
        <ClientInvitePicker
          value={clientEmails}
          onChange={onClientEmailsChange}
        />
      </div>

      <Button
        variant="orange"
        type="submit"
        loading={submitting}
        className="mt-1 gap-2 font-semibold md:col-span-2"
      >
        {t("workspace.create.submit")}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
