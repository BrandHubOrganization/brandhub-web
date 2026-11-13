import { useState, type ReactNode } from "react";
import { FileUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/select";
import type { MaterialUploadOptions } from "@/types/material";

interface Props {
  actions?: ReactNode;
  options: MaterialUploadOptions;
  onChange: (options: MaterialUploadOptions) => void;
  onFile: (file: File | null) => void;
  profiles?: { id: string; name: string }[];
  isClient?: boolean;
  canShare?: boolean;
  disabled: boolean;
  id: string;
}

export function MaterialUploadFields({
  actions,
  options,
  onChange,
  onFile,
  profiles: _profiles,
  isClient: _isClient,
  canShare: _canShare = true,
  disabled,
  id,
}: Props) {
  const { t } = useTranslation();
  const [filename, setFilename] = useState("");
  const label = (key: string) => t(`library.repositoryUpload.${key}`);
  return (
    <fieldset className="min-w-0 space-y-3">
      <label
        htmlFor={`${id}-file`}
        className="border-border bg-muted/20 hover:bg-muted/50 hover:border-brand-orange/50 focus-within:ring-ring relative flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors focus-within:ring-2"
      >
        <div className="bg-brand-orange/10 text-brand-orange flex size-9 items-center justify-center rounded-full">
          <FileUp className="size-4" />
        </div>
        <span
          className="max-w-full min-w-0"
          title={filename || label("chooseFile")}
        >
          <span className="text-foreground block truncate text-sm font-semibold">
            {filename || label("chooseFile")}
          </span>
          <span className="text-muted-foreground block text-xs">
            {label("fileTypes")}
          </span>
        </span>
        <input
          disabled={disabled}
          className="sr-only"
          aria-label={label("file")}
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf,text/plain,.txt,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setFilename(file?.name ?? "");
            onFile(file);
          }}
        />
      </label>

      <details className="group border-border bg-muted/20 rounded-lg border px-3 py-1.5">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex min-h-7 w-full cursor-pointer list-none items-center justify-between rounded text-xs font-medium focus-visible:ring-2">
          <span>{label("options")} (Mặc định: Bản gốc · Tư liệu sản xuất)</span>
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="[&_label]:text-muted-foreground grid gap-2.5 pt-2.5 pb-1 sm:grid-cols-2 [&_label]:text-[11px] [&_label]:font-medium">
          <div className="space-y-1">
            <label htmlFor={`${id}-type`}>{label("type")}</label>
            <Select
              disabled={disabled}
              id={`${id}-type`}
              value={options.type}
              onChange={(event) =>
                onChange({
                  ...options,
                  type:
                    event.target.value === "RETOUCHED" ? "RETOUCHED" : "RAW",
                })
              }
            >
              <option value="RAW">{label("original")}</option>
              <option value="RETOUCHED">{label("edited")}</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`${id}-purpose`}>{label("purpose")}</label>
            <Select
              disabled={disabled}
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
        </div>
      </details>

      {actions}
    </fieldset>
  );
}
