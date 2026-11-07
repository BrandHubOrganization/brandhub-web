import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export function CampaignInlineField({
  field,
  label,
  value,
  version,
  busy,
  disabled,
  type = "text",
  onSave,
  onDirty,
  className,
  hideLabel = false,
}: {
  field: string;
  label: string;
  value: string;
  version: number;
  busy: boolean;
  disabled?: boolean;
  type?: "text" | "date" | "textarea";
  onSave: (value: string, version: number) => Promise<unknown>;
  onDirty: (key: string, dirty: boolean) => void;
  className?: string;
  hideLabel?: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  const changed = useRef(false);
  const began = useRef(version);
  const [editOrigin, setEditOrigin] = useState({ version, value });
  useEffect(() => {
    if (!changed.current) setDraft(value);
  }, [value]);
  useEffect(() => () => onDirty(field, false), [field, onDirty]);
  async function save(next: string) {
    if (next === value && !error) {
      changed.current = false;
      onDirty(field, false);
      return;
    }
    try {
      await onSave(next, began.current);
      setError(false);
      changed.current = false;
      onDirty(field, false);
    } catch {
      setError(true);
    }
  }
  const props = {
    value: draft,
    disabled: disabled || busy,
    "aria-label": label,
    "aria-invalid": error,
    onFocus: () => {
      if (!changed.current) {
        began.current = version;
        setEditOrigin({ version, value });
      }
    },
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setDraft(event.target.value);
      changed.current = true;
      onDirty(field, true);
    },
    onBlur: () => {
      if (changed.current) void save(draft);
    },
    className,
  };
  return (
    <div className="min-w-0">
      <label
        className={
          hideLabel ? "sr-only" : "text-muted-foreground mb-1 block text-[11px]"
        }
      >
        {label}
      </label>
      {type === "textarea" ? (
        <Textarea {...props} rows={3} />
      ) : (
        <Input
          {...props}
          type={type}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      )}
      {error && (
        <div
          role="alert"
          className="text-destructive mt-1 flex items-center gap-2 text-xs"
        >
          <span>
            {t("campaign.timeline.unsaved")}
            {editOrigin.version !== version && editOrigin.value !== value && (
              <span className="block">
                {t("campaign.timeline.currentServerValue", { value })}
              </span>
            )}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              began.current = version;
              void save(draft);
            }}
          >
            {t("campaign.timeline.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
