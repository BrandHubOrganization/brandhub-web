import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function QuickNumbers({
  values,
  value,
  onChange,
  format = String,
}: {
  values: readonly number[];
  value: string;
  onChange: (value: string) => void;
  format?: (value: number) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((number) => (
        <Button
          key={number}
          type="button"
          size="sm"
          variant={value === String(number) ? "secondary" : "outline"}
          aria-pressed={value === String(number)}
          onClick={() => onChange(String(number))}
        >
          {format(number)}
        </Button>
      ))}
    </div>
  );
}

export function TextChoices({
  label,
  value,
  onChange,
  options,
  maxLength,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  maxLength: number;
  id?: string;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { t } = useTranslation();
  const [showCustom, setShowCustom] = useState(false);
  const selected = options.indexOf(value);
  const custom = showCustom || (Boolean(value) && selected < 0);
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Select
        id={fieldId}
        value={custom ? "custom" : selected < 0 ? "" : String(selected)}
        onChange={(event) => {
          const next = event.target.value;
          setShowCustom(next === "custom");
          if (next !== "custom")
            onChange(next === "" ? "" : options[Number(next)]);
        }}
      >
        <option value="">{t("mediaPackage.choices.select")}</option>
        {options.map((option, index) => (
          <option key={option} value={index}>
            {option}
          </option>
        ))}
        <option value="custom">{t("mediaPackage.choices.other")}</option>
      </Select>
      {custom && (
        <Textarea
          aria-label={`${label} — ${t("mediaPackage.choices.other")}`}
          rows={3}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
