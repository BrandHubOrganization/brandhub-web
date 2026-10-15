import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { MediaTab } from "@/pages/library/components/MediaTab";
import { HashtagGroupsTab } from "@/pages/library/components/HashtagGroupsTab";
import { TemplatesTab } from "@/pages/library/components/TemplatesTab";
import { Film, Hash, FileText, ShieldCheck } from "lucide-react";
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
        {/* KPI / Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div
            onClick={() => setActiveTab("media")}
            className="border-border bg-card hover:border-brand-orange/40 group flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
              <Film className="size-5" />
            </div>
            <div>
              <div className="text-foreground text-lg font-bold">16+</div>
              <div className="text-muted-foreground text-xs font-medium">
                {t("library.page.mediaAssetsCount", "Media 4K & Video")}
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("hashtags")}
            className="border-border bg-card hover:border-brand-orange/40 group flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Hash className="size-5" />
            </div>
            <div>
              <div className="text-foreground text-lg font-bold">6 Nhóm</div>
              <div className="text-muted-foreground text-xs font-medium">
                {t("library.page.hashtagsCount", "Hashtag phân loại")}
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("templates")}
            className="border-border bg-card hover:border-brand-orange/40 group flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="text-foreground text-lg font-bold">8 Mẫu</div>
              <div className="text-muted-foreground text-xs font-medium">
                {t("library.page.templatesCount", "Mẫu bài chuẩn hóa")}
              </div>
            </div>
          </div>

          <div className="border-border bg-card flex items-center gap-3.5 rounded-xl border p-4 shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="text-foreground flex items-center gap-1.5 text-lg font-bold">
                Watermark
                <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-semibold px-1.5 py-0.2 rounded-full">S3</span>
              </div>
              <div className="text-muted-foreground text-xs font-medium">
                {t("library.page.watermarkLabel", "Bảo vệ bản quyền số")}
              </div>
            </div>
          </div>
        </div>

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
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">16</span>
            </TabsTrigger>

            <TabsTrigger
              value="hashtags"
              className="data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none"
            >
              <Hash className="size-4" />
              <span>{t("library.page.hashtagsTab")}</span>
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">6</span>
            </TabsTrigger>

            <TabsTrigger
              value="templates"
              className="data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 py-0 pb-3 text-sm font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none"
            >
              <FileText className="size-4" />
              <span>{t("library.page.templatesTab")}</span>
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">8</span>
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
