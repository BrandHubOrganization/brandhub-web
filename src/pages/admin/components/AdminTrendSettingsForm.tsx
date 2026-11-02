import { useId, useRef, useState, type FormEvent } from "react";
import { AdminTrendSourceConfig } from "@/pages/admin/components/AdminTrendSourceConfig";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminTrendScheduleField } from "@/pages/admin/components/AdminTrendScheduleField";
import {
  threadFields,
  tiktokFields,
  type TrendSettings,
  type TrendPlatform,
} from "@/pages/admin/types/trendSettings";

export function AdminTrendSettingsForm({
  config,
  pending,
  stale,
  onSave,
}: {
  config: TrendSettings;
  pending: boolean;
  stale: boolean;
  onSave: (value: TrendSettings) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const id = useId();
  const submitting = useRef(false);
  const [draft, setDraft] = useState(config);
  const [tags, setTags] = useState(config.tiktok.hashtags.join("\n"));
  const [attempted, setAttempted] = useState(false);
  const hashtags = tags
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const validNumbers =
    threadFields.every(
      ([key, min, max]) =>
        Number.isInteger(draft.threads[key]) &&
        draft.threads[key] >= min &&
        draft.threads[key] <= max,
    ) &&
    tiktokFields.every(
      ([key, min, max]) =>
        Number.isInteger(draft.tiktok[key]) &&
        draft.tiktok[key] >= min &&
        draft.tiktok[key] <= max,
    );
  const validTags =
    hashtags.length <= 100 &&
    hashtags.every(
      (tag) =>
        tag.length <= 160 && /^#?[\p{L}\p{N}_]+(?:\s+[\p{L}_]+)?$/u.test(tag),
    ) &&
    new Set(
      hashtags.map((tag) => tag.split(/\s/)[0].replace(/^#/, "").toLowerCase()),
    ).size === hashtags.length &&
    (hashtags.length > 0 || draft.tiktok.useCreativeCenter);
  const valid =
    draft.platforms.length > 0 &&
    draft.cron.trim().split(/\s+/).length === 5 &&
    draft.cron.length <= 100 &&
    validNumbers &&
    validTags;
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(config) ||
    tags !== config.tiktok.hashtags.join("\n");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!valid || !dirty || pending || stale || submitting.current) return;
    submitting.current = true;
    void onSave({
      ...draft,
      cron: draft.cron.trim(),
      tiktok: { ...draft.tiktok, hashtags },
    })
      .catch(() => {})
      .finally(() => {
        submitting.current = false;
      });
  };
  return (
    <div className="space-y-4">
      <form noValidate onSubmit={submit}>
        <Input
          label={t("admin.crawler.timezone")}
          value={draft.timezone ?? "UTC"}
          onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
          disabled={pending}
          required
        />
        <p className="text-muted-foreground mb-3 text-xs">
          {t("admin.crawler.scheduleNotice")}
        </p>
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          <legend className="sr-only">{t("admin.trendSettings.title")}</legend>
          <div className="grid items-center gap-4 md:grid-cols-2">
            <div className="flex min-h-11 items-center gap-3">
              <Switch
                id={id + "-enabled"}
                checked={draft.enabled}
                onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}
              />
              <Label htmlFor={id + "-enabled"}>
                {t("admin.trendSettings.enabled")}
              </Label>
            </div>
            <AdminTrendScheduleField
              id={id + "-cron"}
              cron={draft.cron}
              onChange={(cron) => setDraft({ ...draft, cron })}
            />
          </div>
          <p
            id={id + "-schedule-help"}
            className="text-muted-foreground text-xs"
          >
            {t("admin.trendSettings.scheduleHelp")}
          </p>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("admin.trendSettings.platforms")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {(["facebook", "threads", "tiktok"] as TrendPlatform[]).map(
                (platform) => (
                  <Button
                    key={platform}
                    type="button"
                    className="min-h-11"
                    variant={
                      draft.platforms.includes(platform)
                        ? "secondary"
                        : "outline"
                    }
                    aria-pressed={draft.platforms.includes(platform)}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        platforms: draft.platforms.includes(platform)
                          ? draft.platforms.filter((p) => p !== platform)
                          : [...draft.platforms, platform],
                      })
                    }
                  >
                    {t(`admin.trendSettings.platform.${platform}`)}
                  </Button>
                ),
              )}
            </div>
            {attempted && !draft.platforms.length && (
              <p role="alert" className="text-destructive text-sm">
                {t("admin.trendSettings.selectPlatform")}
              </p>
            )}
          </fieldset>
        </fieldset>
      </form>
      <AdminTrendSourceConfig />
      <form noValidate onSubmit={submit} className="space-y-4">
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          <legend className="sr-only">
            {t("admin.trendSettings.platforms")}
          </legend>
          <details className="border-border rounded-lg border p-3">
            <summary className="cursor-pointer py-1 font-medium">
              {t("admin.trendSettings.threadsTitle")}
            </summary>
            <p className="text-muted-foreground py-3 text-xs">
              {t("admin.trendSettings.threadsHelp")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {threadFields.map(([key, min, max]) => (
                <Input
                  key={key}
                  id={id + "-threads-" + key}
                  type="number"
                  className="text-foreground"
                  min={min}
                  max={max}
                  step={1}
                  label={t(`admin.trendSettings.threads.${key}`)}
                  value={
                    Number.isNaN(draft.threads[key]) ? "" : draft.threads[key]
                  }
                  error={
                    attempted &&
                    (!Number.isInteger(draft.threads[key]) ||
                      draft.threads[key] < min ||
                      draft.threads[key] > max)
                      ? t("admin.trendSettings.range", { min, max })
                      : undefined
                  }
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      threads: {
                        ...draft.threads,
                        [key]:
                          e.target.value === "" ? NaN : Number(e.target.value),
                      },
                    })
                  }
                />
              ))}
            </div>
          </details>
          <details className="border-border rounded-lg border p-3">
            <summary className="cursor-pointer py-1 font-medium">
              {t("admin.trendSettings.tiktokTitle")}
            </summary>
            <div className="space-y-3 pt-3">
              <div className="flex min-h-11 items-center gap-3">
                <Switch
                  id={id + "-creative"}
                  checked={draft.tiktok.useCreativeCenter}
                  onCheckedChange={(useCreativeCenter) =>
                    setDraft({
                      ...draft,
                      tiktok: { ...draft.tiktok, useCreativeCenter },
                    })
                  }
                />
                <Label htmlFor={id + "-creative"}>
                  {t("admin.trendSettings.creativeCenter")}
                </Label>
              </div>
              <Label htmlFor={id + "-tags"}>
                {t("admin.trendSettings.hashtags")}
              </Label>
              <Textarea
                id={id + "-tags"}
                rows={5}
                maxLength={16000}
                className="text-foreground font-mono text-sm"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                aria-describedby={id + "-tags-help"}
                aria-invalid={attempted && !validTags}
              />
              <p
                id={id + "-tags-help"}
                className="text-muted-foreground text-xs"
              >
                {t("admin.trendSettings.hashtagsHelp")}
              </p>
              {attempted && !validTags && (
                <p role="alert" className="text-destructive text-sm">
                  {t("admin.trendSettings.invalidTags")}
                </p>
              )}
              <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="mb-2 text-sm font-medium">
                  {t("admin.trendSettings.period")}
                </legend>
                {[7, 30, 120].map((days) => (
                  <Button
                    type="button"
                    key={days}
                    variant={
                      draft.tiktok.periodDays === days ? "secondary" : "outline"
                    }
                    aria-pressed={draft.tiktok.periodDays === days}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        tiktok: { ...draft.tiktok, periodDays: days },
                      })
                    }
                  >
                    {t("admin.trendSettings.days", { count: days })}
                  </Button>
                ))}
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tiktokFields.map(([key, min, max]) => (
                  <Input
                    key={key}
                    id={id + "-tiktok-" + key}
                    type="number"
                    className="text-foreground"
                    min={min}
                    max={max}
                    step={1}
                    label={t(`admin.trendSettings.tiktok.${key}`)}
                    value={
                      Number.isNaN(draft.tiktok[key]) ? "" : draft.tiktok[key]
                    }
                    error={
                      attempted &&
                      (!Number.isInteger(draft.tiktok[key]) ||
                        draft.tiktok[key] < min ||
                        draft.tiktok[key] > max)
                        ? t("admin.trendSettings.range", { min, max })
                        : undefined
                    }
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tiktok: {
                          ...draft.tiktok,
                          [key]:
                            e.target.value === ""
                              ? NaN
                              : Number(e.target.value),
                        },
                      })
                    }
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.trendSettings.tiktokLimitsHelp")}
              </p>
              <div className="flex min-h-11 items-center gap-3">
                <Switch
                  id={id + "-media"}
                  checked={draft.tiktok.collectMedia}
                  onCheckedChange={(collectMedia) =>
                    setDraft({
                      ...draft,
                      tiktok: { ...draft.tiktok, collectMedia },
                    })
                  }
                />
                <Label htmlFor={id + "-media"}>
                  {t("admin.trendSettings.collectMedia")}
                </Label>
              </div>
            </div>
          </details>
        </fieldset>
        {attempted && !valid && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.trendSettings.invalid")}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="orange"
            disabled={pending || stale || !dirty}
            loading={pending}
          >
            {t("admin.trendSettings.save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !dirty}
            onClick={() => {
              setDraft(config);
              setTags(config.tiktok.hashtags.join("\n"));
              setAttempted(false);
            }}
          >
            {t("admin.trendSourceConfig.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
