import React from 'react';
import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { PLATFORM_LIMITS } from "@/types/preview";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Globe } from 'lucide-react';

interface PlatformMockupProps {
  platform: PlatformType;
  data: PostPreviewData;
}

export const PlatformMockup: React.FC<PlatformMockupProps> = ({ platform, data }) => {
  const {
    caption,
    mediaUrls = [],
    authorName = 'BrandHub Official',
    authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  } = data;

  const defaultMedia = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  const mediaSrc = mediaUrls[0] || defaultMedia;
  const config = PLATFORM_LIMITS[platform];

  if (platform === 'FACEBOOK') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden max-w-md mx-auto">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={authorAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{authorName}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">Just now · <Globe className="w-3 h-3" /></p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </div>

        <p className="px-3.5 pb-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{caption}</p>

        <div className={`w-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${config.aspectRatioClass}`}>
          <img src={mediaSrc} alt="Post content" className="w-full h-full object-cover" />
        </div>

        <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-slate-500 text-xs font-medium">
          <button className="flex items-center gap-1.5 hover:text-blue-600"><ThumbsUp className="w-4 h-4" /> Like</button>
          <button className="flex items-center gap-1.5 hover:text-blue-600"><MessageCircle className="w-4 h-4" /> Comment</button>
          <button className="flex items-center gap-1.5 hover:text-blue-600"><Share2 className="w-4 h-4" /> Share</button>
        </div>
      </div>
    );
  }

  if (platform === 'INSTAGRAM') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden max-w-md mx-auto">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <img src={authorAvatar} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{authorName.toLowerCase().replace(/\s+/g, '_')}</span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </div>

        <div className={`w-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${config.aspectRatioClass}`}>
          <img src={mediaSrc} alt="Post content" className="w-full h-full object-cover" />
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
              <MessageCircle className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
              <Share2 className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
            </div>
            <Bookmark className="w-5 h-5 cursor-pointer" />
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3">
            <span className="font-semibold mr-1.5">{authorName.toLowerCase().replace(/\s+/g, '_')}</span>
            {caption}
          </p>
        </div>
      </div>
    );
  }

  if (platform === 'TIKTOK') {
    return (
      <div className="bg-slate-950 text-white rounded-2xl shadow-2xl overflow-hidden max-w-[280px] mx-auto relative aspect-[9/16] border border-slate-800">
        <img src={mediaSrc} alt="TikTok" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
        
        <div className="absolute right-3 bottom-12 flex flex-col items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
            <img src={authorAvatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-center"><Heart className="w-6 h-6 fill-white" /><span>12.4K</span></div>
          <div className="flex flex-col items-center"><MessageCircle className="w-6 h-6 fill-white" /><span>342</span></div>
          <div className="flex flex-col items-center"><Bookmark className="w-6 h-6 fill-white" /><span>1.2K</span></div>
        </div>

        <div className="absolute left-3 bottom-4 right-14 space-y-1">
          <h5 className="font-semibold text-xs text-white">@{authorName.toLowerCase().replace(/\s+/g, '')}</h5>
          <p className="text-[11px] text-slate-200 line-clamp-2">{caption}</p>
        </div>
      </div>
    );
  }

  // Default fallback for Threads & Youtube
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-w-md mx-auto space-y-3">
      <div className="flex items-center gap-2">
        <img src={authorAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{authorName}</span>
      </div>
      <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{caption}</p>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden ${config.aspectRatioClass}`}>
        <img src={mediaSrc} alt="Media preview" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};
