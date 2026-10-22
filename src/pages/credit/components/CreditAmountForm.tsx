import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, RotateCcw, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { HelpHint } from "@/components/shared/HelpHint";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useCreditEditor } from "@/pages/credit/hooks/useCreditEditor";
import type { CreditEditorOptions } from "@/pages/credit/hooks/useCreditEditor";
import { cn } from "@/lib/utils";

export interface CreditPreset {
  label: string;
  value: number;
}

interface Props extends CreditEditorOptions {
  title: string;
  description: string;
  revision: number;
  price?: boolean;
  presets?: CreditPreset[];
}

export function CreditAmountForm(props: Props) {
  const { t } = useTranslation();
  const editor = useCreditEditor(props);
  const id = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const unsafe =
    !Number.isSafeInteger(props.revision) ||
    (props.initial !== null && !Number.isSafeInteger(props.initial));

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editor.pending || editor.stale || unsafe) return;
    if (!editor.validate()) return;

    if (props.presets && props.presets.length > 0) {
      setConfirmOpen(true);
    } else {
      void editor.submit();
    }
  };

  return (
    <>
      <form
        noValidate
        aria-label={props.title}
        className="bg-card border-border/70 space-y-4 rounded-2xl border p-5 sm:p-6 shadow-xs"
        onSubmit={handleFormSubmit}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <Sliders className="size-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {props.title}
            </h2>
          </div>
          <HelpHint label={props.title}>{props.description}</HelpHint>
        </div>

        <fieldset disabled={editor.pending || unsafe} className="space-y-3.5">
          <div>
            <Input
              label={t(props.price ? "credit.price.amount" : "credit.limit")}
              inputMode="numeric"
              required
              value={editor.value}
              onChange={(event) => editor.setValue(event.target.value)}
              onBlur={editor.validate}
              aria-describedby={`${id}-hint`}
              error={
                editor.error === "credit.errors.integer"
                  ? t(editor.error)
                  : undefined
              }
              className="font-mono text-base font-medium tabular-nums"
            />
            <p id={`${id}-hint`} className="text-muted-foreground text-xs mt-1.5">
              {t(props.price ? "credit.zeroPriceHint" : "credit.zeroHint")}
            </p>
          </div>

          {/* Quick Presets selector if provided */}
          {props.presets && props.presets.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-medium text-muted-foreground">
                {t("credit.presets.quickSelect", "Chọn nhanh hạn mức:")}
              </span>
              <div className="flex flex-wrap gap-2">
                {props.presets.map((preset) => {
                  const isCurrent = editor.value === String(preset.value);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={editor.pending || unsafe}
                      onClick={() => {
                        editor.setValue(String(preset.value));
                        editor.validate();
                      }}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border tabular-nums",
                        isCurrent
                          ? "border-brand-orange bg-brand-orange/15 text-brand-orange font-bold ring-1 ring-brand-orange/30 shadow-xs"
                          : "border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {props.price && (
            <div className="space-y-1 text-sm">
              <label htmlFor={`${id}-enabled`}>
                {t("credit.price.status")}
              </label>
              <Select
                id={`${id}-enabled`}
                value={String(editor.enabled)}
                onChange={(event) =>
                  editor.setEnabled(event.target.value === "true")
                }
              >
                <option value="true">{t("credit.price.enabled")}</option>
                <option value="false">{t("credit.price.disabled")}</option>
              </Select>
            </div>
          )}
        </fieldset>

        {unsafe && (
          <p role="alert" className="text-destructive text-sm font-medium">
            {t("credit.errors.unsafe")}
          </p>
        )}
        {editor.error && editor.error !== "credit.errors.integer" && (
          <p role="alert" className="text-destructive text-sm font-medium">
            {t(editor.error)}
          </p>
        )}
        {editor.saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Check className="size-3.5" />
            <span>{t("credit.saved")}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="orange"
              size="sm"
              loading={editor.pending}
              disabled={editor.pending || editor.stale || unsafe}
              className="cursor-pointer"
            >
              {t("credit.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={editor.pending}
              onClick={() => void editor.reload()}
              className="cursor-pointer text-xs"
            >
              <RotateCcw className="mr-1 size-3.5" />
              {t("credit.reload")}
            </Button>
          </div>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {t("credit.revision", { revision: props.revision })}
          </span>
        </div>
      </form>

      {/* Confirmation Dialog for safe limit updates */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await editor.submit();
        }}
        variant="warning"
        title={t("credit.presets.confirmTitle", "Xác nhận cập nhật hạn mức")}
        description={t(
          "credit.presets.confirmDesc",
          `Bạn có chắc chắn muốn cập nhật hạn mức credit thành ${editor.value} credits/kỳ?`,
          { amount: editor.value },
        )}
        confirmText={t("credit.save")}
        cancelText={t("common.cancel", "Hủy")}
        isLoading={editor.pending}
      />
    </>
  );
}
