import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BadgeCheck,
  Camera,
  FileCheck2,
  IdCard,
  TriangleAlert,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfilePage() {
  const { t } = useTranslation();
  const [name, setName] = useState("Trung Le");
  const [email] = useState("trung@brandhub.dev");
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const identityDocs = [
    { name: "CCCD_TrungLe.jpg", status: "VERIFIED" },
    { name: "Selfie_TrungLe.jpg", status: "VERIFIED" },
  ];

  const handleSave = () => {
    toast.success(t("settings.profile.saveSuccess"));
  };

  return (
    <PageWrapper
      title={t("profile.title")}
      description={t("profile.description")}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left: profile + avatar */}
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-16 items-center justify-center rounded-full border text-xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  className="bg-brand-orange absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full text-white shadow-xs"
                  title={t("profile.avatar.upload")}
                >
                  <Camera className="size-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-foreground text-base font-semibold">{name}</h2>
                <p className="text-muted-foreground text-xs">{email}</p>
                <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                  <BadgeCheck className="size-3" />
                  {t("profile.verified")}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("settings.profile.fullNameLabel")}
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("settings.profile.emailLabel")}
                </label>
                <Input value={email} readOnly />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="orange" onClick={handleSave}>
                {t("settings.profile.save")}
              </Button>
            </div>
          </div>

          {/* Identity verification */}
          <div className="border-border bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <IdCard className="text-brand-orange size-5" />
                <h3 className="text-foreground text-sm font-semibold">
                  {t("profile.identity.title")}
                </h3>
              </div>
              <span className="bg-emerald-100 text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-emerald-700">
                <FileCheck2 className="size-3" />
                {t("profile.identity.status")}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {identityDocs.map((doc) => (
                <div
                  key={doc.name}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <span className="text-foreground text-xs font-medium">
                    {doc.name}
                  </span>
                  <span className="text-2xs text-emerald-600">
                    {t("profile.identity.verified")}
                  </span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                <Camera className="size-3.5" />
                {t("profile.identity.uploadMore")}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: danger zone */}
        <div className="border-border rounded-xl border border-red-200 bg-card p-6 dark:border-red-900/50">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert className="size-4 text-rose-500" />
            {t("profile.danger.title")}
          </h3>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("profile.danger.deactivateHint")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
            onClick={() => setDeactivateOpen(true)}
          >
            {t("profile.danger.deactivateButton")}
          </Button>
        </div>
      </div>

      {deactivateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-rose-500" />
              <h3 className="text-foreground text-sm font-semibold">
                {t("profile.danger.confirmTitle")}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("profile.danger.confirmBody")}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeactivateOpen(false)}
              >
                {t("profile.danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeactivateOpen(false);
                  toast.success(t("profile.danger.deactivateSuccess"));
                }}
              >
                {t("profile.danger.confirmDeactivate")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default ProfilePage;
