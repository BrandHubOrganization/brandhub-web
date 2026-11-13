import { useTranslation } from "react-i18next";
import { ChevronDown, FileText, FolderKanban, Hash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
          className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors"
        >
          <ActiveIcon className="text-brand-orange size-3.5" />
          <span>{getActiveLabel()}</span>
          <ChevronDown className="size-3.5 opacity-70 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-border/80 bg-popover z-[120] w-64 rounded-2xl border p-1.5 shadow-2xl"
      >
        <DropdownMenuItem
          onSelect={() => onTabChange("media")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
            activeTab === "media"
              ? "bg-[#fff0eb] text-[#ca3d0e] dark:bg-brand-orange/20 dark:text-brand-orange font-semibold shadow-xs"
              : "hover:bg-muted/80 text-foreground",
          )}
        >
          <div className="flex items-center gap-2.5">
            <FolderKanban
              className={cn(
                "size-4 shrink-0",
                activeTab === "media" ? "text-brand-orange" : "text-muted-foreground",
              )}
            />
            <div className="flex flex-col">
              <span className="font-semibold">
                {t("library.page.mediaTab", "Tệp & Thư mục")}
              </span>
              <span className="text-muted-foreground text-[11px] font-normal">
                Hình ảnh, video & tài liệu
              </span>
            </div>
          </div>
          {counts && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                activeTab === "media"
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {counts.media}
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/60 -mx-1 my-1" />

        <DropdownMenuItem
          onSelect={() => onTabChange("templates")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
            activeTab === "templates"
              ? "bg-[#fff0eb] text-[#ca3d0e] dark:bg-brand-orange/20 dark:text-brand-orange font-semibold shadow-xs"
              : "hover:bg-muted/80 text-foreground",
          )}
        >
          <div className="flex items-center gap-2.5">
            <FileText
              className={cn(
                "size-4 shrink-0",
                activeTab === "templates" ? "text-brand-orange" : "text-muted-foreground",
              )}
            />
            <div className="flex flex-col">
              <span className="font-semibold">
                {t("library.page.templatesTab", "Mẫu bài đăng")}
              </span>
              <span className="text-muted-foreground text-[11px] font-normal">
                Khung nội dung tái sử dụng
              </span>
            </div>
          </div>
          {counts && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                activeTab === "templates"
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {counts.templates}
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => onTabChange("hashtags")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
            activeTab === "hashtags"
              ? "bg-[#fff0eb] text-[#ca3d0e] dark:bg-brand-orange/20 dark:text-brand-orange font-semibold shadow-xs"
              : "hover:bg-muted/80 text-foreground",
          )}
        >
          <div className="flex items-center gap-2.5">
            <Hash
              className={cn(
                "size-4 shrink-0",
                activeTab === "hashtags" ? "text-brand-orange" : "text-muted-foreground",
              )}
            />
            <div className="flex flex-col">
              <span className="font-semibold">
                {t("library.page.hashtagsTab", "Hashtag Xu Hướng")}
              </span>
              <span className="text-muted-foreground text-[11px] font-normal">
                Từ khóa thịnh hành theo phân tích trend
              </span>
            </div>
          </div>
          {counts && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                activeTab === "hashtags"
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {counts.hashtags}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
