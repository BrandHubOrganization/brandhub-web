import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  JOB_TITLES,
  JOB_TITLE_OTHER,
  isCuratedJobTitle,
} from "@/pages/profile/constants";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const CURATED = (JOB_TITLES as readonly string[]).filter(
  (j) => j !== JOB_TITLE_OTHER,
);

export function JobTitleSelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  const curated = isCuratedJobTitle(value);
  const selectValue = curated ? value : JOB_TITLE_OTHER;

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("profile.edit.jobTitleLabel")}
      </Label>
      <Select
        value={selectValue}
        onChange={(e) =>
          onChange(e.target.value === JOB_TITLE_OTHER ? "" : e.target.value)
        }
      >
        {CURATED.map((j) => (
          <option key={j} value={j}>
            {t(`profile.jobTitle.${j}`)}
          </option>
        ))}
        <option value={JOB_TITLE_OTHER}>
          {t(`profile.jobTitle.${JOB_TITLE_OTHER}`)}
        </option>
      </Select>
      {!curated && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("profile.edit.jobTitlePlaceholder")}
        />
      )}
    </div>
  );
}
