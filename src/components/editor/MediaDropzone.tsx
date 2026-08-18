import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaDropzoneProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({ mediaUrls, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const simulateProgress = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      setUploadProgress(0);

      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          const isVideo = file.type.startsWith('video');
          const mockUrl = isVideo
            ? 'https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-42898-large.mp4'
            : URL.createObjectURL(file);
          resolve(mockUrl);
        }
      }, 150);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá dung lượng 50MB`);
        continue;
      }

      try {
        const uploadedUrl = await simulateProgress(file);
        onChange([...mediaUrls, uploadedUrl]);
        toast.success(`Đã upload thành công: ${file.name}`);
      } catch (err) {
        toast.error(`Lỗi khi upload file ${file.name}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const next = [...mediaUrls];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-indigo-400'
        }`}
      >
        {uploadProgress !== null ? (
          <div className="space-y-3 py-2 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                Đang tải phương tiện lên...
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Kéo thả hình ảnh/video vào đây hoặc <span className="text-indigo-600 dark:text-indigo-400">duyệt từ máy tính</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Hỗ trợ JPG, PNG, GIF, MP4 (tối đa 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Media Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
          {mediaUrls.map((url, idx) => {
            const isVideo = url.endsWith('.mp4') || url.includes('mixkit');
            return (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-2xs"
              >
                {isVideo ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveMedia(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
