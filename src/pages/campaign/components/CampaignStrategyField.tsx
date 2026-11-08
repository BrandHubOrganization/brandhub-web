import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CampaignStrategyInput } from "@/pages/campaign/components/CampaignStrategyInput";

export interface CampaignStrategyHandle {
  save: () => void;
}

export function CampaignStrategyField({
  value,
  version,
  busy,
  disabled,
  onDirty,
  onSave,
  ref,
}: {
  value: string;
  version: number;
  busy: boolean;
  disabled: boolean;
  onDirty: (key: string, dirty: boolean) => void;
  onSave: (value: string, version: number) => Promise<unknown>;
  ref?: Ref<CampaignStrategyHandle>;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  const dirty = useRef(false);
  const [origin, setOrigin] = useState({ value, version });
  const focused = useRef(false);
  const pending = useRef(false);
  const skipCloseBlur = useRef(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty.current) setDraft(value);
  }, [value]);
  useEffect(
    () => () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
      onDirty("strategy", false);
    },
    [onDirty],
  );
  async function save(targetVersion = origin.version) {
    if (
      !dirty.current ||
      pending.current ||
      busy ||
      disabled ||
      draft.length > 10000
    )
      return;
    pending.current = true;
    try {
      await onSave(draft, targetVersion);
      dirty.current = false;
      onDirty("strategy", false);
      setError(false);
    } catch {
      setError(true);
    } finally {
      pending.current = false;
    }
  }
  useImperativeHandle(ref, () => ({
    save: () => {
      skipCloseBlur.current = true;
      if (blurTimer.current) clearTimeout(blurTimer.current);
      void save();
    },
  }));
  return (
    <div className="space-y-2">
      <CampaignStrategyInput
        value={draft}
        disabled={busy || disabled}
        onFocus={() => {
          skipCloseBlur.current = false;
          focused.current = true;
          if (!dirty.current) setOrigin({ value, version });
        }}
        onBlur={() => {
          focused.current = false;
          if (skipCloseBlur.current) {
            skipCloseBlur.current = false;
            return;
          }
          if (blurTimer.current) clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(() => {
            if (!focused.current) void save();
          }, 0);
        }}
        onChange={(next) => {
          setDraft(next);
          dirty.current = true;
          onDirty("strategy", true);
        }}
      />
      {draft.length > 10000 && (
        <p role="alert" className="text-destructive text-xs">
          {t("campaign.timeline.strategyTooLong")}
        </p>
      )}
      {error && (
        <div role="alert" className="text-destructive space-y-1 text-xs">
          <p>{t("campaign.timeline.unsaved")}</p>
          {origin.version !== version && origin.value !== value && (
            <p>{t("campaign.timeline.strategyConflict")}</p>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={busy || disabled}
            onClick={() => {
              setOrigin({ value, version });
              void save(version);
            }}
          >
            {t("campaign.timeline.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
