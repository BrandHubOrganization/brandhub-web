import { useId, useRef, useState, type FormEvent } from "react";
import { AdminTrendSourceConfig } from "@/pages/admin/components/AdminTrendSourceConfig";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
    <div className="space-y-5">
      <form noValidate onSubmit={submit} className="space-y-5">
        {/* Compact Top Bar: Schedule, Timezone, Platforms & Save */}
        <fieldset
          disabled={pending}
          className="border-border bg-card min-w-0 rounded-xl border p-4 shadow-xs"
        >
          <legend className="sr-only">{t("admin.trendSettings.title")}</legend>
          <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-3">
              <AdminTrendScheduleField
                id={id + "-cron"}
                cron={draft.cron}
                onChange={(cron) => setDraft({ ...draft, cron })}
              />
            </div>

            <div className="xl:col-span-3">
              <Input
                label={t("admin.crawler.timezone")}
                value={draft.timezone ?? "UTC"}
                onChange={(e) =>
                  setDraft({ ...draft, timezone: e.target.value })
                }
                disabled={pending}
                required
              />
            </div>

            <div className="space-y-1.5 xl:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">
                  {t("admin.trendSettings.platforms")}
                </span>
                <label
                  htmlFor={id + "-enabled"}
                  className="text-muted-foreground inline-flex cursor-pointer items-center gap-2 text-xs"
                >
                  <Switch
                    id={id + "-enabled"}
                    checked={draft.enabled}
                    onCheckedChange={(enabled) =>
                      setDraft({ ...draft, enabled })
                    }
                  />
                  <span>{t("admin.trendSettings.enabled")}</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["facebook", "threads", "tiktok"] as TrendPlatform[]).map(
                  (platform) => {
                    const isSelected = draft.platforms.includes(platform);
                    return (
                      <Button
                        key={platform}
                        type="button"
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-9 px-3 text-xs transition-colors",
                          isSelected &&
                            "border-brand-orange/40 bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 hover:text-brand-orange font-semibold",
                        )}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            platforms: isSelected
                              ? draft.platforms.filter((p) => p !== platform)
                              : [...draft.platforms, platform],
                          })
                        }
                      >
                        {t(`admin.trendSettings.platform.${platform}`)}
                      </Button>
                    );
                  },
                )}
              </div>
              {attempted && !draft.platforms.length && (
                <p role="alert" className="text-destructive text-xs">
                  {t("admin.trendSettings.selectPlatform")}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 xl:col-span-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9"
                disabled={pending || !dirty}
                onClick={() => {
                  setDraft(config);
                  setTags(config.tiktok.hashtags.join("\n"));
                  setAttempted(false);
                }}
              >
                {t("admin.trendSourceConfig.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="orange"
                className="h-9"
                disabled={pending || stale || !dirty}
                loading={pending}
              >
                {t("admin.trendSettings.save")}
              </Button>
            </div>
          </div>
        </fieldset>

        {/* Threads & TikTok Side-by-Side Cards (Minimal Text) */}
        <fieldset
          disabled={pending}
          className="grid min-w-0 items-stretch gap-5 xl:grid-cols-2"
        >
          <legend className="sr-only">
            {t("admin.trendSettings.platforms")}
          </legend>

          {/* Threads Card */}
          <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-xs">
            <div className="space-y-3.5">
              <div className="border-border/60 flex min-h-7 items-center justify-between border-b pb-2.5">
                <h3 className="text-sm font-semibold">
                  {t("admin.trendSettings.threadsTitle")}
                </h3>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                  Trending VN
                </span>
              </div>
              <div className="grid items-end gap-3 sm:grid-cols-2">
                {threadFields.map(([key, min, max]) => (
                  <Input
                    key={key}
                    id={id + "-threads-" + key}
                    type="number"
                    className="text-foreground"
                    wrapperClassName="justify-between"
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
                            e.target.value === ""
                              ? NaN
                              : Number(e.target.value),
                        },
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TikTok Card */}
          <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-xs">
            <div className="space-y-3.5">
              <div className="border-border/60 flex min-h-7 flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                <h3 className="text-sm font-semibold">
                  {t("admin.trendSettings.tiktokTitle")}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[7, 30, 120].map((days) => {
                    const isSelected = draft.tiktok.periodDays === days;
                    return (
                      <Button
                        type="button"
                        size="sm"
                        key={days}
                        variant="outline"
                        className={cn(
                          "h-7 px-2.5 text-xs transition-colors",
                          isSelected &&
                            "border-brand-orange/40 bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 hover:text-brand-orange font-semibold",
                        )}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            tiktok: { ...draft.tiktok, periodDays: days },
                          })
                        }
                      >
                        {t("admin.trendSettings.days", { count: days })}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <label
                  htmlFor={id + "-creative"}
                  className="border-border/70 bg-muted/20 flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  <span>{t("admin.trendSettings.creativeCenter")}</span>
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
                </label>
                <label
                  htmlFor={id + "-media"}
                  className="border-border/70 bg-muted/20 flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  <span>{t("admin.trendSettings.collectMedia")}</span>
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
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={id + "-tags"} className="text-xs font-semibold">
                    {t("admin.trendSettings.hashtags")}
                  </Label>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {hashtags.length}/100
                  </span>
                </div>
                <Textarea
                  id={id + "-tags"}
                  rows={3}
                  maxLength={16000}
                  placeholder="#dulich du_lich&#10;#amthuc am_thuc"
                  className="text-foreground font-mono text-xs"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  aria-invalid={attempted && !validTags}
                />
                {attempted && !validTags && (
                  <p role="alert" className="text-destructive text-xs">
                    {t("admin.trendSettings.invalidTags")}
                  </p>
                )}
              </div>

              <div className="grid items-end gap-3 sm:grid-cols-3">
                {tiktokFields.map(([key, min, max]) => (
                  <Input
                    key={key}
                    id={id + "-tiktok-" + key}
                    type="number"
                    className="text-foreground"
                    wrapperClassName="justify-between"
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
            </div>
          </div>
        </fieldset>

        {attempted && !valid && (
          <p role="alert" className="text-destructive text-xs">
            {t("admin.trendSettings.invalid")}
          </p>
        )}
      </form>

      <AdminTrendSourceConfig />
    </div>
  );
}
