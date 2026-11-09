import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { errorCode } from "@/services/adminRevenueService";
import { adminNotificationService } from "@/services/adminNotificationService";
import { adminMailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";
import {
  newBlock,
  parseLayout,
  renderLayoutPreview,
  serializeLayout,
  validateBlocks,
} from "@/pages/mail-templates/blocks";
import { htmlToPlainText } from "@/pages/mail-templates/utils";
import type {
  NotificationRequest,
  NotificationType,
  TargetType,
} from "@/services/adminNotificationService";
import type { MailBlock, MailLocale } from "@/pages/mail-templates/blocks";
import type {
  MailTemplate,
  MailTemplateSummary,
} from "@/pages/mail-templates/types";

export type EmailHubTab = "compose" | "templates" | "history";
export type SendOption = "NOW" | "SCHEDULE";
export type ComposerView = "builder" | "preview";
export type PublishAction = "DRAFT" | "SCHEDULE" | "SEND_NOW";

function createDefaultBlocks(): MailBlock[] {
  return [
    newBlock("header"),
    {
      ...newBlock("heading"),
      props: { text: "Thông báo cập nhật từ hệ thống BrandHub", align: "left" },
    },
    {
      ...newBlock("paragraph"),
      props: {
        text: "Xin chào {{name}},\n\nHệ thống BrandHub xin gửi tới bạn thông tin cập nhật mới nhất. Vui lòng kiểm tra chi tiết bên dưới.",
      },
    },
    {
      ...newBlock("cta_button"),
      props: {
        label: "Xem chi tiết trên BrandHub",
        urlType: "site",
        customUrl: "",
      },
    },
    newBlock("footer"),
  ];
}

function getSuccessToastKey(action: PublishAction): string {
  if (action === "SEND_NOW") return "admin.emailHub.sendSuccess";
  if (action === "SCHEDULE") return "admin.emailHub.scheduleSuccess";
  return "admin.emailHub.draftSuccess";
}

function extractTemplateLayout(fullTemplate: MailTemplate): {
  blocks: MailBlock[];
  locale?: MailLocale;
} {
  if (fullTemplate.layoutJson) {
    const parsed = parseLayout(fullTemplate.layoutJson);
    return { blocks: parsed.blocks, locale: parsed.locale };
  }
  if (fullTemplate.bodyHtml) {
    return {
      blocks: [
        newBlock("header"),
        {
          ...newBlock("paragraph"),
          props: { text: htmlToPlainText(fullTemplate.bodyHtml) },
        },
      ],
    };
  }
  return { blocks: createDefaultBlocks() };
}

export function useAdminEmailHub(
  initialTab: EmailHubTab = "compose",
  controlledTab?: EmailHubTab,
  onTabChange?: (tab: EmailHubTab) => void,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [internalTab, setInternalTab] = useState<EmailHubTab>(initialTab);
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (nextTab: EmailHubTab) => {
    setInternalTab(nextTab);
    onTabChange?.(nextTab);
  };
  const [title, setTitle] = useState("");
  const [type, setType] = useState<NotificationType>("SYSTEM");
  const [targetType, setTargetType] = useState<TargetType>("ALL");
  const [targetValues, setTargetValues] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendOption, setSendOption] = useState<SendOption>("NOW");
  const [locale, setLocale] = useState<MailLocale>("vi");
  const [blocks, setBlocks] = useState<MailBlock[]>(createDefaultBlocks);
  const [composerView, setComposerView] = useState<ComposerView>("builder");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["admin-notification-plans"],
    queryFn: () => adminNotificationService.plans(),
    staleTime: 60000,
  });

  const { data: audienceEstimate, isLoading: isEstimating } = useQuery({
    queryKey: ["admin-audience-estimate", targetType, targetValues],
    queryFn: () => adminNotificationService.estimate(targetType, targetValues),
  });

  const { data: systemTemplates, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ["admin-mail-templates-all"],
    queryFn: () => adminMailTemplateService.list({ size: 100 }),
    enabled: pickerOpen,
  });

  const previewHtml = useMemo(
    () => renderLayoutPreview(blocks, locale),
    [blocks, locale],
  );
  const blockErrors = useMemo(() => validateBlocks(blocks), [blocks]);
  const hasErrors = Object.keys(blockErrors).length > 0;

  const handleApplyTemplate = async (templateSummary: MailTemplateSummary) => {
    try {
      const fullTemplate = await adminMailTemplateService.get(
        templateSummary.id,
      );
      const extracted = extractTemplateLayout(fullTemplate);
      setTitle(fullTemplate.subject || fullTemplate.name);
      setBlocks(extracted.blocks);
      if (extracted.locale) setLocale(extracted.locale);
      setPickerOpen(false);
      setActiveTab("compose");
      toast.success(
        t("admin.emailHub.templateLoaded", { name: fullTemplate.name }),
      );
    } catch (error) {
      toast.error(
        t(`mailTemplate.errors.${errorCode(error)}`, {
          defaultValue: t("mailTemplate.errors.generic"),
        }),
      );
    }
  };

  const sendMutation = useMutation({
    mutationFn: async (action: PublishAction) => {
      if (!title.trim()) {
        throw new Error(t("admin.emailHub.errorTitleRequired"));
      }
      if (blocks.length === 0) {
        throw new Error(t("admin.emailHub.errorBlocksRequired"));
      }
      const request: NotificationRequest = {
        title: title.trim(),
        content: htmlToPlainText(previewHtml),
        type,
        targetType,
        targetValues: targetType === "ALL" ? [] : targetValues,
        actionUrl: null,
        scheduledAt:
          action === "SCHEDULE" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
        action,
      };
      return adminNotificationService.save(request);
    },
    onSuccess: (_, action) => {
      toast.success(t(getSuccessToastKey(action)));
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setActiveTab("history");
    },
    onError: (error: Error) => {
      toast.error(error.message || t("common.actionFailed"));
    },
  });

  const handleSendTest = async () => {
    if (!currentUser?.email) {
      toast.error(t("admin.emailHub.noAdminEmail"));
      return;
    }
    setTestSending(true);
    try {
      const tempTemplate = await adminMailTemplateService.create({
        name: `[Test] ${title || "Email"} - ${Date.now()}`,
        subject: title || "Test Email",
        scope: "ADMIN_SYSTEM_BROADCAST",
        layoutJson: serializeLayout({ version: 1, locale, blocks }),
        attachmentIds: [],
      });
      await adminMailTemplateService.sendTest(tempTemplate.id);
      await adminMailTemplateService
        .remove(tempTemplate.id)
        .catch((cleanupError: unknown) => {
          console.error(cleanupError);
        });
      toast.success(
        t("admin.emailHub.testSentSuccess", { email: currentUser.email }),
      );
    } catch (error) {
      console.error(error);
      toast.error(t("admin.emailHub.testSentFailed"));
    } finally {
      setTestSending(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error(t("admin.emailHub.errorTemplateName"));
      return;
    }
    setSavingTemplate(true);
    try {
      await adminMailTemplateService.create({
        name: templateName.trim(),
        subject: title || templateName.trim(),
        scope: "ADMIN_SYSTEM_BROADCAST",
        layoutJson: serializeLayout({ version: 1, locale, blocks }),
        attachmentIds: [],
      });
      toast.success(t("admin.emailHub.templateSaved"));
      setSaveAsTemplateOpen(false);
      setTemplateName("");
      void queryClient.invalidateQueries({
        queryKey: ["admin-mail-templates-all"],
      });
    } catch (error) {
      toast.error(
        t(`mailTemplate.errors.${errorCode(error)}`, {
          defaultValue: t("mailTemplate.errors.generic"),
        }),
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  const toggleTargetValue = (targetValue: string) => {
    setTargetValues((previousValues) =>
      previousValues.includes(targetValue)
        ? previousValues.filter((item) => item !== targetValue)
        : [...previousValues, targetValue],
    );
  };

  const handleResetComposer = () => {
    setResetConfirmOpen(true);
  };

  const confirmResetComposer = () => {
    setTitle("");
    setBlocks(createDefaultBlocks());
    setResetConfirmOpen(false);
  };

  return {
    activeTab,
    setActiveTab,
    title,
    setTitle,
    type,
    setType,
    targetType,
    setTargetType,
    targetValues,
    setTargetValues,
    scheduledAt,
    setScheduledAt,
    sendOption,
    setSendOption,
    blocks,
    setBlocks,
    composerView,
    setComposerView,
    pickerOpen,
    setPickerOpen,
    saveAsTemplateOpen,
    setSaveAsTemplateOpen,
    resetConfirmOpen,
    setResetConfirmOpen,
    templateName,
    setTemplateName,
    plans,
    audienceEstimate,
    isEstimating,
    systemTemplates,
    isTemplatesLoading,
    previewHtml,
    blockErrors,
    hasErrors,
    testSending,
    savingTemplate,
    isSubmitting: sendMutation.isPending,
    handleApplyTemplate,
    handlePublish: (action: PublishAction) => sendMutation.mutate(action),
    handleSendTest,
    handleSaveAsTemplate,
    toggleTargetValue,
    handleResetComposer,
    confirmResetComposer,
  };
}
