import { X, Copy, Maximize2 } from "lucide-react";
import { toast } from "sonner";

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("Đã copy đường dẫn ảnh vào clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 p-4">
          <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Maximize2 className="text-brand-orange h-4 w-4" />
            AI Generated Image Preview (Stability AI)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy URL</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Full Box */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-black/40 p-4">
          <img
            src={imageUrl}
            alt="AI Full Lightbox"
            className="max-h-[75vh] w-auto rounded-xl border border-zinc-800 object-contain shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
