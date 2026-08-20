import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
import { Film, Hash, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

type TabKey = "media" | "hashtags" | "templates";

export function ContentLibraryPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("media");

  return (
    <PageWrapper
      title={t("library.page.title")}
      description={t("library.page.description")}
    >
      <div className="space-y-6">
        {/* Navigation Tab Bar */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
        >
          <TabsList className="border-border h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="media"
              className="data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none"
            >
              <Film className="size-4" />
              <span>{t("library.page.mediaTab")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="hashtags"
              className="data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none"
            >
              <Hash className="size-4" />
              <span>{t("library.page.hashtagsTab")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="templates"
              className="data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none"
            >
              <FileText className="size-4" />
              <span>{t("library.page.templatesTab")}</span>
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
