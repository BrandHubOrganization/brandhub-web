import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Film,
  FolderKanban,
  GripVertical,
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
      hideHeader
    >
      <div className="space-y-4">
        {/* AWS Console-style Page Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-[#d5dbdb] pb-4 dark:border-border lg:flex-row lg:items-center">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("library.page.title", "Kho lưu trữ nội dung")}
              </h1>
              <Link
                to="/help/guide"
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-brand-orange hover:underline"
              >
                Info
              </Link>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t(
                "library.page.description",
                "Quản lý tập trung tệp đa phương tiện, thư mục, mẫu bài đăng và bộ hashtag của không gian làm việc.",
              )}
            </p>
          </div>
          <div className="shrink-0">
            <StorageUsageSummary />
          </div>
        </div>

        {/* AWS Console-style Section Switcher Panel */}
        <div className="border border-[#d5dbdb] bg-card shadow-[0_1px_1px_0_rgba(0,28,36,0.05)] dark:border-border">
          <div className="flex items-center justify-between border-b border-[#eaeded] px-4 py-2.5 dark:border-border/70">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/70" />
              <span className="text-sm font-bold text-foreground">
                Danh mục tài nguyên
              </span>
              <Link
                to="/help/guide"
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-brand-orange hover:underline"
              >
                Info
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#eaeded] dark:divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTabChange(item.key)}
                  className={`group flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    isActive
                      ? "border-b-2 border-b-brand-orange bg-brand-orange/[0.04] dark:bg-brand-orange/[0.08]"
                      : "bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] transition-colors ${
                        isActive
                          ? "bg-brand-orange text-white"
                          : "bg-muted text-muted-foreground group-hover:bg-brand-orange/15 group-hover:text-brand-orange"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold tracking-tight ${
                            isActive
                              ? "text-foreground"
                              : "text-foreground group-hover:text-brand-orange"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                            isActive
                              ? "bg-brand-orange text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.count}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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
