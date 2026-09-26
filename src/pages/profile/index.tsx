import { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import type { User } from "@/types/user";
import { AvatarUploadModal } from "./components/AvatarUploadModal";
import { LinkPhoneModal } from "./components/LinkPhoneModal";
import { TimezoneSelect } from "@/pages/workspace/components/TimezoneSelect";

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateOtp, setDeactivateOtp] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [linkPhoneOpen, setLinkPhoneOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar ?? null,
  );
  const [role, setRole] = useState(user?.role ?? "—");
  const [joinedAt, setJoinedAt] = useState<string | null>(
    user?.createdAt ?? null,
  );
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [workingLanguage, setWorkingLanguage] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const email = user?.email ?? "";
  const savedProfile = useRef({
    name: "",
    phone: "",
    professionalTitle: "",
    bio: "",
    portfolioUrls: [] as string[],
    workingLanguage: "",
    timezone: "Asia/Ho_Chi_Minh",
  });

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
        setProfessionalTitle(p.professionalTitle ?? "");
        setBio(p.bio ?? "");
        setPortfolioUrls(p.portfolioUrls ?? []);
        setWorkingLanguage(p.workingLanguage ?? "");
        setTimezone(p.timezone ?? "Asia/Ho_Chi_Minh");
        savedProfile.current = {
          name: p.fullName,
          phone: p.phone ?? "",
          professionalTitle: p.professionalTitle ?? "",
          bio: p.bio ?? "",
          portfolioUrls: p.portfolioUrls ?? [],
          workingLanguage: p.workingLanguage ?? "",
          timezone: p.timezone ?? "Asia/Ho_Chi_Minh",
        };
      })
      .catch(() => {
        // fall back to authStore data already rendered
      });
    authService
      .me()
      .then((resp) => setHasPassword(resp.data.data.hasPassword ?? true))
      .catch(() => {
        // fall back to password-based deactivate on failure
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await userService.updateProfile({
        fullName: name,
        phone: phone || undefined,
        professionalTitle: professionalTitle || undefined,
        bio: bio || undefined,
        portfolioUrls: portfolioUrls.filter((u) => u.trim() !== ""),
        workingLanguage: workingLanguage || undefined,
        timezone: timezone || undefined,
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
      setProfessionalTitle(p.professionalTitle ?? "");
      setBio(p.bio ?? "");
      setPortfolioUrls(p.portfolioUrls ?? []);
      setWorkingLanguage(p.workingLanguage ?? "");
      setTimezone(p.timezone ?? "Asia/Ho_Chi_Minh");
      savedProfile.current = {
        name: p.fullName,
        phone: p.phone ?? "",
        professionalTitle: p.professionalTitle ?? "",
        bio: p.bio ?? "",
        portfolioUrls: p.portfolioUrls ?? [],
        workingLanguage: p.workingLanguage ?? "",
        timezone: p.timezone ?? "Asia/Ho_Chi_Minh",
      };
      setIsEditing(false);
      toast.success(t("settings.profile.saveSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const saved = savedProfile.current;
    setName(saved.name);
    setPhone(saved.phone);
    setProfessionalTitle(saved.professionalTitle);
    setBio(saved.bio);
    setPortfolioUrls(saved.portfolioUrls);
    setWorkingLanguage(saved.workingLanguage);
    setTimezone(saved.timezone);
    setIsEditing(false);
  };

  const handleAvatarUploaded = (url: string) => {
    setAvatarUrl(url);
    if (user) setUser({ ...user, avatar: url });
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await authService.deactivate(
        hasPassword ? deactivatePassword : undefined,
        hasPassword ? undefined : deactivateOtp,
      );
      useAuthStore.getState().logout();
      navigate("/login");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("profile.danger.deactivateError")),
      );
      setDeactivating(false);
    }
  };

  const handleSendDeactivateOtp = async () => {
    setSendingOtp(true);
    try {
      await authService.sendDeactivateOtp();
      setOtpSent(true);
      toast.success(t("profile.danger.otpSent"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.danger.otpSendError")));
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <section id="profile" className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold">
          {t("profile.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("profile.description")}
        </p>
      </div>
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
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.jobTitleLabel")}
                    </label>
                    <Input
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder={t("profile.edit.jobTitlePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.workingLanguageLabel")}
                    </label>
                    <Input
                      value={workingLanguage}
                      onChange={(e) => setWorkingLanguage(e.target.value)}
                      placeholder={t("profile.edit.workingLanguagePlaceholder")}
                    />
                  </div>
                  <TimezoneSelect value={timezone} onChange={setTimezone} />
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.bioLabel")}
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t("profile.edit.bioPlaceholder")}
                      rows={3}
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.portfolioLabel")}
                    </label>
                    <div className="space-y-2">
                      {portfolioUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const next = [...portfolioUrls];
                              next[idx] = e.target.value;
                              setPortfolioUrls(next);
                            }}
                            placeholder={t("profile.edit.portfolioPlaceholder")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPortfolioUrls(
                                portfolioUrls.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            {t("profile.edit.portfolioRemove")}
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPortfolioUrls([...portfolioUrls, ""])}
                      >
                        {t("profile.edit.portfolioAdd")}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {t("profile.cancelEdit")}
                  </Button>
                  <Button
                    variant="orange"
                    onClick={handleSave}
                    loading={saving}
                  >
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
                    <p className="text-foreground text-xs font-medium">
                      {role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="text-muted-foreground size-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.phoneLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">
                      {phone || t("profile.view.phoneEmpty")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-brand-orange text-3xs cursor-pointer font-medium hover:underline"
                    onClick={() => setLinkPhoneOpen(true)}
                  >
                    {phone
                      ? t("profile.linkPhone.changeLink")
                      : t("profile.linkPhone.addLink")}
                  </button>
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
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.jobTitleLabel")}
                  </p>
                  <p className="text-foreground text-xs font-medium">
                    {professionalTitle || t("profile.view.jobTitleEmpty")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.workingLanguageLabel")}
                  </p>
                  <p className="text-foreground text-xs font-medium">
                    {workingLanguage || t("profile.view.workingLanguageEmpty")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.timezoneLabel")}
                  </p>
                  <p className="text-foreground text-xs font-medium">
                    {timezone}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.bioLabel")}
                  </p>
                  <p className="text-foreground text-xs font-medium whitespace-pre-wrap">
                    {bio || t("profile.view.bioEmpty")}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.portfolioLabel")}
                  </p>
                  {portfolioUrls.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {portfolioUrls.map((url) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-orange text-xs font-medium hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground text-xs font-medium">
                      {t("profile.view.portfolioEmpty")}
                    </p>
                  )}
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
            {hasPassword ? (
              <Input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder={t("profile.danger.passwordPlaceholder")}
              />
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={sendingOtp}
                  onClick={handleSendDeactivateOtp}
                >
                  {otpSent
                    ? t("profile.danger.resendOtp")
                    : t("profile.danger.sendOtp")}
                </Button>
                <Input
                  value={deactivateOtp}
                  onChange={(e) => setDeactivateOtp(e.target.value)}
                  placeholder={t("profile.danger.otpPlaceholder")}
                />
              </div>
            )}
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
                disabled={
                  (hasPassword ? !deactivatePassword : !deactivateOtp) ||
                  deactivating
                }
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

      <LinkPhoneModal
        isOpen={linkPhoneOpen}
        onClose={() => setLinkPhoneOpen(false)}
        onLinked={(linkedPhone) => {
          setPhone(linkedPhone);
          savedProfile.current.phone = linkedPhone;
        }}
      />
    </section>
  );
}

export default ProfilePage;
