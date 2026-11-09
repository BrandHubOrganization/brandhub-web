import { useTranslation } from "react-i18next";
import { Clock3, Eye, FileText, RefreshCw, Send, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockBuilder } from "@/pages/mail-templates/components/BlockBuilder";
import { MailPreview } from "@/pages/mail-templates/components/MailPreview";
import { AdminMailTemplatesPanel } from "@/pages/admin/components/AdminMailTemplatesPanel";
import { AdminNotificationsPanel } from "@/pages/admin/components/AdminNotificationsPanel";
import { AdminMailBatchesPanel } from "@/pages/admin/components/AdminMailBatchesPanel";
import { EmailHubConfigSidebar } from "@/pages/admin/components/email-hub/EmailHubConfigSidebar";
import { EmailHubDialogs } from "@/pages/admin/components/email-hub/EmailHubDialogs";
import { useAdminEmailHub } from "@/pages/admin/hooks/useAdminEmailHub";
import type { EmailHubTab } from "@/pages/admin/hooks/useAdminEmailHub";

export interface AdminEmailHubTabsProps {
  activeTab: EmailHubTab;
  onTabChange: (tab: EmailHubTab) => void;
}

export function AdminEmailHubTabs({ activeTab, onTabChange }: AdminEmailHubTabsProps) {
  const { t } = useTranslation();
  return (
    <Tabs value={activeTab} onValueChange={(tabValue) => onTabChange(tabValue as EmailHubTab)}>
      <TabsList className="bg-background/80 border-border h-9 border p-1 backdrop-blur-xs">
        <TabsTrigger value="compose" className="gap-1.5 text-xs">
          <Send className="size-3.5" />
          <span>{t("admin.emailHub.tabCompose")}</span>
        </TabsTrigger>
        <TabsTrigger value="templates" className="gap-1.5 text-xs">
          <FileText className="size-3.5" />
          <span>{t("admin.emailHub.tabTemplates")}</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-1.5 text-xs">
          <Clock3 className="size-3.5" />
          <span>{t("admin.emailHub.tabHistory")}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export interface AdminEmailHubPanelProps {
  initialTab?: EmailHubTab;
  activeTab?: EmailHubTab;
  onTabChange?: (tab: EmailHubTab) => void;
}

export function AdminEmailHubPanel({
  initialTab = "compose",
  activeTab,
  onTabChange,
}: AdminEmailHubPanelProps) {
  const { t } = useTranslation();
  const hub = useAdminEmailHub(initialTab, activeTab, onTabChange);
  const isBuilder = hub.composerView === "builder";

  return (
    <div className="w-full min-w-0 space-y-6">
      {hub.activeTab === "compose" && (
        <div className="space-y-6">
          <div className="bg-card border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => hub.setPickerOpen(true)}>
                <Sparkles className="text-brand-orange size-3.5" />
                <span>{t("admin.emailHub.pickTemplateBtn")}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1.5 text-xs"
                onClick={hub.handleResetComposer}
              >
                <RefreshCw className="size-3.5" />
                <span>{t("admin.emailHub.resetBtn")}</span>
              </Button>
            </div>

            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Button
                variant={isBuilder ? "orange" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => hub.setComposerView("builder")}
              >
                <SlidersHorizontal className="size-3.5" />
                <span>{t("admin.emailHub.builderMode")}</span>
              </Button>
              <Button
                variant={!isBuilder ? "orange" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => hub.setComposerView("preview")}
              >
                <Eye className="size-3.5" />
                <span>{t("admin.emailHub.previewMode")}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <EmailHubConfigSidebar hub={hub} />

            <div className="flex flex-col lg:col-span-7">
              <div className="bg-card border-border flex h-full flex-1 flex-col rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">
                      {t(isBuilder ? "admin.emailHub.builderTitle" : "admin.emailHub.previewTitle")}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {t(isBuilder ? "admin.emailHub.builderDesc" : "admin.emailHub.previewDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[560px] flex-1 flex-col">
                  {isBuilder ? (
                    <BlockBuilder blocks={hub.blocks} onChange={hub.setBlocks} errors={hub.blockErrors} />
                  ) : (
                    <MailPreview subject={hub.title} bodyHtml={hub.previewHtml} fullHeight />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {hub.activeTab === "templates" && (
        <AdminMailTemplatesPanel onUseTemplate={(template) => void hub.handleApplyTemplate(template)} />
      )}

      {hub.activeTab === "history" && (
        <Tabs defaultValue="notifications" className="space-y-6">
          <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-muted/80 h-9 w-fit p-1">
              <TabsTrigger value="notifications" className="text-xs">
                {t("admin.emailHub.historyNotifications")}
              </TabsTrigger>
              <TabsTrigger value="batches" className="text-xs">
                {t("admin.emailHub.historyBatches")}
              </TabsTrigger>
            </TabsList>

            <Button
              variant="orange"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => hub.setActiveTab("compose")}
            >
              <Send className="size-4" />
              <span>{t("admin.notifications.compose")}</span>
            </Button>
          </div>

          <TabsContent value="notifications" className="mt-0">
            <AdminNotificationsPanel hideComposeButton />
          </TabsContent>
          <TabsContent value="batches" className="mt-0">
            <AdminMailBatchesPanel />
          </TabsContent>
        </Tabs>
      )}

      <EmailHubDialogs hub={hub} />
    </div>
  );
}

export default AdminEmailHubPanel;
