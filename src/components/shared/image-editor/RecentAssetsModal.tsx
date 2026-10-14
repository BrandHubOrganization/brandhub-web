import React, { useEffect, useState } from "react";
import { History, Trash2, Check, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getRecentAssets,
  removeRecentAsset,
  clearRecentAssets,
  type AssetCategory,
} from "@/utils/recentAssetsStorage";
import { cn } from "@/lib/utils";

export interface RecentAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: AssetCategory;
  currentUrl?: string | null;
  onSelect: (url: string) => void;
}

export function RecentAssetsModal({
  isOpen,
  onClose,
  category,
  currentUrl,
  onSelect,
}: RecentAssetsModalProps) {
  const [assets, setAssets] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAssets(getRecentAssets(category));
    }
  }, [isOpen, category]);

  const isLogo = category === "logo";
  const title = isLogo
    ? "Ảnh đại diện / Logo đã dùng gần đây"
    : "Ảnh bìa / Banner đã dùng gần đây";

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleRemove = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    removeRecentAsset(category, url);
    setAssets((prev) => prev.filter((item) => item !== url));
  };

  const handleClearAll = () => {
    clearRecentAssets(category);
    setAssets([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card/60 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <History className="size-4.5 text-brand-orange" />
            {title}
          </DialogTitle>
          {assets.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive text-xs h-7 px-2 cursor-pointer gap-1"
            >
              <Trash2 className="size-3.5" />
              Xóa lịch sử
            </Button>
          )}
        </DialogHeader>

        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center border border-dashed border-border rounded-xl bg-card/40">
              <ImageIcon className="size-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Chưa có ảnh nào trong lịch sử
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Khi bạn tải lên hoặc chọn ảnh mới, các ảnh sẽ tự động được lưu lại
                  tại đây để bạn dễ dàng tái sử dụng khi cần.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-3.5",
                isLogo
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2",
              )}
            >
              {assets.map((url, idx) => {
                const isSelected = currentUrl === url;
                return (
                  <div
                    key={`${url}-${idx}`}
                    onClick={() => handleSelect(url)}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 bg-card hover:shadow-md",
                      isSelected
                        ? "border-brand-orange ring-2 ring-brand-orange/20"
                        : "border-border hover:border-brand-orange/60",
                    )}
                  >
                    <div
                      className={cn(
                        "relative w-full overflow-hidden bg-muted/40 flex items-center justify-center",
                        isLogo ? "aspect-square" : "aspect-3/1",
                      )}
                    >
                      <img
                        src={url}
                        alt="Recent asset"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Selected check badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 size-6 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md">
                          <Check className="size-3.5 font-bold" />
                        </div>
                      )}

                      {/* Hover delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, url)}
                        className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md"
                        title="Xóa khỏi lịch sử"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 flex items-center justify-between border-t border-border/60 bg-card/80">
                      <span className="text-3xs text-muted-foreground truncate max-w-[140px]">
                        {url.split("/").pop() || "Ảnh đã tải"}
                      </span>
                      <span className="text-3xs font-semibold text-brand-orange group-hover:underline">
                        Chọn ảnh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
