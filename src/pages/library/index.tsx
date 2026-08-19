import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
import { Film, Hash, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-zinc-200 bg-transparent p-0 dark:border-zinc-800">
            <TabsTrigger
              value="media"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-brand-orange data-[state=active]:shadow-none dark:hover:text-zinc-200"
            >
              <Film className="h-4 w-4" />
              <span>Media Library</span>
            </TabsTrigger>

            <TabsTrigger
              value="hashtags"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-brand-orange data-[state=active]:shadow-none dark:hover:text-zinc-200"
            >
              <Hash className="h-4 w-4" />
              <span>Hashtag Groups</span>
            </TabsTrigger>

            <TabsTrigger
              value="templates"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-brand-orange data-[state=active]:shadow-none dark:hover:text-zinc-200"
            >
              <FileText className="h-4 w-4" />
              <span>Post Templates</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Content Display */}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "hashtags" && <HashtagGroupsTab />}
        {activeTab === "templates" && <TemplatesTab />}
      </div>
    </PageWrapper>
  );
}

export default ContentLibraryPage;
