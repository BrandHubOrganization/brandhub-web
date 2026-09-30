import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkspaceIndustry } from "@/types/workspace";

interface Props {
  industry: WorkspaceIndustry | "";
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

const SPECIALIZATION_OPTIONS = [
  "Marketing",
  "PR",
  "Sự kiện",
  "Tư vấn",
  "Khác",
] as const;

/** Field đặc thù theo ngành — free-form, lưu vào WorkspaceTemplateConfig.industryFields. */
export function IndustrySpecificFields({ industry, value, onChange }: Props) {
  const { t } = useTranslation();
  const [othersSelected, setOthersSelected] = useState(false);

  const setField = (key: string, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const textOf = (key: string) =>
    typeof value[key] === "string" ? (value[key] as string) : "";

  if (!industry) return null;

  const isOtherCategory = ![
    "FNB",
    "FASHION",
    "BEAUTY",
    "TECHNOLOGY",
    "REAL_ESTATE",
  ].includes(industry);

  const fields: { key: string; labelKey: string }[] = (() => {
    switch (industry) {
      case "FNB":
        return [
          {
            key: "cuisineType",
            labelKey: "workspace.industryFields.fnb.cuisineType",
          },
          {
            key: "seatingCapacity",
            labelKey: "workspace.industryFields.fnb.seatingCapacity",
          },
          {
            key: "deliveryPlatforms",
            labelKey: "workspace.industryFields.fnb.deliveryPlatforms",
          },
        ];
      case "FASHION":
        return [
          {
            key: "productCategories",
            labelKey: "workspace.industryFields.fashion.productCategories",
          },
          {
            key: "seasonalCollections",
            labelKey: "workspace.industryFields.fashion.seasonalCollections",
          },
        ];
      case "BEAUTY":
        return [
          {
            key: "serviceTypes",
            labelKey: "workspace.industryFields.beauty.serviceTypes",
          },
          {
            key: "certifications",
            labelKey: "workspace.industryFields.beauty.certifications",
          },
        ];
      case "TECHNOLOGY":
        return [
          {
            key: "techStack",
            labelKey: "workspace.industryFields.technology.techStack",
          },
          {
            key: "productType",
            labelKey: "workspace.industryFields.technology.productType",
          },
        ];
      case "REAL_ESTATE":
        return [
          {
            key: "propertyTypes",
            labelKey: "workspace.industryFields.realEstate.propertyTypes",
          },
          {
            key: "serviceAreas",
            labelKey: "workspace.industryFields.realEstate.serviceAreas",
          },
        ];
      default:
        return [];
    }
  })();

  const specializationValue = textOf("specialization");
  const isKnownOption = (SPECIALIZATION_OPTIONS as readonly string[])
    .slice(0, -1)
    .includes(specializationValue);
  const selectedToggle = isKnownOption
    ? specializationValue
    : othersSelected || specializationValue
      ? "Khác"
      : "";

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold tracking-wide">
        {t("workspace.industryFields.sectionTitle")}
      </Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <Input
            key={f.key}
            label={t(f.labelKey)}
            value={textOf(f.key)}
            onChange={(e) => setField(f.key, e.target.value)}
          />
        ))}
      </div>

      {isOtherCategory && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.industryFields.other.specialization")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALIZATION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setOthersSelected(option === "Khác");
                  setField("specialization", option === "Khác" ? "" : option);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedToggle === option
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedToggle === "Khác" && (
            <Input
              value={specializationValue}
              onChange={(e) => setField("specialization", e.target.value)}
              placeholder={t(
                "workspace.industryFields.other.specializationOtherPlaceholder",
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default IndustrySpecificFields;
