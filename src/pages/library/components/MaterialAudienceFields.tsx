import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/select";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem;
  visibility: "INTERNAL" | "CLIENT";
  profile: string;
  onChange: (visibility: "INTERNAL" | "CLIENT", profile: string) => void;
}

export function MaterialAudienceFields({
  material,
  visibility,
  profile,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const id = useId();
  const profiles = useMaterialUploadProfiles(material.workspaceId, false);
  const label = (key: string) => t(`library.repository.${key}`);
  return (
    <>
      <div className="space-y-2">
        <label htmlFor={`${id}-visibility`} className="text-sm font-medium">
          {label("audienceLabel")}
        </label>
        <Select
          id={`${id}-visibility`}
          value={visibility}
          onChange={(event) =>
            onChange(
              event.target.value as "INTERNAL" | "CLIENT",
              event.target.value === "INTERNAL" ? "" : profile,
            )
          }
        >
          <option value="INTERNAL">{label("audienceInternal")}</option>
          <option value="CLIENT">{label("audienceClient")}</option>
        </Select>
      </div>
      {visibility === "CLIENT" && (
        <div className="space-y-2">
          <label htmlFor={`${id}-profile`} className="text-sm font-medium">
            {label("clientLabel")}
          </label>
          <Select
            id={`${id}-profile`}
            value={profile}
            disabled={profiles.isPending || profiles.isError}
            onChange={(event) => onChange(visibility, event.target.value)}
          >
            <option value="">{label("clientRequired")}</option>
            {profiles.data?.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
            {profile &&
              !profiles.data?.some((entry) => entry.id === profile) && (
                <option value={profile}>
                  {material.clientDisplayName ?? profile}
                </option>
              )}
          </Select>
        </div>
      )}
      {profiles.isError && (
        <p role="alert" className="text-destructive text-sm">
          {label("profilesUnavailable")}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        {label("derivativeAudienceHint")}
      </p>
    </>
  );
}
