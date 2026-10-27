import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMaterialMetadataEdit } from "@/pages/library/hooks/useMaterialMetadataEdit";
import { MaterialAudienceFields } from "@/pages/library/components/MaterialAudienceFields";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem;
  onSaved: (material: MaterialItem) => void;
  onReload: () => void;
  onCancel: () => void;
  onUnavailable: () => void;
}

export function MaterialMetadataEditForm({
  material,
  onSaved,
  onReload,
  onCancel,
  onUnavailable,
}: Props) {
  const { t } = useTranslation();
  const id = useId();
  const editor = useMaterialMetadataEdit(material, onSaved, onUnavailable);
  const { draft, change, busy, error, extension } = editor;
  const label = (key: string) => t(`library.repository.${key}`);
  return (
    <form
      aria-label={label("editMetadata")}
      onSubmit={editor.submit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) onCancel();
        }
      }}
      className="space-y-4"
    >
      <fieldset disabled={busy} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            {label("nameLabel")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={`${id}-name`}
              autoFocus
              value={draft.name}
              disabled={!material.capabilities?.canRename}
              onChange={(event) => change({ name: event.target.value })}
            />
            <span className="text-muted-foreground text-sm">{extension}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            {t("library.repository.extensionLockedHint", { ext: extension })}
          </p>
        </div>
        {material.capabilities?.canUpdateType && (
          <div className="space-y-2">
            <label htmlFor={`${id}-type`} className="text-sm font-medium">
              {label("processingTypeLabel")}
            </label>
            <Select
              id={`${id}-type`}
              value={draft.type}
              onChange={(event) =>
                change({ type: event.target.value as "RAW" | "RETOUCHED" })
              }
            >
              <option value="RAW">{label("typeRAW")}</option>
              <option value="RETOUCHED">{label("typeRETOUCHED")}</option>
            </Select>
          </div>
        )}
        {material.type === "WATERMARKED" && (
          <p className="text-muted-foreground text-sm">
            {label("watermarkedTypeLocked")}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          {label("typeMetadataHint")}
        </p>
        <div className="space-y-2">
          <label htmlFor={`${id}-purpose`} className="text-sm font-medium">
            {label("purposeLabel")}
          </label>
          <Select
            id={`${id}-purpose`}
            value={draft.purpose}
            onChange={(event) =>
              change({
                purpose: event.target.value as "MATERIAL" | "BRAND_REFERENCE",
              })
            }
          >
            <option value="MATERIAL">{label("purposeMaterial")}</option>
            <option value="BRAND_REFERENCE">
              {label("purposeBrandReference")}
            </option>
          </Select>
        </div>
        {material.capabilities?.canChangeAudience && (
          <MaterialAudienceFields
            material={material}
            visibility={draft.visibility}
            profile={draft.profile}
            onChange={(visibility, profile) => change({ visibility, profile })}
          />
        )}
      </fieldset>
      {error && (
        <div role="alert" className="text-destructive space-y-2 text-sm">
          <p>{label(error)}</p>
          {error === "conflict" && (
            <Button type="button" variant="outline" onClick={onReload}>
              {label("reloadLatest")}
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="orange" loading={busy}>
          {label("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {label("cancel")}
        </Button>
      </div>
    </form>
  );
}
