import React, { useState } from 'react';
import type { CalendarPostEvent } from '../../types/calendar';
import type { PlatformType } from '../../types/calendar';
import { Calendar as CalendarIcon, Eye } from 'lucide-react';
import { PlatformPreviewModal } from '../preview/PlatformPreviewModal';

interface SchedulePostModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSubmit: (postData: Partial<CalendarPostEvent>) => void;
}

export const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  isOpen,
  selectedDate,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('FACEBOOK');
  const [time, setTime] = useState('09:00');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const formattedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const scheduledDateTime = new Date(`${formattedDateStr}T${time}:00`).toISOString();

    onSubmit({
      title,
      start: scheduledDateTime,
      extendedProps: {
        platform,
        status: 'SCHEDULED',
        captionPreview: caption || title,
      },
    });

    // Reset & Close
    setTitle('');
    setCaption('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Schedule Post</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Post Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Sale Promo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Caption Preview</label>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview Mockup
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Enter post caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="THREADS">Threads</option>
                  <option value="YOUTUBE">Youtube</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Scheduled Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      </div>

      <PlatformPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title,
          caption: caption || title || 'Post caption preview text...',
          targetPlatforms: [platform, 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'THREADS', 'YOUTUBE'].filter((v, i, a) => a.indexOf(v) === i) as PlatformType[],
        }}
      />
    </>
  );
};
