import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RichTextContent,
  RichTextInput,
} from "@/components/ui/rich-text-input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { Label } from "@/components/ui/label";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";

interface Props {
  id: string;
  label: string;
  value: string;
  displayValue?: string;
  placeholder?: string;
  editable: boolean;
  save: (value: string) => Promise<unknown>;
  retry: () => void;
  options?: SelectMenuOption[];
  multiline?: boolean;
  type?: "text" | "datetime-local";
  min?: string;
  max?: string;
  required?: boolean;
  maxLength?: number;
}
export function InlineTaskField(props: Props) {
  const { t } = useTranslation();
  const field = useInlineTaskField(props.id, props.value, props.save);
  const [editing, setEditing] = useState(false);
  const pending = field.status === "saving";
  const discard = () => {
    field.discard();
    props.retry();
    setEditing(false);
  };
  async function blur(element: HTMLInputElement | HTMLTextAreaElement) {
    if (field.status === "error") return;
    if (!element.checkValidity()) {
      field.invalid();
      return;
    }
    if (await field.commit()) setEditing(false);
  }
  const events = {
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => field.change(event.target.value),
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      void blur(event.currentTarget),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!pending) discard();
      }
      if (event.key === "Enter" && !props.multiline) {
        event.preventDefault();
        (event.target as HTMLElement).blur();
      }
    },
  };
  return (
    <div className="min-w-0 space-y-1.5" aria-busy={pending}>
      {props.label ? (
        <Label htmlFor={props.id} className="text-muted-foreground text-xs">
          {props.label}
        </Label>
      ) : null}
      {editing && props.editable ? (
        <>
          {props.options ? (
            <SelectMenu
              ariaLabel={props.label}
              value={field.value}
              disabled={pending}
              options={props.options}
              className="w-full"
              onChange={(next) => {
                field.change(next);
                void field.commit(next).then((saved) => {
                  if (saved) setEditing(false);
                });
              }}
            />
          ) : props.multiline ? (
            <div className="space-y-2">
              <RichTextInput
                id={props.id}
                value={field.value}
                placeholder={props.placeholder}
                disabled={pending}
                aria-invalid={Boolean(field.error)}
                aria-describedby={`${props.id}-feedback`}
                onChange={(html) => field.change(html)}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={discard}
                  className="h-7 px-2.5 text-xs"
                >
                  {t("tasks.inline.discard", { defaultValue: "Hủy" })}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="orange"
                  disabled={pending}
                  onClick={() => {
                    if (props.required && !field.value.replace(/<[^>]*>/g, "").trim()) {
                      field.invalid();
                      return;
                    }
                    void field.commit().then((saved) => {
                      if (saved) setEditing(false);
                    });
                  }}
                  className="h-7 px-3 text-xs"
                >
                  {t("common.save", { defaultValue: "Lưu" })}
                </Button>
              </div>
            </div>
          ) : (
            <Input
              id={props.id}
              name={props.id}
              value={field.value}
              type={props.type || "text"}
              placeholder={props.placeholder}
              required={props.required}
              maxLength={props.maxLength}
              readOnly={pending}
              autoFocus
              min={props.min}
              max={props.max}
              aria-invalid={Boolean(field.error)}
              aria-describedby={`${props.id}-feedback`}
              {...events}
            />
          )}
        </>
      ) : props.editable ? (
        <Button
          variant="ghost"
          className="h-auto min-h-9 w-full justify-start px-2 text-left font-normal whitespace-normal"
          aria-label={t("tasks.inline.edit", { field: props.label })}
          onClick={() => setEditing(true)}
        >
          {props.multiline && props.value ? (
            <RichTextContent value={props.value} className="w-full text-sm" />
          ) : (
            <span className="min-w-0 break-words whitespace-pre-wrap">
              {props.displayValue || props.value || props.placeholder || t("tasks.inline.empty")}
            </span>
          )}
        </Button>
      ) : props.multiline && props.value ? (
        <div className="py-2 text-sm">
          <RichTextContent value={props.value} />
        </div>
      ) : (
        <p className="py-2 text-sm break-words whitespace-pre-wrap">
          {props.displayValue || props.value || props.placeholder || t("tasks.missing")}
        </p>
      )}
      <div id={`${props.id}-feedback`} aria-live="polite" className="text-xs">
        {field.error ? (
          <div role="alert" className="text-destructive space-y-1">
            <p>{field.error}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  props.retry();
                  void field.commit().then((saved) => {
                    if (saved) setEditing(false);
                  });
                }}
              >
                {t("tasks.retry")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={discard}
              >
                {t("tasks.inline.discard")}
              </Button>
            </div>
          </div>
        ) : field.status === "saving" ? (
          <span>{t("tasks.inline.saving")}</span>
        ) : null}
      </div>
    </div>
  );
}
