import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { AssignMemberPicker } from "./AssignMemberPicker";
import { RichTextInput } from "@/components/ui/rich-text-input";
import type { AssignEntry } from "@/services/workspaceService";

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
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
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
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card mx-auto grid max-w-4xl grid-cols-1 gap-4 rounded-xl border p-6 md:grid-cols-2"
    >
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
