import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Film,
  Folder,
  FolderSync,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  Search,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";
import {
  LibraryResourceDropdown,
  type LibraryResourceTab,
} from "./LibraryResourceDropdown";
import { MediaUploadButton } from "./MediaUploadButton";
import type { MaterialMediaKind, MaterialSort } from "@/types/material";

export type RepositoryViewMode = "grid" | "list";

export type PeopleFilter = string;
export type ModifiedFilter =
  | "ANY"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_YEAR";

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
  peopleFilter?: string;
  onPeopleFilterChange?: (value: string) => void;
  members?: WorkspaceMember[];
  currentUserId?: string | null;
  modifiedFilter?: ModifiedFilter;
  onModifiedFilterChange?: (value: ModifiedFilter) => void;
  folderId?: string | null;
  tab?: "WORKSPACE" | "CLIENT_VAULT";
  onTabChange?: (value: "WORKSPACE" | "CLIENT_VAULT") => void;
  isClient: boolean;
  onShareVault: () => void;
  onUploaded: () => void;
  driveAction?: React.ReactNode;
  viewMode?: RepositoryViewMode;
  onViewModeChange?: (mode: RepositoryViewMode) => void;
  resourceTab?: LibraryResourceTab;
  onResourceTabChange?: (tab: LibraryResourceTab) => void;
  resourceCounts?: {
    media: number;
    templates: number;
    hashtags: number;
  };
}

export function MaterialToolbar(props: Props) {
  const { t } = useTranslation();
  const viewMode = props.viewMode ?? "grid";
  const peopleFilter = props.peopleFilter ?? "ANY";
  const modifiedFilter = props.modifiedFilter ?? "ANY";

  const hasActiveFilters =
    props.mediaKind !== undefined ||
    peopleFilter !== "ANY" ||
    modifiedFilter !== "ANY" ||
    props.trashMode ||
    props.draftMode;

  const handleResetFilters = () => {
    props.onMediaKindChange(undefined);
    props.onPeopleFilterChange?.("ANY");
    props.onModifiedFilterChange?.("ANY");
    props.onTrashModeChange(false);
    props.onDraftModeChange(false);
  };

  const formatMemberRole = (role: MemberRole) => {
    switch (role) {
      case "OWNER":
        return t("workspace.roles.OWNER", "Chủ sở hữu");
      case "MANAGER":
        return t("workspace.roles.MANAGER", "Quản lý");
      case "CREATOR":
        return t("workspace.roles.CREATOR", "Creator");
      case "CLIENT":
        return t("workspace.roles.CLIENT", "Khách hàng");
      default:
        return role;
    }
  };

  const sortedMembers = useMemo(() => {
    if (!props.members || props.members.length === 0) return [];
    const list = [...props.members];
    return list.sort((a, b) => {
      const aIsMe = Boolean(
        props.currentUserId &&
          (a.userId === props.currentUserId || a.id === props.currentUserId),
      );
      const bIsMe = Boolean(
        props.currentUserId &&
          (b.userId === props.currentUserId || b.id === props.currentUserId),
      );
      if (aIsMe) return -1;
      if (bIsMe) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [props.members, props.currentUserId]);

  const getMediaKindLabel = () => {
    switch (props.mediaKind) {
      case "IMAGE":
        return t("library.repository.kinds.image", "Loại: Hình ảnh");
      case "VIDEO":
        return t("library.repository.kinds.video", "Loại: Video");
      case "FILE":
        return t("library.repository.kinds.document", "Loại: Tài liệu");
      default:
        return t("library.repository.filters.type", "Loại");
    }
  };

  const getPeopleLabel = () => {
    if (!peopleFilter || peopleFilter === "ANY") {
      return t("library.repository.filters.people", "Người");
    }
    const isMeSelected =
      peopleFilter === "ME" ||
      (props.currentUserId && peopleFilter === props.currentUserId);
    if (isMeSelected) {
      return "Người: Me";
    }
    const found = props.members?.find(
      (m) => m.userId === peopleFilter || m.id === peopleFilter,
    );
    if (found) {
      const name = found.fullName || found.email || "Thành viên";
      return `Người: ${name}`;
    }
    return t("library.repository.filters.people", "Người");
  };

  const getModifiedLabel = () => {
    switch (modifiedFilter) {
      case "TODAY":
        return t("library.repository.filters.modToday", "Sửa đổi: Hôm nay");
      case "LAST_7_DAYS":
        return t("library.repository.filters.mod7Days", "Sửa đổi: 7 ngày qua");
      case "LAST_30_DAYS":
        return t("library.repository.filters.mod30Days", "Sửa đổi: 30 ngày qua");
      case "THIS_YEAR":
        return t("library.repository.filters.modThisYear", "Sửa đổi: Năm nay");
      default:
        return t("library.repository.filters.lastModified", "Lần sửa đổi gần đây nhất");
    }
  };

  const getSourceLabel = () => {
    if (props.trashMode) {
      return t("library.repository.filters.sourceTrash", "Nguồn: Thùng rác");
    }
    if (props.draftMode) {
      return t("library.repository.filters.sourceDraft", "Nguồn: Bản nháp AI");
    }
    return t("library.repository.filters.source", "Nguồn");
  };

  const sortOptions: SelectMenuOption[] = [
    {
      value: "newest",
      label: t("library.repository.sort.newest", "Mới nhất"),
      icon: <ArrowUpDown className="size-3.5" />,
    },
    {
      value: "oldest",
      label: t("library.repository.sort.oldest", "Cũ nhất"),
      icon: <ArrowUpDown className="size-3.5" />,
    },
    {
      value: "name_asc",
      label: t("library.repository.sort.nameAsc", "Tên A → Z"),
      icon: <ArrowUpDown className="size-3.5" />,
    },
    {
      value: "name_desc",
      label: t("library.repository.sort.nameDesc", "Tên Z → A"),
      icon: <ArrowUpDown className="size-3.5" />,
    },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-none">
      {/* Row 1: Search + Primary Upload / Share Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search input */}
          <div className="relative min-w-[220px] max-w-lg flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={props.search}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder={t(
                "library.repository.searchPlaceholder",
                "Tìm kiếm tệp, hình ảnh, video trong kho...",
              )}
              className="h-9 rounded-lg border border-border/60 bg-muted/20 pl-9 pr-8 text-xs shadow-none transition-colors hover:border-border/90 hover:bg-muted/30 focus-visible:border-brand-orange/60 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-brand-orange/25"
            />
            {props.search && (
              <button
                type="button"
                onClick={() => props.onSearchChange("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
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
              className="h-9 gap-1.5 rounded-lg border-brand-orange/40 bg-brand-orange/5 text-xs font-semibold text-brand-orange hover:bg-brand-orange hover:text-white"
            >
              <FolderSync className="h-3.5 w-3.5" />
              <span>Import từ Kho cá nhân / Workspace khác</span>
            </Button>
          )}
          {props.driveAction}
          <MediaUploadButton
            folderId={props.folderId}
            onUploaded={props.onUploaded}
          />
        </div>
      </div>

      {/* Row 2: Google Drive Filter Dropdowns (Tài nguyên, Loại, Người, Lần sửa đổi gần đây nhất, Nguồn) + Sort & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 0. Tài nguyên (Tệp & Thư mục, Mẫu bài đăng, Nhóm Hashtag) ▾ */}
          {props.onResourceTabChange && (
            <LibraryResourceDropdown
              activeTab={props.resourceTab ?? "media"}
              onTabChange={props.onResourceTabChange}
              counts={props.resourceCounts}
            />
          )}

          {/* 1. Loại ▾ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  props.mediaKind !== undefined
                    ? "border-brand-orange/50 bg-brand-orange/10 font-semibold text-brand-orange shadow-2xs"
                    : "border-border/90 bg-background text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{getMediaKindLabel()}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-xl border border-border/80 bg-card p-1 shadow-lg">
              <DropdownMenuItem
                onSelect={() => props.onMediaKindChange(undefined)}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="size-3.5 text-muted-foreground" />
                  <span>{t("library.repository.kinds.all", "Tất cả")}</span>
                </div>
                {props.mediaKind === undefined && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => props.onMediaKindChange("IMAGE")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-3.5 text-blue-500" />
                  <span>{t("library.repository.kinds.image", "Hình ảnh")}</span>
                </div>
                {props.mediaKind === "IMAGE" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => props.onMediaKindChange("VIDEO")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Film className="size-3.5 text-purple-500" />
                  <span>{t("library.repository.kinds.video", "Video")}</span>
                </div>
                {props.mediaKind === "VIDEO" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => props.onMediaKindChange("FILE")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-emerald-500" />
                  <span>{t("library.repository.kinds.document", "Tài liệu")}</span>
                </div>
                {props.mediaKind === "FILE" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Người ▾ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  peopleFilter !== "ANY"
                    ? "border-brand-orange/50 bg-brand-orange/10 font-semibold text-brand-orange shadow-2xs"
                    : "border-border/90 bg-background text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{getPeopleLabel()}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-card p-1 shadow-lg">
              <DropdownMenuItem
                onSelect={() => props.onPeopleFilterChange?.("ANY")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>{t("library.repository.filters.peopleAny", "Bất kỳ ai")}</span>
                </div>
                {(peopleFilter === "ANY" || !peopleFilter) && (
                  <Check className="size-3.5 text-brand-orange" />
                )}
              </DropdownMenuItem>

              {sortedMembers.length > 0 && <DropdownMenuSeparator />}

              {sortedMembers.map((member) => {
                const isMe = Boolean(
                  props.currentUserId &&
                    (member.userId === props.currentUserId ||
                      member.id === props.currentUserId),
                );
                const roleLabel = formatMemberRole(member.role);
                const memberValue = member.userId || member.id;
                const isSelected =
                  peopleFilter === memberValue ||
                  (isMe && (peopleFilter === "ME" || peopleFilter === props.currentUserId));

                return (
                  <DropdownMenuItem
                    key={member.id}
                    onSelect={() => props.onPeopleFilterChange?.(memberValue)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <User
                        className={cn(
                          "size-3.5 shrink-0",
                          isMe ? "text-brand-orange" : "text-muted-foreground",
                        )}
                      />
                      <div className="flex min-w-0 items-center gap-1.5 truncate">
                        <span
                          className={cn(
                            "truncate font-medium",
                            isMe && "font-bold text-brand-orange",
                          )}
                        >
                          {isMe ? "Me" : (member.fullName || member.email || "Thành viên")}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          - {roleLabel}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-brand-orange" />
                    )}
                  </DropdownMenuItem>
                );
              })}

              {sortedMembers.length === 0 && props.currentUserId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => props.onPeopleFilterChange?.("ME")}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-brand-orange" />
                      <span className="font-bold text-brand-orange">Me</span>
                    </div>
                    {(peopleFilter === "ME" || peopleFilter === props.currentUserId) && (
                      <Check className="size-3.5 text-brand-orange" />
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Lần sửa đổi gần đây nhất ▾ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  modifiedFilter !== "ANY"
                    ? "border-brand-orange/50 bg-brand-orange/10 font-semibold text-brand-orange shadow-2xs"
                    : "border-border/90 bg-background text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{getModifiedLabel()}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-xl border border-border/80 bg-card p-1 shadow-lg">
              <DropdownMenuItem
                onSelect={() => props.onModifiedFilterChange?.("ANY")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>{t("library.repository.filters.modAny", "Bất kỳ lúc nào")}</span>
                </div>
                {modifiedFilter === "ANY" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => props.onModifiedFilterChange?.("TODAY")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-brand-orange" />
                  <span>{t("library.repository.filters.modTodayLabel", "Hôm nay")}</span>
                </div>
                {modifiedFilter === "TODAY" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => props.onModifiedFilterChange?.("LAST_7_DAYS")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-blue-500" />
                  <span>{t("library.repository.filters.mod7DaysLabel", "7 ngày qua")}</span>
                </div>
                {modifiedFilter === "LAST_7_DAYS" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => props.onModifiedFilterChange?.("LAST_30_DAYS")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-indigo-500" />
                  <span>{t("library.repository.filters.mod30DaysLabel", "30 ngày qua")}</span>
                </div>
                {modifiedFilter === "LAST_30_DAYS" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => props.onModifiedFilterChange?.("THIS_YEAR")}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-amber-500" />
                  <span>{t("library.repository.filters.modThisYearLabel", "Năm nay")}</span>
                </div>
                {modifiedFilter === "THIS_YEAR" && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 4. Nguồn ▾ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  props.trashMode || props.draftMode
                    ? "border-brand-orange/50 bg-brand-orange/10 font-semibold text-brand-orange shadow-2xs"
                    : "border-border/90 bg-background text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{getSourceLabel()}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-xl border border-border/80 bg-card p-1 shadow-lg">
              <DropdownMenuItem
                onSelect={() => {
                  props.onTrashModeChange(false);
                  props.onDraftModeChange(false);
                }}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Folder className="size-3.5 text-muted-foreground" />
                  <span>{t("library.repository.filters.sourceMain", "Kho lưu trữ chính")}</span>
                </div>
                {!props.trashMode && !props.draftMode && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  props.onTrashModeChange(false);
                  props.onDraftModeChange(true);
                }}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>{t("library.repository.draftsToggle", "Bản nháp AI")}</span>
                </div>
                {props.draftMode && <Check className="size-3.5 text-brand-orange" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  props.onDraftModeChange(false);
                  props.onTrashModeChange(true);
                }}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="size-3.5 text-destructive" />
                  <span>{t("library.repository.trashToggle", "Thùng rác")}</span>
                </div>
                {props.trashMode && <Check className="size-3.5 text-destructive" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Filters button if any is active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Đặt lại tất cả bộ lọc"
            >
              <X className="size-3.5" />
              <span>{t("library.repository.filters.clear", "Xóa lọc")}</span>
            </button>
          )}
        </div>

        {/* Right: Sort & Grid/List View Toggle */}
        <div className="flex items-center gap-2">
          <SelectMenu
            value={props.sort}
            onChange={(val) => props.onSortChange(val as MaterialSort)}
            options={sortOptions}
            ariaLabel={t("library.repository.sortLabel", "Sắp xếp theo")}
            className="h-8 min-w-36 rounded-lg text-xs font-medium"
          />

          {props.onViewModeChange && (
            <div className="inline-flex h-8 items-center rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => props.onViewModeChange?.("grid")}
                className={`rounded-md p-1.5 transition-colors ${
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
                className={`rounded-md p-1.5 transition-colors ${
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
