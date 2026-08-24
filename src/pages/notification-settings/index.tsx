import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPreferences,
  updatePreferences,
  NOTIFICATION_TYPES,
} from "@/services/mock/mockNotificationService";
import type { NotificationPreferences } from "@/types/notification";
import { ToggleRow } from "./components/ToggleRow";
import { NotificationSettingsErrorBanner } from "./components/NotificationSettingsErrorBanner";

export function NotificationSettingsPage() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getPreferences();
        if (!cancelled) setPrefs(data);
      } catch (err) {
        console.error("Failed to load notification preferences:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!prefs) return;
    setIsSaving(true);
    try {
      const saved = await updatePreferences(prefs);
      setPrefs(saved);
      toast.success(t("notifications.settings.saveSuccess"));
    } catch (err) {
      console.error("Failed to save notification preferences:", err);
      toast.error(t("notifications.settings.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageWrapper
      title={t("notifications.settings.title")}
      description={t("notifications.settings.description")}
    >
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {isError && !isLoading && <NotificationSettingsErrorBanner />}

      {!isLoading && !isError && prefs && (
        <div className="space-y-6">
          <div className="border-border bg-card space-y-1 rounded-xl border p-4">
            <h2 className="text-foreground mb-2 text-sm font-semibold">
              {t("notifications.settings.channelsTitle")}
            </h2>
            <ToggleRow
              label={t("notifications.settings.inApp")}
              value={prefs.inApp}
              onToggle={() => setPrefs({ ...prefs, inApp: !prefs.inApp })}
            />
            <ToggleRow
              label={t("notifications.settings.email")}
              value={prefs.email}
              onToggle={() => setPrefs({ ...prefs, email: !prefs.email })}
            />
            <ToggleRow
              label={t("notifications.settings.push")}
              value={prefs.push}
              onToggle={() => setPrefs({ ...prefs, push: !prefs.push })}
            />
          </div>

          <div className="border-border bg-card space-y-1 rounded-xl border p-4">
            <h2 className="text-foreground mb-2 text-sm font-semibold">
              {t("notifications.settings.categoriesTitle")}
            </h2>
            {NOTIFICATION_TYPES.map((type) => (
              <ToggleRow
                key={type}
                label={t(`notifications.types.${type}`)}
                value={prefs.categories[type]}
                onToggle={() =>
                  setPrefs({
                    ...prefs,
                    categories: {
                      ...prefs.categories,
                      [type]: !prefs.categories[type],
                    },
                  })
                }
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              variant="orange"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
            >
              {t("notifications.settings.save")}
            </Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default NotificationSettingsPage;
