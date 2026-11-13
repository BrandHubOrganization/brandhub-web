import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMaterialMetadataEdit } from "@/pages/library/hooks/useMaterialMetadataEdit";
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
      className="space-y-3"
    >
      <fieldset disabled={busy} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-name`} className="text-xs font-semibold text-foreground">
            {label("nameLabel")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={`${id}-name`}
              autoFocus
              value={draft.name}
              disabled={!material.capabilities?.canRename}
              className="h-9 rounded-[4px] text-xs"
              onChange={(event) => change({ name: event.target.value })}
            />
            <span className="text-muted-foreground shrink-0 text-xs font-medium">{extension}</span>
          </div>
        </div>
        {material.capabilities?.canUpdateType && (
          <div className="space-y-1.5">
            <label htmlFor={`${id}-type`} className="text-xs font-semibold text-foreground">
              {label("processingTypeLabel")}
            </label>
            <Select
              id={`${id}-type`}
              value={draft.type}
              className="h-9 rounded-[4px] text-xs"
              onChange={(event) =>
                change({ type: event.target.value as "RAW" | "RETOUCHED" })
              }
            >
              <option value="RAW">{label("typeRAW")}</option>
              <option value="RETOUCHED">{label("typeRETOUCHED")}</option>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-purpose`} className="text-xs font-semibold text-foreground">
            {label("purposeLabel")}
          </label>
          <Select
            id={`${id}-purpose`}
            value={draft.purpose}
            className="h-9 rounded-[4px] text-xs"
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
      </fieldset>
      {error && (
        <div role="alert" className="text-destructive space-y-2 text-xs">
          <p>{label(error)}</p>
          {error === "conflict" && (
            <Button type="button" variant="outline" size="sm" className="rounded-[4px]" onClick={onReload}>
              {label("reloadLatest")}
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" variant="orange" size="sm" className="h-8 rounded-[4px] px-3.5 text-xs" loading={busy}>
          {label("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-[4px] px-3.5 text-xs"
          disabled={busy}
          onClick={onCancel}
        >
          {label("cancel")}
        </Button>
      </div>
    </form>
  );
}
