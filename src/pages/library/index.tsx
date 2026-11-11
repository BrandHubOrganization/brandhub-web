import { StorageUsageSummary } from "@/pages/library/components/StorageUsageSummary";
import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
import { Film, Hash, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

type TabKey = "media" | "hashtags" | "templates";

export function ContentLibraryPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("media");
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const mediaCount = useQuery({
    queryKey: ["materials", workspace, actor, "count", role],
    enabled: !!workspace && !!actor && !!role,
    queryFn: ({ signal }) =>
      materialService.listPage(
        workspace!,
        { page: 0, size: 1, search: "", deleted: false, draft: false },
        signal,
      ),
    select: (data) => data.total,
    refetchInterval: 60_000,
    retry: false,
  });

  return (
    <PageWrapper
      title={t("library.page.title")}
      description={t("library.page.description")}
      actions={
        <>
          {activeTab === "media" && <StorageUsageSummary />}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabKey)}
          >
            <TabsList className="bg-muted/70 h-9 gap-1 rounded-xl p-1">
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-background data-[state=active]:text-brand-orange flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:font-semibold data-[state=active]:shadow-xs"
              >
                <Film className="size-3.5" />
                <span>{t("library.page.mediaTab")}</span>
                {workspace && actor && role && mediaCount.isSuccess && (
                  <span className="bg-brand-orange/15 text-brand-orange py-0.2 rounded-full px-1.5 text-[10px] font-bold">
                    {mediaCount.data}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="hashtags"
                className="data-[state=active]:bg-background data-[state=active]:text-brand-orange flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:font-semibold data-[state=active]:shadow-xs"
              >
                <Hash className="size-3.5" />
                <span>{t("library.page.hashtagsTab")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-background data-[state=active]:text-brand-orange flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:font-semibold data-[state=active]:shadow-xs"
              >
                <FileText className="size-3.5" />
                <span>{t("library.page.templatesTab")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </>
      }
    >
      <div className="space-y-4">
        {/* Tab Content Display */}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "hashtags" && <HashtagGroupsTab />}
        {activeTab === "templates" && <TemplatesTab />}
      </div>
    </PageWrapper>
  );
}

export default ContentLibraryPage;
