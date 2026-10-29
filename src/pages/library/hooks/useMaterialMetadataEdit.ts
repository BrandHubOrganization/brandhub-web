import { useEffect, useRef, useState } from "react";
import { isAxiosError, isCancel } from "axios";
import { materialService } from "@/services/materialService";
import type { MaterialItem, UpdateMaterialRequest } from "@/types/material";

interface Draft {
  name: string;
  type: "RAW" | "RETOUCHED";
  purpose: "MATERIAL" | "BRAND_REFERENCE";
  visibility: "INTERNAL" | "CLIENT";
  profile: string;
}
const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
};

function initialDraft(material: MaterialItem): Draft {
  const dot = material.name.lastIndexOf(".");
  return {
    name: dot > 0 ? material.name.slice(0, dot) : material.name,
    type: material.type === "RETOUCHED" ? "RETOUCHED" : "RAW",
    purpose: material.purpose ?? "MATERIAL",
    visibility: material.visibility ?? "INTERNAL",
    profile: material.clientProfileId ?? "",
  };
}

function requestFor(
  material: MaterialItem,
  draft: Draft,
  extension: string,
): UpdateMaterialRequest {
  const request: UpdateMaterialRequest = { expectedVersion: material.version! };
  if (material.capabilities?.canRename) {
    request.name = draft.name + extension;
    request.purpose = draft.purpose;
  }
  if (material.capabilities?.canUpdateType) request.type = draft.type;
  if (
    material.capabilities?.canChangeAudience &&
    (draft.visibility !== material.visibility ||
      draft.profile !== (material.clientProfileId ?? ""))
  ) {
    request.visibility = draft.visibility;
    if (draft.visibility === "CLIENT") request.clientProfileId = draft.profile;
  }
  return request;
}

function validation(draft: Draft, extension: string) {
  if (!draft.name.trim()) return "nameRequired";
  if ((draft.name + extension).length > 255) return "nameTooLong";
  return draft.visibility === "CLIENT" && !draft.profile
    ? "clientRequired"
    : "";
}

function errorKey(error: unknown) {
  const code = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  if (code === "MATERIAL_VERSION_CONFLICT") return "conflict";
  if (code === "MATERIAL_EXTENSION_MISMATCH") return "extensionMismatchError";
  return code === "MATERIAL_DERIVATIVE_AUDIENCE_CONFLICT"
    ? "derivativeAudienceHint"
    : "updateError";
}

export function useMaterialMetadataEdit(
  material: MaterialItem,
  onSaved: (material: MaterialItem) => void,
  onUnavailable: () => void,
) {
  const [draft, setDraft] = useState(() => initialDraft(material));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const extension = extensions[material.mimeType ?? ""] ?? "";
  useEffect(() => () => controller.current?.abort(), []);
  const change = (next: Partial<Draft>) =>
    setDraft((previous) => ({ ...previous, ...next }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || material.version == null) return;
    const invalid = validation(draft, extension);
    if (invalid) {
      setError(invalid);
      return;
    }
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    try {
      const result = await materialService.update(
        material.workspaceId,
        material.id,
        requestFor(material, draft, extension),
        request.signal,
      );
      if (!request.signal.aborted) onSaved(result);
    } catch (failure) {
      if (!isCancel(failure) && !request.signal.aborted) {
        if (
          isAxiosError(failure) &&
          [403, 404].includes(failure.response?.status ?? 0)
        )
          onUnavailable();
        else setError(errorKey(failure));
      }
    } finally {
      if (!request.signal.aborted) setBusy(false);
    }
  }
  return { draft, change, busy, error, extension, submit };
}
