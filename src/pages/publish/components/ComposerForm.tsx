import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { PlatformTarget } from "@/types/post";
import { PlatformTargetPicker } from "./PlatformTargetPicker";

export interface ComposerFormState {
  title: string;
  caption: string;
  hashtagsInput: string;
  mediaUrlsInput: string;
  scheduledAt: string;
  platformTargets: PlatformTarget[];
}

interface ComposerFormProps {
  state: ComposerFormState;
  onChange: (state: ComposerFormState) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ComposerForm({
  state,
  onChange,
  onSubmit,
  isSubmitting,
}: ComposerFormProps) {
  const { t } = useTranslation();

  function update<K extends keyof ComposerFormState>(
    key: K,
    value: ComposerFormState[K],
  ) {
    onChange({ ...state, [key]: value });
  }

  const canSubmit = state.title.trim() && state.platformTargets.length > 0;

  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-4">
      <Input
        label={t("publish.composer.titleLabel")}
        value={state.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder={t("publish.composer.titlePlaceholder")}
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide">
          {t("publish.composer.captionLabel")}
        </label>
        <Textarea
          value={state.caption}
          onChange={(e) => update("caption", e.target.value)}
          placeholder={t("publish.composer.captionPlaceholder")}
          className="min-h-24 text-xs"
        />
      </div>

      <Input
        label={t("publish.composer.hashtagsLabel")}
        value={state.hashtagsInput}
        onChange={(e) => update("hashtagsInput", e.target.value)}
        placeholder={t("publish.composer.hashtagsPlaceholder")}
      />

      <Input
        label={t("publish.composer.mediaUrlsLabel")}
        value={state.mediaUrlsInput}
        onChange={(e) => update("mediaUrlsInput", e.target.value)}
        placeholder={t("publish.composer.mediaUrlsPlaceholder")}
      />

      <Input
        type="datetime-local"
        label={t("publish.composer.scheduleLabel")}
        value={state.scheduledAt}
        onChange={(e) => update("scheduledAt", e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide">
          {t("publish.composer.platformsLabel")}
        </label>
        <PlatformTargetPicker
          targets={state.platformTargets}
          onChange={(platformTargets) => update("platformTargets", platformTargets)}
        />
      </div>

      <Button
        variant="orange"
        className="w-full gap-1.5 text-xs"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
      >
        <Send className="size-3.5" />
        {isSubmitting
          ? t("publish.composer.submitting")
          : state.scheduledAt
            ? t("publish.composer.schedule")
            : t("publish.composer.saveDraft")}
      </Button>
    </div>
  );
}
