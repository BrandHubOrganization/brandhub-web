import React, { useState } from 'react';
import type { MediaItem } from '@/types/contentLibrary';
import { X, Copy, Trash2, Calendar, HardDrive, Maximize2, Film, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MediaDetailPanelProps {
  media: MediaItem | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const MediaDetailPanel: React.FC<MediaDetailPanelProps> = ({ media, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!media) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    toast.success('Đã copy S3 URL vào clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa file "${media.filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(media.id);
        toast.success('Đã xóa file media thành công');
        onClose();
      } catch (err) {
        toast.error('Lỗi khi xóa file');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col transform transition-transform border-l border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm">
            {media.type === 'video' ? (
              <Film className="w-4 h-4 text-brand-orange" />
            ) : (
              <ImageIcon className="w-4 h-4 text-brand-orange" />
            )}
            Chi tiết Media
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Media Preview Box */}
          <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative group flex items-center justify-center min-h-[220px]">
            {media.type === 'video' ? (
              <video
                src={media.url}
                controls
                className="max-h-[300px] w-full object-contain"
                poster={media.thumbnailUrl}
              />
            ) : (
              <img
                src={media.url}
                alt={media.filename}
                className="max-h-[300px] w-full object-contain"
              />
            )}
          </div>

          {/* Title & Badge */}
          <div>
            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-brand-orange-soft text-brand-orange mb-2 uppercase tracking-wide">
              {media.type}
            </span>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-base break-all leading-snug">
              {media.filename}
            </h4>
          </div>

          {/* Metadata Grid */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                <HardDrive className="w-4 h-4" /> Dung lượng
              </span>
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                {formatBytes(media.sizeBytes)}
              </span>
            </div>

            {media.width && media.height && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                  <Maximize2 className="w-4 h-4" /> Độ phân giải
                </span>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {media.width} × {media.height} px
                </span>
              </div>
            )}

            {media.durationSeconds && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                  <Film className="w-4 h-4" /> Thời lượng
                </span>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {media.durationSeconds} giây
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                <Calendar className="w-4 h-4" /> Ngày tải lên
              </span>
              <span className="text-zinc-800 dark:text-zinc-200 text-xs">
                {formatDate(media.createdAt)}
              </span>
            </div>
          </div>

          {/* S3 Direct Link Input Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">S3 Direct URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={media.url}
                className="flex-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-600 dark:text-zinc-300 focus:outline-hidden"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Đang xóa...' : 'Xóa File'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
