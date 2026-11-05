import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError, isCancel } from "axios";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMaterialUpload } from "@/pages/library/hooks/useMaterialUpload";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import { materialUploadLimit } from "@/pages/library/hooks/materialUploadTransport";
import { DuplicateResolutionModal } from "@/pages/library/components/DuplicateResolutionModal";
import type { MediaItem } from "@/types/contentLibrary";

interface Props {
  onUploadSuccess: (material: MediaItem) => void;
  onUploadStart?: () => void;
  disabled?: boolean;
  folderId?: string;
}

export function MediaUploadButton(props: Props) {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  return (
    <DirectUpload key={`${workspace}:${role}:${props.folderId}`} {...props} />
  );
}

function DirectUpload({
  onUploadSuccess,
  onUploadStart,
  disabled,
  folderId,
}: Props) {
  const { t } = useTranslation();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const uploader = useMaterialUpload(workspace);
  const profiles = useMaterialUploadProfiles(
    workspace ?? "",
    role === "CLIENT",
    role === "CLIENT",
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [chooseProfile, setChooseProfile] = useState(false);
  const [profile, setProfile] = useState("");
  const label = (key: string) => t(`library.repositoryUpload.${key}`);
  const busy = uploader.busy || preparing;

  async function upload(selected: File, profileId?: string) {
    if (lock.current || !workspace) return;
    const limit = materialUploadLimit(selected.type);
    setFile(selected);
    setError("");
    if (!limit || selected.size <= 0 || selected.size > limit) {
      setError(label("invalidFile"));
      setFile(null);
      return;
    }
    lock.current = true;
    setPreparing(true);
    try {
      if (role === "CLIENT" && !profileId) {
        const result = await profiles.refetch();
        if (result.isError || !result.data?.length)
          throw new Error("PROFILES_UNAVAILABLE");
        if (result.data.length !== 1) {
          setChooseProfile(true);
          return;
        }
        profileId = result.data[0].id;
      }
      setChooseProfile(false);
      onUploadStart?.();
      const material = await uploader.upload(selected, {
        folderId,
        type: "RAW",
        purpose: role === "CLIENT" ? "BRAND_REFERENCE" : "MATERIAL",
        visibility: role === "CLIENT" ? "CLIENT" : "INTERNAL",
        clientProfileId: profileId,
      });
      if (material) {
        toast.success(label("success"));
        onUploadSuccess({
          id: material.id,
          workspaceId: material.workspaceId,
          filename: material.name,
          url: material.previewUrl ?? material.url ?? "",
          sizeBytes: material.fileSize ?? 0,
          createdAt: material.createdAt,
          type:
            material.mediaKind === "VIDEO"
              ? "video"
              : material.mediaKind === "FILE"
                ? "file"
                : "image",
          source: "repository",
        });
      }
      setFile(null);
    } catch (failure) {
      if (
        isCancel(failure) ||
        (failure instanceof DOMException && failure.name === "AbortError")
      )
        return;
      const code = isAxiosError(failure)
        ? failure.response?.data?.error?.code
        : undefined;
      if (code === "INVALID_UPLOAD_CONTENT_TYPE") {
        setError(label("invalidContent"));
        setFile(null);
        return;
      }
      const key =
        failure instanceof Error && failure.message === "PROFILES_UNAVAILABLE"
          ? "profilesFailed"
          : code === "STORAGE_QUOTA_EXCEEDED"
            ? "quotaExceeded"
            : code === "STORAGE_POOL_CAPACITY_EXCEEDED"
              ? "poolFull"
              : code === "DRIVE_NOT_CONNECTED"
                ? "driveNotConnected"
                : code === "MATERIAL_STORAGE_UNAVAILABLE" ||
                    code === "STORAGE_SCHEMA_NOT_READY"
                  ? "unavailable"
                  : "failed";
      setError(label(key));
    } finally {
      lock.current = false;
      setPreparing(false);
    }
  }

  if (
    !workspace ||
    !role ||
    !["OWNER", "MANAGER", "CREATOR", "CLIENT"].includes(role)
  )
    return null;
  return (
    <div className="min-w-0 space-y-2">
      <input
        ref={input}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-label={label("file")}
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (selected) void upload(selected);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="orange"
          size="sm"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          <Upload className="size-4" />
          {t("library.media.uploadButton")}
        </Button>
        {busy && (
          <Button
            variant="ghost"
            size="sm"
            disabled={preparing && !uploader.busy}
            onClick={() => uploader.cancel()}
          >
            {label("cancelUpload")}
          </Button>
        )}
      </div>
      {busy && (
        <div
          role="status"
          className="text-muted-foreground max-w-sm space-y-1 text-xs"
        >
          <p className="truncate" title={file?.name}>
            {file?.name}
          </p>
          <p>
            {uploader.stage === "uploading"
              ? t("library.repositoryUpload.progress", {
                  percent: uploader.progress,
                })
              : label("validating")}
          </p>
          <progress
            className="h-1.5 w-full"
            value={uploader.progress}
            max={100}
            aria-label={label("progressLabel")}
          />
        </div>
      )}
      {chooseProfile && file && (
        <div className="flex flex-wrap gap-2">
          <Select
            aria-label={label("profile")}
            wrapperClassName="max-w-xs"
            value={profile}
            onChange={(event) => setProfile(event.target.value)}
          >
            <option value="">{label("chooseProfile")}</option>
            {profiles.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            disabled={!profile || busy}
            onClick={() => void upload(file, profile)}
          >
            {label("submit")}
          </Button>
        </div>
      )}
      {error && (
        <div className="max-w-md space-y-1">
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
          {file && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void upload(file, profile || undefined)}
            >
              {label("retry")}
            </Button>
          )}
        </div>
      )}
      <DuplicateResolutionModal
        conflict={uploader.conflict}
        onChoose={uploader.resolveConflict}
      />
    </div>
  );
}
