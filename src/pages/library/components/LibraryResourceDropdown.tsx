import { useTranslation } from "react-i18next";
import { Check, ChevronDown, FileText, FolderKanban, Hash } from "lucide-react";
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
          className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors"
        >
          <ActiveIcon className="text-brand-orange size-3.5" />
          <span>{getActiveLabel()}</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-border/80 bg-card w-64 rounded-xl border p-1 shadow-lg"
      >
        <DropdownMenuItem
          onSelect={() => onTabChange("media")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex flex-col">
            <span className="text-foreground font-semibold">
              {t("library.page.mediaTab", "Tệp & Thư mục")}
            </span>
            <span className="text-muted-foreground text-[11px]">
              Hình ảnh, video & tài liệu
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="bg-brand-orange/10 text-brand-orange rounded-md px-1.5 py-0.5 text-[11px] font-bold">
                {counts.media}
              </span>
            )}
            {activeTab === "media" && (
              <Check className="text-brand-orange size-3.5" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => onTabChange("templates")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex flex-col">
            <span className="text-foreground font-semibold">
              {t("library.page.templatesTab", "Mẫu bài đăng")}
            </span>
            <span className="text-muted-foreground text-[11px]">
              Khung nội dung tái sử dụng
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-bold">
                {counts.templates}
              </span>
            )}
            {activeTab === "templates" && (
              <Check className="text-brand-orange size-3.5" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => onTabChange("hashtags")}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
        >
          <div className="flex flex-col">
            <span className="text-foreground font-semibold">
              {t("library.page.hashtagsTab", "Hashtag Xu Hướng")}
            </span>
            <span className="text-muted-foreground text-[11px]">
              Từ khóa thịnh hành theo phân tích trend
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {counts && (
              <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-bold">
                {counts.hashtags}
              </span>
            )}
            {activeTab === "hashtags" && (
              <Check className="text-brand-orange size-3.5" />
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
