import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  name: string;
  logoUrl: string | null;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LogoUploader({
  name,
  logoUrl,
  uploading,
  fileInputRef,
  onFileChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card mb-4 flex max-w-sm flex-col items-center gap-4 rounded-xl border p-6">
      <div className="bg-brand-orange flex size-20 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold text-white">
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="size-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />
      <Button
        variant="orange"
        type="button"
        loading={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {t("workspace.settings.logoUploadButton")}
      </Button>
    </div>
  );
}
