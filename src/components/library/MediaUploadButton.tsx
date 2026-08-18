import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import type { MediaItem } from '@/types/contentLibrary';
import { toast } from 'sonner';

interface MediaUploadButtonProps {
  onUploadSuccess: (newMedia: MediaItem) => void;
  onUploadStart?: () => void;
}

export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ onUploadSuccess, onUploadStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File vượt quá giới hạn 50MB');
      return;
    }

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    try {
      const { mockContentLibraryService } = await import('@/services/mockContentLibraryService');
      const uploadedItem = await mockContentLibraryService.uploadMedia(file);
      toast.success(`Đã tải lên thành công: ${file.name}`);
      onUploadSuccess(uploadedItem);
    } catch (err) {
      toast.error('Tải file lên thất bại!');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-medium text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang tải lên...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Tải lên Media</span>
          </>
        )}
      </button>
    </>
  );
};
