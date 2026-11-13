import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/layout/PageWrapper";
import { StorageUsageSummary } from "@/pages/library/components/StorageUsageSummary";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
import { LibraryResourceDropdown } from "@/pages/library/components/LibraryResourceDropdown";
import { materialService } from "@/services/materialService";
import { contentLibraryService } from "@/services/contentLibraryService";
import { listHashtags } from "@/pages/hashtag-groups/services/hashtagService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { onRepositoryTaskRefresh } from "@/store/backgroundTaskStore";

type TabKey = "media" | "templates" | "hashtags";

function normalizeTab(raw: string | null): TabKey {
  if (raw === "templates" || raw === "template") return "templates";
  if (raw === "hashtags" || raw === "hashtag" || raw === "hashtag-groups") {
    return "hashtags";
  }
  return "media";
}

export function ContentLibraryPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = normalizeTab(searchParams.get("tab"));
  const queryClient = useQueryClient();

  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspace = currentWorkspace?.id;
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);

  const handleTabChange = (nextTab: TabKey) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!workspace) return;
    return onRepositoryTaskRefresh((refreshedWsId) => {
      if (refreshedWsId === workspace) {
        void queryClient.invalidateQueries({
          queryKey: ["materials", workspace],
        });
      }
    });
  }, [workspace, queryClient]);

  const mediaCountQuery = useQuery({
    queryKey: ["materials", workspace, actor, "count", role],
    enabled: !!workspace && !!actor && !!role,
    queryFn: async ({ signal }) => {
      if (role === "CLIENT") {
        const browser = await materialService.browse(
          workspace!,
          {
            tab: "CLIENT_VAULT",
            page: 0,
            size: 1,
            search: "",
            deleted: false,
          },
          signal,
        );
        return browser.files.meta.total + browser.folders.length;
      }
      const page = await materialService.listPage(
        workspace!,
        { page: 0, size: 1, search: "", deleted: false, draft: false },
        signal,
      );
      return page.total;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const templatesCountQuery = useQuery({
    queryKey: ["library-templates-count", workspace],
    enabled: !!workspace,
    queryFn: async () => {
      const list = await contentLibraryService.getTemplates();
      return list.length;
    },
    staleTime: 30_000,
  });

  const hashtagsCountQuery = useQuery({
    queryKey: ["hashtag-collection", actor, workspace, "count"],
    enabled: !!workspace && !!actor,
    queryFn: async ({ signal }) => {
      const page = await listHashtags(
        workspace!,
        { q: "", purpose: "", isRequired: undefined, page: 0 },
        signal,
      );
      return page.totalElements ?? page.items?.length ?? 0;
    },
    staleTime: 30_000,
    retry: false,
  });

  const mediaTotal = mediaCountQuery.data ?? 0;
  const templatesTotal = templatesCountQuery.data ?? 0;
  const hashtagsTotal = hashtagsCountQuery.data ?? 0;

  return (
    <PageWrapper
      title={t("library.page.title", "Thư viện Nội dung")}
      description={t(
        "library.page.description",
        "Quản lý tập trung tệp đa phương tiện, thư mục, mẫu bài đăng và bộ hashtag của không gian làm việc.",
      )}
      showGuideButton={false}
      showWorkspaceBadge={false}
      actions={<StorageUsageSummary />}
    >
      <div className="space-y-4">
        {/* Compact Switcher for non-media tabs (MediaTab renders it natively inside its category filter toolbar) */}
        {activeTab !== "media" && (
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <LibraryResourceDropdown
                activeTab={activeTab}
                onTabChange={handleTabChange}
                counts={{
                  media: mediaTotal,
                  templates: templatesTotal,
                  hashtags: hashtagsTotal,
                }}
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "media" && (
          <MediaTab
            activeResourceTab={activeTab}
            onResourceTabChange={handleTabChange}
            resourceCounts={{
              media: mediaTotal,
              templates: templatesTotal,
              hashtags: hashtagsTotal,
            }}
          />
        )}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "hashtags" && <HashtagGroupsTab />}
      </div>
    </PageWrapper>
  );
}

export default ContentLibraryPage;
