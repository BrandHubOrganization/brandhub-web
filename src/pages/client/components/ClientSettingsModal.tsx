import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, UserPlus, Trash2, ShieldCheck } from "lucide-react";
import type {
  Client,
  ClientContact,
  ClientContactRole,
  ClientPreferences,
  UpdateClientSettingsDTO,
} from "../types/client";

interface ClientSettingsModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateClientSettingsDTO) => Promise<void>;
}

const CONTACT_ROLES: ClientContactRole[] = [
  "MARKETING_LEAD",
  "APPROVER",
  "FINANCE",
  "LEGAL",
];

const DEFAULT_PREFERENCES: ClientPreferences = {
  notifyOnNewRequest: true,
  notifyOnPublish: true,
  requireClientApprovalBeforePublish: false,
  preferredLanguage: "vi",
};

export function ClientSettingsModal({
  isOpen,
  client,
  onClose,
  onSubmit,
}: ClientSettingsModalProps) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [preferences, setPreferences] =
    useState<ClientPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setContacts(client.contacts ?? []);
      setPreferences(client.preferences ?? DEFAULT_PREFERENCES);
    }
  }, [client]);

  function addContact() {
    setContacts((prev) => [
      ...prev,
      {
        id: `ct-new-${Date.now()}`,
        name: "",
        email: "",
        role: "MARKETING_LEAD",
        canApproveContent: false,
      },
    ]);
  }

  function updateContact(id: string, patch: Partial<ClientContact>) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function removeContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setIsSaving(true);
    try {
      await onSubmit(client.id, { contacts, preferences });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Settings2 className="text-brand-orange size-4" />
            {t("client.settings.modalTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {client && (
            <div className="bg-muted/40 space-y-1 rounded-lg p-3 text-xs">
              <span className="text-muted-foreground block">
                {t("client.settings.appliedBrand")}
              </span>
              <strong className="text-foreground text-sm font-bold">
                {client.name}
              </strong>
            </div>
          )}

          {/* Contact roles within the client's business */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                {t("client.settings.contactsLabel")}
              </Label>
              <button
                type="button"
                onClick={addContact}
                className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs text-muted-foreground flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors"
              >
                <UserPlus className="size-3.5" />
                {t("client.settings.addContact")}
              </button>
            </div>

            {contacts.length === 0 && (
              <p className="text-muted-foreground text-2xs italic">
                {t("client.settings.contactsEmpty")}
              </p>
            )}

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border-border grid grid-cols-1 gap-2 rounded-lg border p-2.5 sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <Input
                    value={contact.name}
                    onChange={(e) =>
                      updateContact(contact.id, { name: e.target.value })
                    }
                    placeholder={t("client.settings.contactNamePlaceholder")}
                    className="text-xs"
                  />
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      updateContact(contact.id, { email: e.target.value })
                    }
                    placeholder={t("client.settings.contactEmailPlaceholder")}
                    className="text-xs"
                  />
                  <select
                    value={contact.role}
                    onChange={(e) =>
                      updateContact(contact.id, {
                        role: e.target.value as ClientContactRole,
                      })
                    }
                    className="border-border bg-card text-foreground text-2xs rounded-lg border px-2"
                  >
                    {CONTACT_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {t(`client.settings.role.${role}`)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title={t("client.settings.canApproveToggle")}
                      onClick={() =>
                        updateContact(contact.id, {
                          canApproveContent: !contact.canApproveContent,
                        })
                      }
                      className={`flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                        contact.canApproveContent
                          ? "bg-brand-orange-soft text-brand-orange"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <ShieldCheck className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeContact(contact.id)}
                      className="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-950/40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences distinct per client */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              {t("client.settings.preferencesLabel")}
            </Label>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnNewRequest}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifyOnNewRequest: e.target.checked,
                    }))
                  }
                  className="accent-brand-orange size-3.5"
                />
                {t("client.settings.notifyOnNewRequest")}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnPublish}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifyOnPublish: e.target.checked,
                    }))
                  }
                  className="accent-brand-orange size-3.5"
                />
                {t("client.settings.notifyOnPublish")}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={preferences.requireClientApprovalBeforePublish}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      requireClientApprovalBeforePublish: e.target.checked,
                    }))
                  }
                  className="accent-brand-orange size-3.5"
                />
                {t("client.settings.requireApproval")}
              </label>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold">
                {t("client.settings.languageLabel")}
              </Label>
              <div className="flex gap-2">
                {(["vi", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        preferredLanguage: lang,
                      }))
                    }
                    className={`text-2xs cursor-pointer rounded-lg border px-3 py-1.5 font-semibold transition-colors ${
                      preferences.preferredLanguage === lang
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer text-xs"
            >
              {t("client.settings.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white"
            >
              {isSaving
                ? t("client.settings.saving")
                : t("client.settings.saveButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
