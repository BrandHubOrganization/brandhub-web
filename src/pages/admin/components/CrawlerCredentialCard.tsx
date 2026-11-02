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
      className="border-border bg-card space-y-3 rounded-xl border p-4"
      aria-labelledby={id + "-title"}
    >
      <h3 id={id + "-title"} className="font-semibold">
        {t(`admin.crawler.credentialKinds.${item.kind}`)}
      </h3>
      <p className="text-muted-foreground text-sm">
        {t(`admin.crawler.credentialStates.${item.status}`, {
          defaultValue: t("admin.crawler.checkUnavailable"),
        })}
      </p>
      {item.updatedAt && (
        <p className="text-muted-foreground text-xs">
          {t("admin.crawler.updatedAt")}:{" "}
          {new Date(item.updatedAt * 1000).toLocaleString()}
        </p>
      )}
      {item.checkedAt && (
        <p className="text-muted-foreground text-xs">
          {t("admin.crawler.checkedAt")}:{" "}
          {new Date(item.checkedAt * 1000).toLocaleString()} ·{" "}
          {t(`admin.crawler.codes.${item.probeCode}`, {
            defaultValue: t("admin.crawler.checkUnavailable"),
          })}
        </p>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void act("save");
        }}
      >
        <fieldset disabled={pending || !storageReady} className="space-y-3">
          {isSession ? (
            <div className="space-y-2">
              <label htmlFor={id + "-file"} className="text-sm font-medium">
                {t("admin.crawler.sessionFile")}
              </label>
              <input
                ref={file}
                id={id + "-file"}
                className="border-input w-full rounded-md border p-2 text-sm"
                type="file"
                accept="application/json,.json"
                required
                aria-describedby={id + "-help"}
              />
            </div>
          ) : (
            <>
              <Input
                ref={endpoint}
                id={id + "-endpoint"}
                type="password"
                autoComplete="off"
                required
                label={t("admin.crawler.endpoint")}
              />
              {item.kind === "tiktok" && (
                <Input
                  ref={key}
                  id={id + "-key"}
                  type="password"
                  autoComplete="off"
                  required
                  label={t("admin.crawler.apiKey")}
                />
              )}
            </>
          )}
          <p id={id + "-help"} className="text-muted-foreground text-xs">
            {t(
              isSession
                ? "admin.crawler.sessionHelp"
                : "admin.crawler.connectionHelp",
            )}
          </p>
          <Button type="submit" variant="outline" loading={pending}>
            {t("admin.crawler.replace")}
          </Button>
        </fieldset>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={pending || !item.configured}
          onClick={() => void act("probe")}
        >
          {t("admin.crawler.probe")}
        </Button>
        <Button
          variant="outline"
          disabled={pending || !item.configured}
          onClick={() => setRevoke(true)}
        >
          {t("admin.crawler.revoke")}
        </Button>
      </div>
      {feedback && (
        <p
          role={
            feedback === "failed" || feedback === "oversize"
              ? "alert"
              : "status"
          }
          className="text-sm"
        >
          {t(`admin.crawler.feedback.${feedback}`)}
        </p>
      )}
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
            <Button disabled={pending} onClick={() => void act("revoke")}>
              {t("admin.crawler.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
