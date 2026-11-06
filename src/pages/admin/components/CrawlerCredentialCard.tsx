import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import type { CredentialMetadata } from "@/pages/admin/types/crawlerManagement";

export function CrawlerCredentialCard({
  item,
  storageReady,
}: {
  item: CredentialMetadata;
  storageReady: boolean;
}) {
  const { t } = useTranslation();
  const id = useId();
  const client = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const endpoint = useRef<HTMLInputElement>(null);
  const key = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<
    "saved" | "failed" | "oversize" | "checked" | "revoked" | null
  >(null);
  const [revoke, setRevoke] = useState(false);
  const isSession = item.kind === "facebook" || item.kind === "threads";

  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["admin", "crawler-credentials"] }),
      client.invalidateQueries({ queryKey: ["admin", "crawler-health"] }),
      client.invalidateQueries({ queryKey: ["admin", "ai", "trend-pipeline"] }),
    ]);

  async function act(action: "save" | "probe" | "revoke") {
    if (pending) return;
    setFeedback(null);
    setPending(true);
    try {
      if (action === "save") {
        if (isSession) {
          const selected = file.current?.files?.[0];
          if (!selected) throw new Error();
          if (selected.size > 1024 * 1024) {
            setFeedback("oversize");
            return;
          }
          const session: unknown = JSON.parse(await selected.text());
          await service.replace(item.kind, {
            revision: item.revision,
            session,
          });
        } else {
          await service.replace(item.kind, {
            revision: item.revision,
            endpoint: endpoint.current?.value ?? "",
            ...(item.kind === "tiktok"
              ? { apiKey: key.current?.value ?? "" }
              : {}),
          });
        }
        setFeedback("saved");
      } else {
        await service.credentialAction(item.kind, action, item.revision);
        setFeedback(action === "probe" ? "checked" : "revoked");
      }
      if (file.current) file.current.value = "";
      if (endpoint.current) endpoint.current.value = "";
      if (key.current) key.current.value = "";
      setRevoke(false);
      await refresh();
    } catch {
      setFeedback("failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id={`crawler-credential-${item.kind}`}
      className="border-border bg-card flex h-full flex-col justify-between gap-2.5 rounded-xl border p-3.5 shadow-xs"
      aria-labelledby={id + "-title"}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id={id + "-title"} className="text-sm font-medium">
            {t(`admin.crawler.credentialKinds.${item.kind}`)}
          </h3>
          <span className="bg-muted/60 border-border/60 text-muted-foreground rounded-md border px-2 py-0.5 text-xs font-medium">
            {t(`admin.crawler.credentialStates.${item.status}`, {
              defaultValue: t("admin.crawler.checkUnavailable"),
            })}
          </span>
        </div>

        {(item.updatedAt || item.checkedAt) && (
          <div className="bg-muted/30 border-border/50 space-y-0.5 rounded-lg border px-2.5 py-1.5 text-xs">
            {item.updatedAt && (
              <p className="text-muted-foreground">
                {t("admin.crawler.updatedAt")}:{" "}
                {new Date(item.updatedAt * 1000).toLocaleString()}
              </p>
            )}
            {item.checkedAt && (
              <p className="text-muted-foreground">
                {t("admin.crawler.checkedAt")}:{" "}
                {new Date(item.checkedAt * 1000).toLocaleString()} ·{" "}
                {t(`admin.crawler.codes.${item.probeCode}`, {
                  defaultValue: t("admin.crawler.checkUnavailable"),
                })}
              </p>
            )}
          </div>
        )}

        <form
          id={id + "-form"}
          onSubmit={(event) => {
            event.preventDefault();
            void act("save");
          }}
        >
          {isSession ? (
            <input
              ref={file}
              id={id + "-file"}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              disabled={pending || !storageReady}
              aria-label={t("admin.crawler.sessionFile")}
              onChange={() => {
                if (file.current?.files?.length) {
                  void act("save");
                }
              }}
            />
          ) : (
            <fieldset
              disabled={pending || !storageReady}
              className="space-y-2"
            >
              {!storageReady && (
                <p className="text-muted-foreground text-xs">
                  {t("admin.crawler.connectionKeyRequired")}
                </p>
              )}
              <div
                className={
                  item.kind === "tiktok"
                    ? "grid items-end gap-2 sm:grid-cols-2"
                    : "space-y-2"
                }
              >
                <Input
                  ref={endpoint}
                  id={id + "-endpoint"}
                  type="password"
                  autoComplete="off"
                  required
                  className="h-8 text-xs"
                  label={t("admin.crawler.endpoint")}
                />
                {item.kind === "tiktok" && (
                  <Input
                    ref={key}
                    id={id + "-key"}
                    type="password"
                    autoComplete="off"
                    required
                    className="h-8 text-xs"
                    label={t("admin.crawler.apiKey")}
                  />
                )}
              </div>
            </fieldset>
          )}
        </form>

        {feedback && (
          <p
            role={
              feedback === "failed" || feedback === "oversize"
                ? "alert"
                : "status"
            }
            className="text-xs font-medium"
          >
            {t(`admin.crawler.feedback.${feedback}`)}
          </p>
        )}
      </div>

      <div className="border-border/60 flex flex-wrap items-center gap-1.5 border-t pt-2.5">
        {isSession ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            disabled={pending || !storageReady}
            loading={pending}
            onClick={() => {
              if (file.current?.files?.length) {
                void act("save");
              } else {
                file.current?.click();
              }
            }}
          >
            {t("admin.crawler.replace")}
          </Button>
        ) : (
          <Button
            type="submit"
            form={id + "-form"}
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            disabled={pending || !storageReady}
            loading={pending}
          >
            {t("admin.crawler.replace")}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={pending || !item.configured}
          onClick={() => void act("probe")}
        >
          {t("admin.crawler.probe")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto h-7 px-2.5 text-xs"
          disabled={pending || !item.configured}
          onClick={() => setRevoke(true)}
        >
          {t("admin.crawler.revoke")}
        </Button>
      </div>

      <Dialog
        open={revoke}
        onOpenChange={(open) => {
          if (!pending) setRevoke(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.crawler.revoke")}</DialogTitle>
            <DialogDescription>
              {t("admin.crawler.revokeDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setRevoke(false)}
            >
              {t("admin.crawler.cancel")}
            </Button>
            <Button
              variant="destructive"
              loading={pending}
              disabled={pending}
              onClick={() => void act("revoke")}
            >
              {t("admin.crawler.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
