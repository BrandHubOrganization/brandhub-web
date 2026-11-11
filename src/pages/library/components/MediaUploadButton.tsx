import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ChevronDown,
  FolderUp,
  Globe,
  Lock,
  Upload,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import { extractFromFileList } from "@/pages/library/utils/folderDropReader";
import type { MaterialVisibility } from "@/types/material";

const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/webp,video/mp4,video/quicktime,application/pdf";

export function MediaUploadButton({
  folderId,
  onUploaded,
}: {
  folderId?: string | null;
  onUploaded: () => void;
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const workspace = useWorkspaceStore((state) => state.currentWorkspace);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const isClient = role === "CLIENT";
  const canShareWithClient = role === "OWNER" || role === "MANAGER";

  const [visibility, setVisibility] = useState<MaterialVisibility>("INTERNAL");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const startUploadBatch = useBackgroundTaskStore(
    (state) => state.startUploadBatch,
  );

  const effectiveVisibility: MaterialVisibility = isClient
    ? "CLIENT"
    : canShareWithClient
      ? visibility
      : "INTERNAL";

  const profilesQuery = useMaterialUploadProfiles(
    workspace?.id ?? "",
    isClient,
    effectiveVisibility === "CLIENT",
  );
  const availableProfiles = profilesQuery.data ?? [];
  const clientProfileId =
    workspace?.clientProfileId ??
    (selectedProfileId &&
    availableProfiles.some((p) => p.id === selectedProfileId)
      ? selectedProfileId
      : availableProfiles[0]?.id);

  const requiresMissingClientProfile =
    effectiveVisibility === "CLIENT" &&
    !profilesQuery.isLoading &&
    !clientProfileId;

  const handleFilesSelected = async (
    fileList: FileList | null,
    isFolderSelection = false,
  ) => {
    if (!fileList || fileList.length === 0 || !workspace?.id) return;
    if (requiresMissingClientProfile) {
      toast.error(
        t(
          "library.repository.upload.missingClientProfile",
          "Workspace này chưa gắn hồ sơ khách hàng để tải tệp riêng cho Client.",
        ),
      );
      return;
    }

    const extracted = extractFromFileList(fileList);
    if (extracted.skippedCount > 0) {
      toast.warning(
        `Đã bỏ qua ${extracted.skippedCount} tệp không hợp lệ (${extracted.skippedReasons.join(", ")})`,
      );
    }

    if (extracted.validFiles.length === 0) {
      toast.error("Không tìm thấy tệp hợp lệ (PNG, JPG, WEBP, MP4, MOV, PDF ≤ 1 GiB)");
      return;
    }

    void startUploadBatch({
      workspaceId: workspace.id,
      files: extracted.validFiles,
      baseFolderId: folderId ?? undefined,
      visibility: effectiveVisibility,
      clientProfileId:
        effectiveVisibility === "CLIENT" ? clientProfileId : undefined,
      isClientRole: isClient,
      rootFolderName: isFolderSelection ? extracted.rootFolderName : undefined,
    }).then(() => {
      onUploaded();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => {
          void handleFilesSelected(event.target.files, false);
          event.target.value = "";
        }}
      />

      {/* Device Folder input (webkitdirectory) */}
      <input
        ref={(el) => {
          folderInputRef.current = el;
          if (el) {
            el.setAttribute("webkitdirectory", "");
            el.setAttribute("directory", "");
          }
        }}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFilesSelected(event.target.files, true);
          event.target.value = "";
        }}
      />

      {/* Visibility Selector for Agency Owner/Manager */}
      {canShareWithClient && (
        <div
          className="inline-flex h-9 items-center rounded-xl border border-border/80 bg-muted/50 p-0.5 text-xs"
          title="Phạm vi hiển thị khi tải lên"
        >
          <button
            type="button"
            onClick={() => setVisibility("INTERNAL")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              visibility === "INTERNAL"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>Nội bộ</span>
          </button>
          <button
            type="button"
            onClick={() => setVisibility("CLIENT")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              visibility === "CLIENT"
                ? "bg-brand-orange text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>Chia sẻ Client</span>
          </button>
        </div>
      )}

      {canShareWithClient &&
        visibility === "CLIENT" &&
        availableProfiles.length > 1 && (
          <Select
            aria-label="Chọn Client nhận chia sẻ"
            value={clientProfileId ?? ""}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="h-9 w-44 rounded-xl bg-background text-xs font-medium"
          >
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </Select>
        )}

      {/* Google Drive style "+ Tải lên" menu button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            disabled={
              !workspace?.id ||
              (effectiveVisibility === "CLIENT" && profilesQuery.isLoading) ||
              requiresMissingClientProfile
            }
            className="h-9 gap-1.5 rounded-xl bg-brand-orange px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-orange/90"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t("library.repository.upload.button", "Tải lên")}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
          <DropdownMenuItem
            onSelect={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium"
          >
            <UploadCloud className="h-4 w-4 text-brand-orange" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Tải tệp lên</span>
              <span className="text-[11px] text-muted-foreground">
                Chọn một hoặc nhiều tệp từ thiết bị
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => folderInputRef.current?.click()}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium"
          >
            <FolderUp className="h-4 w-4 text-brand-orange" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                Tải thư mục lên
              </span>
              <span className="text-[11px] text-muted-foreground">
                Giữ nguyên cấu trúc thư mục từ máy
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
