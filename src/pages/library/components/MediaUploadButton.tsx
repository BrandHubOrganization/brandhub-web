import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ChevronDown,
  FolderUp,
  Upload,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const startUploadBatch = useBackgroundTaskStore(
    (state) => state.startUploadBatch,
  );

  const profilesQuery = useMaterialUploadProfiles(
    workspace?.id ?? "",
    isClient,
    true,
  );
  const availableProfiles = profilesQuery.data ?? [];
  const clientProfileId =
    workspace?.clientProfileId ?? availableProfiles[0]?.id;

  // Internal and client both have access to uploaded files in workspace repository
  const effectiveVisibility: MaterialVisibility = clientProfileId
    ? "CLIENT"
    : "INTERNAL";

  const handleFilesSelected = async (
    fileList: FileList | null,
    isFolderSelection = false,
  ) => {
    if (!fileList || fileList.length === 0 || !workspace?.id) return;

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

      {/* "+ Tải lên" menu button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            disabled={!workspace?.id}
            className="h-9 gap-1.5 rounded-lg bg-brand-orange px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-orange/90"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t("library.repository.upload.button", "Tải lên")}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl">
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
