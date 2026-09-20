import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BadgeCheck,
  Calendar,
  Camera,
  Clock,
  Pencil,
  Phone,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import type { User } from "@/types/user";
import { AvatarUploadModal } from "./components/AvatarUploadModal";

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar ?? null,
  );
  const [role, setRole] = useState(user?.role ?? "—");
  const [joinedAt, setJoinedAt] = useState<string | null>(
    user?.createdAt ?? null,
  );
  const email = user?.email ?? "";

  useEffect(() => {
    userService
      .getProfile()
      .then((resp) => {
        const p = resp.data.data;
        setName(p.fullName);
        setPhone(p.phone ?? "");
        setAvatarUrl(p.avatarUrl);
        setRole(p.role);
        setJoinedAt(p.createdAt);
      })
      .catch(() => {
        // fall back to authStore data already rendered
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await userService.updateProfile({
        fullName: name,
        phone: phone || undefined,
      });
      const p = resp.data.data;
      setUser({
        ...(user ?? ({} as User)),
        id: p.userId,
        name: p.fullName,
        email: p.email,
        avatar: p.avatarUrl ?? undefined,
        phone: p.phone ?? undefined,
        role: p.role as User["role"],
      });
      setName(p.fullName);
      setPhone(p.phone ?? "");
      setIsEditing(false);
      toast.success(t("settings.profile.saveSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setIsEditing(false);
  };

  const handleAvatarUploaded = (url: string) => {
    setAvatarUrl(url);
    if (user) setUser({ ...user, avatar: url });
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await authService.deactivate(deactivatePassword);
      useAuthStore.getState().logout();
      navigate("/login");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("profile.danger.deactivateError")),
      );
      setDeactivating(false);
    }
  };

  return (
    <PageWrapper
      title={t("profile.title")}
      description={t("profile.description")}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="border-border size-16 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-16 items-center justify-center rounded-full border text-xl font-bold">
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="bg-brand-orange absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full text-white shadow-xs"
                      title={t("profile.avatar.upload")}
                    >
                      <Camera className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-foreground text-base font-semibold">
                    {name}
                  </h2>
                  <p className="text-muted-foreground text-xs">{email}</p>
                  <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                    <BadgeCheck className="size-3" />
                    {t("profile.verified")}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  {t("profile.editButton")}
                </Button>
              )}
            </div>

            {isEditing ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("settings.profile.fullNameLabel")}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("settings.profile.emailLabel")}
                    </label>
                    <Input value={email} readOnly />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.phoneLabel")}
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("profile.edit.phonePlaceholder")}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {t("profile.cancelEdit")}
                  </Button>
                  <Button variant="orange" onClick={handleSave} loading={saving}>
                    {t("settings.profile.save")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.roleLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">{role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.phoneLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">
                      {phone || t("profile.view.phoneEmpty")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.joinedLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">
                      {joinedAt ? new Date(joinedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.lastLoginLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">
                      {user?.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-border bg-card rounded-xl border border-red-200 p-6 dark:border-red-900/50">
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
            <Input
              type="password"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              placeholder={t("profile.danger.passwordPlaceholder")}
            />
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
                loading={deactivating}
                disabled={!deactivatePassword || deactivating}
                onClick={handleDeactivate}
              >
                {t("profile.danger.confirmDeactivate")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSave={handleAvatarUploaded}
      />
    </PageWrapper>
  );
}

export default ProfilePage;
