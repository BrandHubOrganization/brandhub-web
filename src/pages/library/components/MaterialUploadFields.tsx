import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { MaterialUploadOptions } from "@/types/material";

interface Props {
  options: MaterialUploadOptions;
  onChange: (options: MaterialUploadOptions) => void;
  onFile: (file: File | null) => void;
  profiles: { id: string; name: string }[];
  isClient: boolean;
  canShare?: boolean;
  disabled: boolean;
  id: string;
}

export function MaterialUploadFields({
  options,
  onChange,
  onFile,
  profiles,
  isClient,
  canShare = true,
  disabled,
  id,
}: Props) {
  const { t } = useTranslation();
  const label = (key: string) => t(`library.repositoryUpload.${key}`);
  return (
    <fieldset disabled={disabled} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor={`${id}-file`}>{label("file")}</label>
        <Input
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          aria-describedby={`${id}-limits`}
        />
        <p id={`${id}-limits`} className="text-muted-foreground text-sm">
          {label("limits")}
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor={`${id}-type`}>{label("type")}</label>
        <Select
          id={`${id}-type`}
          value={options.type}
          onChange={(event) =>
            onChange({
              ...options,
              type: event.target.value === "RETOUCHED" ? "RETOUCHED" : "RAW",
            })
          }
        >
          <option value="RAW">RAW</option>
          <option value="RETOUCHED">RETOUCHED</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor={`${id}-purpose`}>{label("purpose")}</label>
        <Select
          id={`${id}-purpose`}
          value={options.purpose}
          onChange={(event) =>
            onChange({
              ...options,
              purpose:
                event.target.value === "BRAND_REFERENCE"
                  ? "BRAND_REFERENCE"
                  : "MATERIAL",
            })
          }
        >
          <option value="MATERIAL">{label("material")}</option>
          <option value="BRAND_REFERENCE">{label("reference")}</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor={`${id}-visibility`}>{label("audience")}</label>
        <Select
          id={`${id}-visibility`}
          value={options.visibility}
          disabled={isClient || !canShare}
          onChange={(event) =>
            onChange({
              ...options,
              visibility:
                event.target.value === "CLIENT" ? "CLIENT" : "INTERNAL",
              clientProfileId: undefined,
            })
          }
        >
          {!isClient && <option value="INTERNAL">{label("internal")}</option>}
          {(isClient || canShare || options.visibility === "CLIENT") && (
            <option value="CLIENT">{label("client")}</option>
          )}
        </Select>
      </div>
      {options.visibility === "CLIENT" && (
        <div className="space-y-2">
          <label htmlFor={`${id}-profile`}>{label("profile")}</label>
          <Select
            id={`${id}-profile`}
            required
            value={options.clientProfileId ?? ""}
            onChange={(event) =>
              onChange({
                ...options,
                clientProfileId: event.target.value || undefined,
              })
            }
          >
            <option value="">{label("chooseProfile")}</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </Select>
        </div>
      )}
    </fieldset>
  );
}
