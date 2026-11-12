import { useTranslation } from "react-i18next";
import {
  ArrowUpDown,
  FileText,
  Film,
  FolderSync,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MediaUploadButton } from "./MediaUploadButton";
import type { MaterialMediaKind, MaterialSort } from "@/types/material";

export type RepositoryViewMode = "grid" | "list";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  mediaKind?: MaterialMediaKind;
  onMediaKindChange: (value?: MaterialMediaKind) => void;
  sort: MaterialSort;
  onSortChange: (value: MaterialSort) => void;
  trashMode: boolean;
  onTrashModeChange: (value: boolean) => void;
  draftMode: boolean;
  onDraftModeChange: (value: boolean) => void;
  folderId?: string | null;
  tab: "WORKSPACE" | "CLIENT_VAULT";
  onTabChange: (value: "WORKSPACE" | "CLIENT_VAULT") => void;
  isClient: boolean;
  onShareVault: () => void;
  onUploaded: () => void;
  viewMode?: RepositoryViewMode;
  onViewModeChange?: (mode: RepositoryViewMode) => void;
}

export function MaterialToolbar(props: Props) {
  const { t } = useTranslation();
  const viewMode = props.viewMode ?? "grid";

  const categories: Array<{
    id: string;
    label: string;
    icon: typeof ImageIcon;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      id: "ALL",
      label: t("library.repository.kinds.all", "Tất cả"),
      icon: LayoutGrid,
      isActive:
        !props.trashMode && !props.draftMode && props.mediaKind === undefined,
      onClick: () => {
        props.onTrashModeChange(false);
        props.onDraftModeChange(false);
        props.onMediaKindChange(undefined);
      },
    },
    {
      id: "IMAGE",
      label: t("library.repository.kinds.image", "Hình ảnh"),
      icon: ImageIcon,
      isActive:
        !props.trashMode && !props.draftMode && props.mediaKind === "IMAGE",
      onClick: () => {
        props.onTrashModeChange(false);
        props.onDraftModeChange(false);
        props.onMediaKindChange("IMAGE");
      },
    },
    {
      id: "VIDEO",
      label: t("library.repository.kinds.video", "Video"),
      icon: Film,
      isActive:
        !props.trashMode && !props.draftMode && props.mediaKind === "VIDEO",
      onClick: () => {
        props.onTrashModeChange(false);
        props.onDraftModeChange(false);
        props.onMediaKindChange("VIDEO");
      },
    },
    {
      id: "FILE",
      label: t("library.repository.kinds.document", "Tài liệu"),
      icon: FileText,
      isActive:
        !props.trashMode && !props.draftMode && props.mediaKind === "FILE",
      onClick: () => {
        props.onTrashModeChange(false);
        props.onDraftModeChange(false);
        props.onMediaKindChange("FILE");
      },
    },
  ];

  return (
    <div className="space-y-3 rounded-none border border-[#d5dbdb] bg-card p-3.5 shadow-[0_1px_1px_0_rgba(0,28,36,0.05)] dark:border-border">
      {/* Row 1: Scope Switcher + Search + Primary Upload / Share Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {!props.isClient && (
            <div className="inline-flex h-9 items-center rounded-[4px] border border-[#d5dbdb] bg-muted/40 p-0.5 dark:border-border">
              {(["WORKSPACE", "CLIENT_VAULT"] as const).map((item) => {
                const active = props.tab === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => props.onTabChange(item)}
                    className={`rounded-[3px] px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-background text-brand-orange font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item === "WORKSPACE" ? "Kho Workspace" : "Kho Khách hàng"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search input */}
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={props.search}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder={t(
                "library.repository.searchPlaceholder",
                "Tìm kiếm tệp, hình ảnh, video trong kho...",
              )}
              className="h-9 rounded-[4px] pl-9 pr-8 text-xs"
            />
            {props.search && (
              <button
                type="button"
                onClick={() => props.onSearchChange("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[3px] p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Client Share from Vault + Upload File/Folder */}
        <div className="flex flex-wrap items-center gap-2">
          {props.isClient && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={props.onShareVault}
              className="h-9 gap-1.5 rounded-[4px] border-brand-orange/40 bg-brand-orange/5 text-xs font-semibold text-brand-orange hover:bg-brand-orange hover:text-white"
            >
              <FolderSync className="h-3.5 w-3.5" />
              <span>Import từ Kho cá nhân / Workspace khác</span>
            </Button>
          )}
          <MediaUploadButton
            folderId={props.folderId}
            onUploaded={props.onUploaded}
          />
        </div>
      </div>

      {/* Row 2: Category Filter Chips + AI Drafts / Trash + Sort & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eaeded] pt-2.5 dark:border-border/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={cat.onClick}
                className={`inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat.isActive
                    ? "border-brand-orange bg-brand-orange text-white font-semibold"
                    : "border-[#d5dbdb] bg-background text-foreground hover:bg-muted/60 dark:border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}

          <div className="mx-1 h-4 w-px bg-border" />

          {!props.isClient && (
            <button
              type="button"
              onClick={() => {
                const next = !props.draftMode;
                props.onDraftModeChange(next);
                if (next) props.onTrashModeChange(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                props.draftMode
                  ? "border-brand-orange bg-brand-orange text-white font-semibold"
                  : "border-[#d5dbdb] bg-background text-foreground hover:bg-muted/60 dark:border-border"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("library.repository.draftsToggle", "Bản nháp AI")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !props.trashMode;
              props.onTrashModeChange(next);
              if (next) props.onDraftModeChange(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              props.trashMode
                ? "border-destructive bg-destructive text-white font-semibold"
                : "border-[#d5dbdb] bg-background text-foreground hover:bg-muted/60 dark:border-border"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t("library.repository.trashToggle", "Thùng rác")}</span>
          </button>
        </div>

        {/* Right: Sort & Grid/List View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 z-10 h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={props.sort}
              onChange={(e) =>
                props.onSortChange(e.target.value as MaterialSort)
              }
              wrapperClassName="w-36"
              className="h-8 rounded-[4px] pl-8 text-xs font-medium"
            >
              <option value="newest">
                {t("library.repository.sort.newest", "Mới nhất")}
              </option>
              <option value="oldest">
                {t("library.repository.sort.oldest", "Cũ nhất")}
              </option>
              <option value="name_asc">
                {t("library.repository.sort.nameAsc", "Tên A → Z")}
              </option>
              <option value="name_desc">
                {t("library.repository.sort.nameDesc", "Tên Z → A")}
              </option>
            </Select>
          </div>

          {props.onViewModeChange && (
            <div className="inline-flex h-8 items-center rounded-[4px] border border-[#d5dbdb] bg-muted/40 p-0.5 dark:border-border">
              <button
                type="button"
                onClick={() => props.onViewModeChange?.("grid")}
                className={`rounded-[3px] p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-brand-orange shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ lưới (Grid)"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => props.onViewModeChange?.("list")}
                className={`rounded-[3px] p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-background text-brand-orange shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ danh sách (List)"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
