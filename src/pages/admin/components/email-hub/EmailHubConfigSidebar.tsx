import { useTranslation } from "react-i18next";
import { Bookmark, Calendar, CheckCircle2, Layers, MailCheck, Send, SendHorizontal, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { NotificationType, TargetType } from "@/services/adminNotificationService";
import type { useAdminEmailHub } from "@/pages/admin/hooks/useAdminEmailHub";

const NOTIFICATION_TYPES: [NotificationType, string][] = [
  ["SYSTEM", "admin.emailHub.typeSystem"],
  ["MAINTENANCE", "admin.emailHub.typeMaintenance"],
  ["UPDATE", "admin.emailHub.typeUpdate"],
  ["PROMOTION", "admin.emailHub.typePromotion"],
];

const TARGET_TYPES: [TargetType, string, string, typeof Users][] = [
  ["ALL", "admin.emailHub.targetAll", "admin.emailHub.targetAllDesc", Users],
  ["BY_PLAN", "admin.emailHub.targetPlan", "admin.emailHub.targetPlanDesc", Layers],
  ["BY_ROLE", "admin.emailHub.targetRole", "admin.emailHub.targetRoleDesc", Shield],
];

const ROLE_OPTIONS: [string, string][] = [
  ["USER", "admin.emailHub.roleUser"],
  ["AGENCY_OWNER", "admin.emailHub.roleAgencyOwner"],
  ["AGENCY_MEMBER", "admin.emailHub.roleAgencyMember"],
  ["ADMIN", "admin.emailHub.roleAdmin"],
];

export interface EmailHubConfigSidebarProps {
  hub: ReturnType<typeof useAdminEmailHub>;
}

function TargetAudienceCard({ hub }: EmailHubConfigSidebarProps) {
  const { t } = useTranslation();
  const filterOptions =
    hub.targetType === "BY_PLAN"
      ? (hub.plans ?? []).map((plan) => ({ id: plan.name, label: plan.displayName || plan.name }))
      : ROLE_OPTIONS.map(([id, key]) => ({ id, label: t(key) }));
  const filterTitleKey =
    hub.targetType === "BY_PLAN" ? "admin.emailHub.selectPlans" : "admin.emailHub.selectRoles";

  return (
    <div className="bg-card border-border space-y-4 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Users className="text-brand-orange size-4" />
          <span>{t("admin.emailHub.targetAudience")}</span>
        </h3>
        <Badge variant="outline" className="font-mono text-xs font-medium">
          {hub.isEstimating ? (
            <span className="flex items-center gap-1">
              <Spinner className="size-3" />
              <span>{t("admin.emailHub.estimating")}</span>
            </span>
          ) : (
            <span>{t("admin.emailHub.estimatedRecipients", { count: hub.audienceEstimate ?? 0 })}</span>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {TARGET_TYPES.map(([value, labelKey, descKey, Icon]) => {
          const selected = hub.targetType === value;
          return (
            <Button
              type="button"
              key={value}
              variant="outline"
              onClick={() => {
                hub.setTargetType(value);
                hub.setTargetValues([]);
              }}
              className={cn(
                "h-auto w-full items-start justify-start gap-3 rounded-lg p-3 text-left whitespace-normal",
                selected
                  ? "border-brand-orange bg-brand-orange-soft/20 text-foreground"
                  : "border-border hover:bg-muted/50 text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-md p-1.5",
                  selected ? "bg-brand-orange text-white" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-semibold">{t(labelKey)}</p>
                <p className="text-muted-foreground text-xs leading-relaxed font-normal">{t(descKey)}</p>
              </div>
              {selected && <CheckCircle2 className="text-brand-orange size-4 shrink-0" />}
            </Button>
          );
        })}
      </div>

      {hub.targetType !== "ALL" && (
        <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-3">
          <p className="text-foreground text-xs font-medium">{t(filterTitleKey)}</p>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <Button
                type="button"
                key={item.id}
                variant={hub.targetValues.includes(item.id) ? "orange" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => hub.toggleTargetValue(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EmailHubConfigSidebar({ hub }: EmailHubConfigSidebarProps) {
  const { t } = useTranslation();
  const isSchedule = hub.sendOption === "SCHEDULE";
  const TestIcon = hub.testSending ? Spinner : SendHorizontal;
  const PublishIcon = hub.isSubmitting ? Spinner : Send;
  const publishLabelKey = isSchedule ? "admin.emailHub.confirmSchedule" : "admin.emailHub.confirmSendNow";

  return (
    <div className="space-y-6 lg:col-span-5">
      <div className="bg-card border-border space-y-4 rounded-xl border p-4">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <MailCheck className="text-brand-orange size-4" />
          <span>{t("admin.emailHub.basicInfo")}</span>
        </h3>
        <div className="space-y-1.5">
          <label htmlFor="email-hub-subject" className="text-foreground text-xs font-medium">
            {t("admin.emailHub.emailSubject")}
          </label>
          <Input
            id="email-hub-subject"
            placeholder={t("admin.emailHub.subjectPlaceholder")}
            value={hub.title}
            onChange={(event) => hub.setTitle(event.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-foreground block text-xs font-medium">{t("admin.emailHub.category")}</span>
          <SelectMenu
            ariaLabel={t("admin.emailHub.category")}
            className="w-full text-xs"
            value={hub.type}
            onChange={(value) => hub.setType(value as NotificationType)}
            options={NOTIFICATION_TYPES.map(([value, labelKey]) => ({ value, label: t(labelKey) }))}
          />
        </div>
      </div>

      <TargetAudienceCard hub={hub} />

      <div className="bg-card border-border space-y-4 rounded-xl border p-4">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Calendar className="text-brand-orange size-4" />
          <span>{t("admin.emailHub.timing")}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(["NOW", "SCHEDULE"] as const).map((option) => (
            <Button
              type="button"
              key={option}
              variant={hub.sendOption === option ? "orange" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => hub.setSendOption(option)}
            >
              {t(option === "NOW" ? "admin.emailHub.sendNow" : "admin.emailHub.schedule")}
            </Button>
          ))}
        </div>
        {isSchedule && (
          <div className="space-y-1.5 pt-1">
            <label htmlFor="email-hub-schedule-time" className="text-foreground text-xs font-medium">
              {t("admin.emailHub.selectTime")}
            </label>
            <Input
              id="email-hub-schedule-time"
              type="datetime-local"
              value={hub.scheduledAt}
              onChange={(event) => hub.setScheduledAt(event.target.value)}
              className="font-mono text-xs"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs"
            disabled={hub.testSending}
            onClick={() => void hub.handleSendTest()}
          >
            <TestIcon className="mr-1.5 size-3.5" />
            <span>{t("admin.emailHub.sendTestBtn")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              hub.setTemplateName(hub.title || "");
              hub.setSaveAsTemplateOpen(true);
            }}
          >
            <Bookmark className="mr-1.5 size-3.5" />
            <span>{t("admin.emailHub.saveTemplateBtn")}</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            disabled={hub.isSubmitting}
            onClick={() => hub.handlePublish("DRAFT")}
          >
            {t("admin.emailHub.saveDraft")}
          </Button>
          <Button
            type="button"
            variant="orange"
            className="flex-1 text-xs font-semibold"
            disabled={hub.isSubmitting || hub.hasErrors}
            onClick={() => hub.handlePublish(isSchedule ? "SCHEDULE" : "SEND_NOW")}
          >
            <PublishIcon className="mr-1.5 size-4" />
            <span>{t(publishLabelKey)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
