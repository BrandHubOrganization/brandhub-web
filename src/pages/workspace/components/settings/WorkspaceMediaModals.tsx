import {
  ImageCropperModal,
  RecentAssetsModal,
} from "@/components/shared/image-editor";

interface WorkspaceMediaModalsProps {
  logoCropperOpen: boolean;
  logoCropperSrc: string | null;
  onCloseLogoCropper: () => void;
  onConfirmLogoCrop: (file: File) => void;

  logoRecentOpen: boolean;
  onCloseLogoRecent: () => void;
  onSelectRecentLogo: (url: string) => void;

  bannerCropperOpen: boolean;
  bannerCropperSrc: string | null;
  onCloseBannerCropper: () => void;
  onConfirmBannerCrop: (file: File) => void;

  bannerRecentOpen: boolean;
  onCloseBannerRecent: () => void;
  onSelectRecentBanner: (url: string) => void;
}

export function WorkspaceMediaModals({
  logoCropperOpen,
  logoCropperSrc,
  onCloseLogoCropper,
  onConfirmLogoCrop,
  logoRecentOpen,
  onCloseLogoRecent,
  onSelectRecentLogo,
  bannerCropperOpen,
  bannerCropperSrc,
  onCloseBannerCropper,
  onConfirmBannerCrop,
  bannerRecentOpen,
  onCloseBannerRecent,
  onSelectRecentBanner,
}: WorkspaceMediaModalsProps) {
  return (
    <>
      <ImageCropperModal
        isOpen={logoCropperOpen}
        onClose={onCloseLogoCropper}
        cropType="logo"
        imageUrl={logoCropperSrc}
        onConfirm={onConfirmLogoCrop}
      />

      <RecentAssetsModal
        isOpen={logoRecentOpen}
        onClose={onCloseLogoRecent}
        category="logo"
        onSelect={onSelectRecentLogo}
      />

      <ImageCropperModal
        isOpen={bannerCropperOpen}
        onClose={onCloseBannerCropper}
        cropType="banner"
        imageUrl={bannerCropperSrc}
        onConfirm={onConfirmBannerCrop}
      />

      <RecentAssetsModal
        isOpen={bannerRecentOpen}
        onClose={onCloseBannerRecent}
        category="banner"
        onSelect={onSelectRecentBanner}
      />
    </>
  );
}
