import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTrendSourceConfig } from "@/pages/admin/hooks/useTrendSourceConfig";
import type { TrendSourceConfig } from "@/pages/admin/types/trendSourceConfig";

const PAGE_SIZE = 10;

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
  const [rows, setRows] = useState<string[]>(
    config.sourceUrls.length > 0 ? config.sourceUrls : [""],
  );
  const [page, setPage] = useState(0);
  const [maximum, setMaximum] = useState(String(config.maxPostsPerSource));
  const [touched, setTouched] = useState(false);

  const sources = rows.map((url) => url.trim()).filter(Boolean);
  const countValid = sources.length >= 1 && sources.length <= 50;
  const limit = Number(maximum);
  const limitValid =
    maximum !== "" && Number.isInteger(limit) && limit >= 1 && limit <= 1000;
  const dirty =
    sources.join("\n") !== config.sourceUrls.join("\n") ||
    maximum !== String(config.maxPostsPerSource);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const startIndex = currentPage * PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  const updateRow = (index: number, value: string) => {
    const next = [...rows];
    next[index] = value;
    setRows(next);
    onReset();
  };

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    const updated = next.length > 0 ? next : [""];
    const nextTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
    setRows(updated);
    if (currentPage >= nextTotalPages) {
      setPage(nextTotalPages - 1);
    }
    onReset();
  };

  const addRow = () => {
    const next = [...rows, "https://www.facebook.com/"];
    setRows(next);
    setPage(Math.floor((next.length - 1) / PAGE_SIZE));
    onReset();
  };

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
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="bg-muted/20 border-border space-y-2 rounded-xl border p-3">
          {visibleRows.map((rowUrl, offset) => {
            const idx = startIndex + offset;
            return (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={rowUrl}
                  disabled={pending}
                  placeholder="https://www.facebook.com/..."
                  onChange={(e) => updateRow(idx, e.target.value)}
                  onBlur={() => setTouched(true)}
                  className="border-input bg-background focus-visible:ring-ring h-9 min-w-0 flex-1 rounded-md border px-3 font-mono text-xs outline-none focus-visible:ring-1"
                />
                <span className="border-border bg-background text-muted-foreground hidden h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium sm:inline-flex">
                  <FileCode2 className="size-3.5" />#{idx + 1}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => removeRow(idx)}
                  aria-label={`Remove URL ${idx + 1}`}
                  className="border-border bg-background text-destructive hover:bg-destructive/10 inline-flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              disabled={pending}
              onClick={addRow}
              className="bg-brand-orange hover:bg-brand-orange/90 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white transition-colors"
            >
              <Plus className="size-3.5" />
              Add
            </button>

            <div className="flex items-center gap-3">
              {totalPages > 1 && (
                <nav
                  aria-label="Facebook sources pagination"
                  className="flex items-center gap-1"
                >
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    aria-label={t("admin.crawler.previous")}
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border text-xs transition-colors disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => {
                    const isActive = idx === currentPage;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPage(idx)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-md border font-mono text-xs transition-colors",
                          isActive
                            ? "border-brand-orange/40 bg-brand-orange/15 text-brand-orange font-semibold"
                            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    aria-label={t("admin.crawler.next")}
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border text-xs transition-colors disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </nav>
              )}

              <span className="text-muted-foreground font-mono text-xs">
                {sources.length}/50 URLs
              </span>
            </div>
          </div>

          {touched && !countValid && (
            <p className="text-destructive text-xs">
              {t("admin.trendSourceConfig.sourceCountError")}
            </p>
          )}
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
                setRows(
                  config.sourceUrls.length > 0 ? config.sourceUrls : [""],
                );
                setPage(0);
                setMaximum(String(config.maxPostsPerSource));
                setTouched(false);
                onReset();
              }}
            >
              {t("admin.trendSourceConfig.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function AdminTrendSourceConfig() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [generation, setGeneration] = useState(0);
  const id = useId();
  const { query, mutation, save } = useTrendSourceConfig(open);
  const code = isAxiosError<{ error?: { code?: string } }>(mutation.error)
    ? mutation.error.response?.data?.error?.code
    : undefined;
  const stale = code === "TREND_SOURCE_CONFIG_STALE";

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-xs">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground flex w-full items-center justify-between px-1 hover:bg-transparent"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Settings2
            className="text-brand-orange size-4 shrink-0"
            aria-hidden="true"
          />
          {t("admin.trendSourceConfig.title")}
        </span>
        <ChevronDown
          className={
            open
              ? "size-4 rotate-180 transition-transform"
              : "size-4 transition-transform"
          }
          aria-hidden="true"
        />
      </Button>
      <div id={id} hidden={!open} className="space-y-3 pt-3">
        {query.isFetching && (
          <p role="status" className="text-muted-foreground text-xs">
            {t("admin.loading")}
          </p>
        )}
        {(query.isError || mutation.isError) && (
          <div
            role="alert"
            className="border-destructive/30 flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs"
          >
            <p className="text-destructive">
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
          <p role="status" className="text-xs font-medium text-emerald-600">
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
