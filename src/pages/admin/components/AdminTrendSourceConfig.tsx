import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { ChevronDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTrendSourceConfig } from "@/pages/admin/hooks/useTrendSourceConfig";
import type { TrendSourceConfig } from "@/pages/admin/types/trendSourceConfig";

type FormProps = {
  config: TrendSourceConfig;
  pending: boolean;
  stale: boolean;
  onSave: (config: TrendSourceConfig) => Promise<void>;
  onReset: () => void;
};

function SourceConfigForm({
  config,
  pending,
  stale,
  onSave,
  onReset,
}: FormProps) {
  const { t } = useTranslation();
  const id = useId();
  const [text, setText] = useState(config.sourceUrls.join("\n"));
  const [maximum, setMaximum] = useState(String(config.maxPostsPerSource));
  const [touched, setTouched] = useState(false);
  const sources = text
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  const countValid = sources.length >= 1 && sources.length <= 50;
  const limit = Number(maximum);
  const limitValid =
    maximum !== "" && Number.isInteger(limit) && limit >= 1 && limit <= 1000;
  const dirty =
    text !== config.sourceUrls.join("\n") ||
    maximum !== String(config.maxPostsPerSource);
  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (countValid && limitValid && dirty && !pending && !stale) {
          void onSave({
            revision: config.revision,
            sourceUrls: sources,
            maxPostsPerSource: limit,
          }).catch(() => {});
        }
      }}
    >
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="space-y-1.5">
          <Label htmlFor={id + "-urls"}>
            {t("admin.trendSourceConfig.sources")}
          </Label>
          <Textarea
            id={id + "-urls"}
            value={text}
            rows={6}
            maxLength={16000}
            className="text-foreground resize-y font-mono text-sm"
            disabled={pending}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            aria-describedby={id + "-help " + id + "-source-error"}
            aria-invalid={touched && !countValid}
            onChange={(event) => {
              setText(event.target.value);
              onReset();
            }}
            onBlur={() => setTouched(true)}
          />
          <p id={id + "-help"} className="text-muted-foreground text-xs">
            {t("admin.trendSourceConfig.sourceHelp")}
          </p>
          <p id={id + "-source-error"} className="text-destructive text-xs">
            {touched && !countValid
              ? t("admin.trendSourceConfig.sourceCountError")
              : null}
          </p>
        </div>
        <div className="space-y-3">
          <Input
            id={id + "-maximum"}
            type="number"
            className="text-foreground"
            min={1}
            max={1000}
            step={1}
            label={t("admin.trendSourceConfig.maximum")}
            value={maximum}
            disabled={pending}
            error={
              touched && !limitValid
                ? t("admin.trendSourceConfig.limitError")
                : undefined
            }
            onChange={(event) => {
              setMaximum(event.target.value);
              onReset();
            }}
            onBlur={() => setTouched(true)}
          />
          <p aria-live="polite" className="bg-muted/40 rounded-lg p-3 text-sm">
            {t("admin.trendSourceConfig.total", {
              count: sources.length,
              total: countValid && limitValid ? sources.length * limit : "—",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          size="sm"
          variant="orange"
          loading={pending}
          disabled={pending || !dirty || stale}
        >
          {t("admin.trendSourceConfig.save")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !dirty}
          onClick={() => {
            setText(config.sourceUrls.join("\n"));
            setMaximum(String(config.maxPostsPerSource));
            setTouched(false);
            onReset();
          }}
        >
          {t("admin.trendSourceConfig.cancel")}
        </Button>
      </div>
    </form>
  );
}

export function AdminTrendSourceConfig() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [generation, setGeneration] = useState(0);
  const id = useId();
  const { query, mutation, save } = useTrendSourceConfig(open);
  const code = isAxiosError<{ error?: { code?: string } }>(mutation.error)
    ? mutation.error.response?.data?.error?.code
    : undefined;
  const stale = code === "TREND_SOURCE_CONFIG_STALE";
  return (
    <div className="border-border rounded-lg border p-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground max-w-full"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <Settings2 className="size-4 shrink-0" aria-hidden="true" />
        {t("admin.trendSourceConfig.title")}
        <ChevronDown
          className={open ? "size-4 rotate-180" : "size-4"}
          aria-hidden="true"
        />
      </Button>
      <div id={id} hidden={!open} className="space-y-3 pt-3">
        <p className="text-muted-foreground text-xs">
          {t("admin.trendSourceConfig.appliesNext")}
        </p>
        {query.isFetching && (
          <p role="status" className="text-muted-foreground text-sm">
            {t("admin.loading")}
          </p>
        )}
        {(query.isError || mutation.isError) && (
          <div
            role="alert"
            className="border-destructive/30 space-y-2 rounded-lg border p-3 text-sm"
          >
            <p>
              {t(
                stale
                  ? "admin.trendSourceConfig.stale"
                  : code === "TREND_SOURCE_CONFIG_INVALID"
                    ? "admin.trendSourceConfig.invalid"
                    : "admin.trendSourceConfig.error",
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={query.isFetching || mutation.isPending}
              onClick={() => {
                void query.refetch().then((result) => {
                  if (result.isSuccess) {
                    mutation.reset();
                    setGeneration((value) => value + 1);
                  }
                });
              }}
            >
              {t("admin.trendSourceConfig.reload")}
            </Button>
          </div>
        )}
        {mutation.isSuccess && (
          <p role="status" className="text-sm">
            {t("admin.trendSourceConfig.saved")}
          </p>
        )}
        {query.data && !query.isFetching && (
          <SourceConfigForm
            key={query.data.revision + ":" + generation}
            config={query.data}
            pending={mutation.isPending}
            stale={stale}
            onSave={save}
            onReset={() => {
              if (!stale) mutation.reset();
            }}
          />
        )}
      </div>
    </div>
  );
}
