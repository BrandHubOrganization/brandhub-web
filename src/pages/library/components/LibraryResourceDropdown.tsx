import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  FileText,
  FolderKanban,
  Hash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LibraryResourceTab = "media" | "templates" | "hashtags";

export interface LibraryResourceDropdownProps {
  activeTab: LibraryResourceTab;
  onTabChange: (tab: LibraryResourceTab) => void;
  counts?: {
    media: number;
    templates: number;
    hashtags: number;
  };
  prefixLabel?: string;
}

export function LibraryResourceDropdown({
  activeTab,
  onTabChange,
  counts,
  prefixLabel = "Tài nguyên",
}: LibraryResourceDropdownProps) {
  const { t } = useTranslation();

  const getActiveLabel = () => {
    switch (activeTab) {
      case "templates":
        return `${prefixLabel}: ${t("library.page.templatesTab", "Mẫu bài đăng")}`;
      case "hashtags":
        return `${prefixLabel}: ${t("library.page.hashtagsTab", "Hashtag Xu Hướng")}`;
      default:
        return `${prefixLabel}: ${t("library.page.mediaTab", "Tệp & Thư mục")}`;
    }
  };

  const getActiveIcon = () => {
    switch (activeTab) {
      case "templates":
        return FileText;
      case "hashtags":
        return Hash;
      default:
        return FolderKanban;
    }
  };

  const ActiveIcon = getActiveIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-orange/10 px-3 text-xs font-semibold text-brand-orange transition-colors hover:bg-brand-orange/15"
        >
          <ActiveIcon className="size-3.5 text-brand-orange" />
          <span>{getActiveLabel()}</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-xl border border-border/80 bg-card p-1 shadow-lg"
      >
        <DropdownMenuItem
          onSelect={() => onTabChange("media")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange">
              <FolderKanban className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {t("library.page.mediaTab", "Tệp & Thư mục")}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Hình ảnh, video & tài liệu
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="rounded-md bg-brand-orange/10 px-1.5 py-0.5 text-[11px] font-bold text-brand-orange">
                {counts.media}
              </span>
            )}
            {activeTab === "media" && (
              <Check className="size-3.5 text-brand-orange" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => onTabChange("templates")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
              <FileText className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {t("library.page.templatesTab", "Mẫu bài đăng")}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Khung nội dung tái sử dụng
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {counts.templates}
              </span>
            )}
            {activeTab === "templates" && (
              <Check className="size-3.5 text-brand-orange" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => onTabChange("hashtags")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500">
              <Hash className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {t("library.page.hashtagsTab", "Hashtag Xu Hướng")}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Từ khóa thịnh hành theo phân tích trend
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {counts.hashtags}
              </span>
            )}
            {activeTab === "hashtags" && (
              <Check className="size-3.5 text-brand-orange" />
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
