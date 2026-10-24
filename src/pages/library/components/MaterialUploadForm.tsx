import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MaterialUploadFields } from "@/pages/library/components/MaterialUploadFields";
import { useMaterialUpload } from "@/pages/library/hooks/useMaterialUpload";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import { materialUploadLimit } from "@/pages/library/hooks/materialUploadTransport";
import type { MaterialItem, MaterialUploadOptions } from "@/types/material";

interface Props {
  workspaceId: string;
  isClient: boolean;
  onSuccess: (material: MaterialItem) => void;
  onClose: () => void;
  onStart?: () => void;
}

export function MaterialUploadForm({
  workspaceId,
  isClient,
  onSuccess,
  onClose,
  onStart,
}: Props) {
  const { t } = useTranslation();
  const id = useId();
  const profiles = useMaterialUploadProfiles(workspaceId, isClient);
  const uploader = useMaterialUpload(workspaceId);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<MaterialUploadOptions>({
    type: "RAW",
    purpose: isClient ? "BRAND_REFERENCE" : "MATERIAL",
    visibility: isClient ? "CLIENT" : "INTERNAL",
  });
  const label = (key: string) => t(`library.repositoryUpload.${key}`);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || uploader.busy) return;
    const limit = materialUploadLimit(file.type);
    if (!limit || file.size <= 0 || file.size > limit) {
      setError(label("invalidFile"));
      return;
    }
    setError("");
    onStart?.();
    try {
      const material = await uploader.upload(file, options);
      if (material) {
        toast.success(label("success"));
        onSuccess(material);
        onClose();
      }
    } catch (failure) {
      if (
        axios.isCancel(failure) ||
        (failure instanceof DOMException && failure.name === "AbortError")
      )
        return;
      const code = axios.isAxiosError<{ error?: { code?: string } }>(failure)
        ? failure.response?.data?.error?.code
        : undefined;
      const key =
        code === "STORAGE_QUOTA_EXCEEDED"
          ? "quotaExceeded"
          : code === "STORAGE_POOL_CAPACITY_EXCEEDED"
            ? "poolFull"
            : code === "MATERIAL_STORAGE_UNAVAILABLE" ||
                code === "STORAGE_SCHEMA_NOT_READY"
              ? "unavailable"
              : "failed";
      setError(label(key));
      toast.error(label(key), { duration: 5000 });
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-card text-card-foreground border-border w-full space-y-4 rounded-xl border p-4"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-lg font-semibold">
        {label("title")}
      </h3>
      <MaterialUploadFields
        id={id}
        options={options}
        onChange={setOptions}
        onFile={setFile}
        profiles={profiles.data ?? []}
        isClient={isClient}
        disabled={uploader.busy}
      />
      {options.type === "RAW" && file?.type.startsWith("image/") && (
        <p className="text-muted-foreground text-sm">{label("rawWarning")}</p>
      )}
      {profiles.isError && (
        <p role="alert" className="text-destructive text-sm">
          {label("profilesFailed")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {uploader.busy && (
        <div role="status" aria-live="polite" className="space-y-2">
          <p>
            {uploader.stage === "validating"
              ? label("validating")
              : t("library.repositoryUpload.progress", {
                  percent: uploader.progress,
                })}
          </p>
          <progress
            className="w-full"
            value={uploader.progress}
            max={100}
            aria-label={label("progressLabel")}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="orange"
          disabled={
            !file ||
            uploader.busy ||
            (options.visibility === "CLIENT" && !options.clientProfileId)
          }
          aria-busy={uploader.busy}
        >
          {label(error ? "retry" : "submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            uploader.cancel();
            if (!uploader.busy) onClose();
          }}
        >
          {label(uploader.busy ? "cancelUpload" : "close")}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">{label("cancelHint")}</p>
    </form>
  );
}
