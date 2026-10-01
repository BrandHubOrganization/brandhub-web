import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  bannerUrl: string | null;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadLabel: string;
  emptyLabel: string;
}

/** Ảnh bìa ngang full-width dùng chung cho Agency/Workspace detail — khác
 * avatar/logo tròn, banner là ảnh nền phía trên card thông tin. */
export function BannerUploader({
  bannerUrl,
  uploading,
  fileInputRef,
  onFileChange,
  uploadLabel,
  emptyLabel,
}: Props) {
  return (
    <div className="border-border bg-card relative mb-4 h-32 w-full overflow-hidden rounded-xl border sm:h-40">
      {bannerUrl ? (
        <img src={bannerUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
          {emptyLabel}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={uploading}
        className="bg-card/90 absolute right-2 bottom-2 cursor-pointer gap-1.5"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {uploadLabel}
      </Button>
    </div>
  );
}

export default BannerUploader;
