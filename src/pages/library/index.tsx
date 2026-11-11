import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Film,
  FolderKanban,
  Hash,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { StorageUsageSummary } from "@/pages/library/components/StorageUsageSummary";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
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

  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
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

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: typeof Film;
    count: number;
    desc: string;
  }> = [
    {
      key: "media",
      label: t("library.page.mediaTab", "Tệp & Thư mục"),
      icon: FolderKanban,
      count: mediaTotal,
      desc: "Hình ảnh, video & tài liệu",
    },
    {
      key: "templates",
      label: t("library.page.templatesTab", "Mẫu bài đăng"),
      icon: FileText,
      count: templatesTotal,
      desc: "Khung nội dung tái sử dụng",
    },
    {
      key: "hashtags",
      label: t("library.page.hashtagsTab", "Nhóm Hashtag"),
      icon: Hash,
      count: hashtagsTotal,
      desc: "Bộ thẻ tiếp cận theo chủ đề",
    },
  ];

  return (
    <PageWrapper
      title={t("library.page.title", "Kho lưu trữ nội dung")}
      description={t(
        "library.page.description",
        "Quản lý tập trung tệp đa phương tiện, thư mục, mẫu bài đăng và bộ hashtag của không gian làm việc.",
      )}
      actions={<StorageUsageSummary />}
    >
      <div className="space-y-5">
        {/* KPI & Quick Switcher Strip (brandhub-ui-design + Google Drive style) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isActive
                    ? "border-brand-orange bg-brand-orange/[0.06] shadow-sm ring-1 ring-brand-orange/30"
                    : "border-border/80 bg-card hover:border-brand-orange/40 hover:bg-muted/30"
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isActive ? "text-brand-orange" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        isActive
                          ? "bg-brand-orange text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-muted/80 text-muted-foreground group-hover:bg-brand-orange/10 group-hover:text-brand-orange"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "hashtags" && <HashtagGroupsTab />}
      </div>
    </PageWrapper>
  );
}

export default ContentLibraryPage;
