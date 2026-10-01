import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createEnrollment,
  readInstallationSettings,
  MonitoringAccessError,
} from "../services/monitoringService";

export function AddServer({
  onDenied,
}: {
  onDenied: (status: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("dev");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [managed, setManaged] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [invitation, setInvitation] = useState<{
    command: string;
    expiresAt: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const changeOpen = async (value: boolean) => {
    if (busy) return;
    setOpen(value);
    setInvitation(null);
    setError("");
    setCopied(false);
    if (value) {
      setSettingsReady(false);
      setBusy(true);
      try {
        const settings = await readInstallationSettings();
        setManaged(settings.managed);
        setApiBaseUrl(settings.apiBaseUrl);
        setSettingsReady(true);
      } catch (cause) {
        if (cause instanceof MonitoringAccessError) {
          setOpen(false);
          onDenied(cause.status);
        } else setError(t("monitoring.addHost.failed"));
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <>
      <Button onClick={() => changeOpen(true)} className="mb-4">
        {t("monitoring.addHost.title")}
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("monitoring.addHost.title")}</DialogTitle>
            <DialogDescription>
              {t("monitoring.addHost.description")}
            </DialogDescription>
          </DialogHeader>
          {!invitation ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                try {
                  setInvitation(
                    await createEnrollment({
                      name: name.trim(),
                      environment: environment.trim(),
                      apiBaseUrl: apiBaseUrl.trim(),
                    }),
                  );
                } catch (cause) {
                  if (cause instanceof MonitoringAccessError) {
                    setOpen(false);
                    onDenied(cause.status);
                  } else setError(t("monitoring.addHost.failed"));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="block space-y-2">
                <span>{t("monitoring.addHost.name")}</span>
                <Input
                  required
                  maxLength={255}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="EC2 monitoring"
                />
              </label>
              <label className="block space-y-2">
                <span>{t("monitoring.addHost.environment")}</span>
                <Input
                  required
                  maxLength={50}
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value)}
                />
              </label>
              <label className="block space-y-2">
                <span>{t("monitoring.addHost.apiUrl")}</span>
                <Input
                  required
                  type="url"
                  maxLength={2048}
                  value={apiBaseUrl}
                  readOnly={managed}
                  placeholder="https://api.example.com"
                  onChange={(event) => setApiBaseUrl(event.target.value)}
                />
              </label>
              <p className="text-muted-foreground text-sm">
                {t(
                  managed
                    ? "monitoring.addHost.managedUrl"
                    : "monitoring.addHost.reachability",
                )}
                {apiBaseUrl.startsWith("http://") && (
                  <span className="mt-2 block">
                    {t("monitoring.addHost.localTunnel")}
                  </span>
                )}
              </p>
              <Button
                type="submit"
                disabled={
                  busy ||
                  !settingsReady ||
                  !apiBaseUrl.trim() ||
                  !name.trim() ||
                  !environment.trim()
                }
              >
                {t(busy ? "monitoring.loading" : "monitoring.addHost.generate")}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p>{t("monitoring.addHost.run")}</p>
              <textarea
                aria-label={t("monitoring.addHost.command")}
                readOnly
                value={invitation.command}
                className="bg-muted min-h-36 w-full rounded-md border p-3 font-mono text-xs"
              />
              <p className="text-muted-foreground text-sm">
                {t("monitoring.addHost.expires", {
                  time: new Date(invitation.expiresAt).toLocaleString(
                    i18n.language,
                  ),
                })}
              </p>
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(invitation.command);
                    setCopied(true);
                    setError("");
                  } catch {
                    setError(t("monitoring.addHost.copyFailed"));
                  }
                }}
              >
                {t(
                  copied
                    ? "monitoring.addHost.copied"
                    : "monitoring.addHost.copy",
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInvitation(null);
                  setCopied(false);
                  setError("");
                }}
              >
                {t("monitoring.addHost.newCommand")}
              </Button>
              <p className="text-muted-foreground text-sm">
                {t("monitoring.addHost.polling")}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
