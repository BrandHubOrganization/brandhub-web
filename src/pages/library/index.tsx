import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { MediaTab } from "@/components/library/MediaTab";
import { HashtagGroupsTab } from "@/components/library/HashtagGroupsTab";
import { TemplatesTab } from "@/components/library/TemplatesTab";
import { Film, Hash, FileText } from "lucide-react";

type TabKey = "media" | "hashtags" | "templates";

export function ContentLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("media");

  return (
    <PageWrapper
      title="Content Library"
      description="Quản lý tập trung tài nguyên truyền thông (S3 Media), bộ Hashtags và Mẫu bài đăng của workspace."
    >
      <div className="space-y-6">
        {/* Navigation Tab Bar */}
        <div className="flex gap-6 border-b border-zinc-200 text-sm font-medium dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("media")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
              activeTab === "media"
                ? "border-brand-orange text-brand-orange font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Media Library</span>
          </button>

          <button
            onClick={() => setActiveTab("hashtags")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
              activeTab === "hashtags"
                ? "border-brand-orange text-brand-orange font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Hash className="h-4 w-4" />
            <span>Hashtag Groups</span>
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
              activeTab === "templates"
                ? "border-brand-orange text-brand-orange font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Post Templates</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "hashtags" && <HashtagGroupsTab />}
        {activeTab === "templates" && <TemplatesTab />}
      </div>
    </PageWrapper>
  );
}

export default ContentLibraryPage;
