import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertCircle,
  Copy,
  Loader2,
  MailCheck,
  ShieldCheck,
  Trash2,
  Upload,
  UserCog,
  UserPlus,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { errorCode } from "@/services/adminRevenueService";
import { adminAccountService } from "@/services/adminAccountService";

/** BR-02: 8+ characters, a digit and a special character (same rule as the API). */
const PASSWORD_POLICY = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 12 letters/digits plus a digit and a symbol, so it always passes PASSWORD_POLICY. */
function randomPassword() {
  const pick = (chars: string) =>
    chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  const alnum = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return (
    Array.from({ length: 12 }, () => pick(alnum)).join("") +
    pick("0123456789") +
    pick("!@#$%&*")
  );
}
const ERRORS: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "admin.users.errors.emailExists",
  WEAK_PASSWORD: "admin.users.errors.weakPassword",
  PHONE_ALREADY_IN_USE: "admin.users.errors.phoneInUse",
  USER_ROLE_PROTECTED: "admin.users.errors.roleProtected",
  EMAIL_IMMUTABLE: "admin.users.errors.emailImmutable",
  ADMIN_STATE_CONFLICT: "admin.users.errors.conflict",
  VALIDATION_ERROR: "admin.users.errors.invalid",
  INVALID_REQUEST: "admin.users.errors.invalid",
};

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  const isRequired =
    required || (typeof label === "string" && label.trim().endsWith("*"));
  const displayLabel =
    typeof label === "string" && label.trim().endsWith("*")
      ? label.replace(/\s*\*$/, "")
      : label;

  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-foreground block font-semibold tracking-tight">
        {displayLabel}
        {isRequired && (
          <span className="text-destructive ml-1 font-bold">*</span>
        )}
      </span>
      {children}
      {(error || hint) && (
        <span
          className={cn(
            "block text-xs",
            error
              ? "text-destructive mt-1 flex items-center gap-1 font-medium"
              : "text-muted-foreground font-normal",
          )}
        >
          {error ? (
            <>
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </>
          ) : (
            hint
          )}
        </span>
      )}
    </label>
  );
}

function usePlans() {
  return useQuery({
    queryKey: ["admin-plan-catalog-full"],
    queryFn: adminAccountService.plans,
    staleTime: 300000,
  });
}

/** SCR-ADM-07: the account starts PENDING_VERIFICATION and the activation email is mandatory. */
export function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const plans = usePlans();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("");
  const create = useMutation({
    mutationFn: () =>
      adminAccountService.create({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role,
        password: password || null,
        requestedPlan: plan || null,
      }),
    onSuccess: () => {
      toast.success(t("admin.users.created"));
      void client.invalidateQueries({ queryKey: ["admin-accounts"] });
      onClose();
    },
  });
  const nameError =
    fullName && (fullName.trim().length < 2 || fullName.trim().length > 100)
      ? t("admin.users.nameRule")
      : null;
  const emailError =
    email && !EMAIL.test(email.trim())
      ? t("admin.users.errors.emailFormat")
      : null;
  const passwordError =
    password && !PASSWORD_POLICY.test(password)
      ? t("admin.users.errors.weakPassword")
      : null;
  const ready =
    fullName.trim().length >= 2 &&
    EMAIL.test(email.trim()) &&
    !nameError &&
    !passwordError;
  const code = errorCode(create.error);

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !create.isPending && onClose()}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="text-brand-orange size-5" />
            {t("admin.users.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("admin.users.createHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) create.mutate();
          }}
        >
          <Field label={`${t("admin.users.fullName")} *`} error={nameError}>
            <Input
              value={fullName}
              maxLength={100}
              aria-invalid={!!nameError}
              className={cn(
                nameError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label={`${t("admin.users.email")} *`} error={emailError}>
            <Input
              type="email"
              value={email}
              maxLength={255}
              aria-invalid={!!emailError}
              className={cn(
                emailError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("admin.users.phone")}>
              <Input
                value={phone}
                maxLength={20}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label={t("admin.users.role")}>
              <SelectMenu
                className="h-9 w-full text-sm"
                ariaLabel={t("admin.users.role")}
                value={role}
                onChange={(value) => setRole(value as "ADMIN" | "USER")}
                options={[
                  { value: "USER", label: t("admin.roles.USER") },
                  { value: "ADMIN", label: t("admin.roles.ADMIN") },
                ]}
              />
            </Field>
          </div>
          <Field
            label={t("admin.users.tempPassword")}
            hint={t("admin.users.tempPasswordHint")}
            error={passwordError}
          >
            <div className="flex gap-2">
              <PasswordInput
                autoComplete="new-password"
                value={password}
                maxLength={72}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={() => setPassword(randomPassword())}
              >
                <Wand2 className="size-4" />
                {t("admin.users.generatePassword")}
              </Button>
            </div>
          </Field>
          <Field
            label={t("admin.users.requestedPlan")}
            hint={t("admin.users.requestedPlanHint")}
          >
            <SelectMenu
              className="h-9 w-full text-sm"
              ariaLabel={t("admin.users.requestedPlan")}
              value={plan}
              onChange={setPlan}
              options={[
                { value: "", label: t("admin.users.noPlan") },
                ...(plans.data ?? []).map((p) => ({
                  value: p.name,
                  label: p.displayName,
                })),
              ]}
            />
          </Field>
          <div className="bg-muted/50 border-brand-orange flex gap-2 rounded-r-lg border-l-4 px-4 py-3 text-xs leading-5">
            <MailCheck className="text-brand-orange mt-0.5 size-4 shrink-0" />
            <span>{t("admin.users.activationNote")}</span>
          </div>
          {create.isError && (
            <p role="alert" className="text-destructive text-sm">
              {t(ERRORS[code ?? ""] ?? "admin.users.errors.generic")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("admin.reports.cancel")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              disabled={!ready || create.isPending}
            >
              {t("admin.users.createAction")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const QUICK_REASONS = [
  "admin.users.quickReasons.req",
  "admin.users.quickReasons.role",
  "admin.users.quickReasons.plan",
] as const;

/** SCR-ADM-08: email read only, protected roles, next-period plan change, mandatory justification. */
export function EditUserDialog({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const detail = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminAccountService.detail(userId),
    retry: false,
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserCog className="text-brand-orange size-5" />
            {t("admin.users.editTitle")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {t("admin.users.editSubtitle")}
          </DialogDescription>
        </DialogHeader>
        {detail.isPending && <Skeleton className="h-80 rounded-lg" />}
        {detail.isError && (
          <p
            role="alert"
            className="text-destructive flex items-center gap-1.5 text-sm font-medium"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{t("admin.users.errors.notFound")}</span>
          </p>
        )}
        {detail.data && (
          <EditForm
            key={detail.data.rowVersion}
            user={detail.data}
            onClose={onClose}
            locale={i18n.language}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  user,
  onClose,
  locale,
}: {
  user: NonNullable<Awaited<ReturnType<typeof adminAccountService.detail>>>;
  onClose: () => void;
  locale: string;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const actorId = useAuthStore((s) => s.user?.id);
  const plans = usePlans();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState<string>("__keep__");
  const [justification, setJustification] = useState("");
  const [attempted, setAttempted] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // BR-35/BR-83 mirrored from the API so the reason is visible before saving.
  const roleLock =
    user.id === actorId
      ? "admin.users.roleLockSelf"
      : user.role === "ADMIN"
        ? "admin.users.roleLockPeer"
        : user.agencyOwner
          ? "admin.users.roleLockOwner"
          : null;

  const save = useMutation({
    mutationFn: () =>
      adminAccountService.update(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        role,
        requestedPlan: plan === "__keep__" ? undefined : plan,
        justification: justification.trim(),
        rowVersion: user.rowVersion,
      }),
    onSuccess: () => {
      toast.success(t("admin.users.saved"));
      void client.invalidateQueries({ queryKey: ["admin-accounts"] });
      void client.invalidateQueries({ queryKey: ["admin-user", user.id] });
      onClose();
    },
  });

  const resend = useMutation({
    mutationFn: () => adminAccountService.resendActivation(user.id),
    onSuccess: () => toast.success(t("admin.users.resent")),
    onError: () => toast.error(t("admin.users.errors.generic")),
  });

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("admin.users.avatarInvalidFile"));
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("admin.users.avatarSizeLimit"));
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarImageError(false);
    setIsUploadingAvatar(true);

    try {
      const s3Url = await adminAccountService.uploadAvatar(file);
      setAvatarUrl(s3Url);
      setAvatarPreview(null);
      toast.success(t("admin.users.avatarUploadSuccess"));
    } catch {
      toast.error(t("admin.users.avatarUploadFailed"));
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setAvatarPreview(null);
    setAvatarImageError(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const displayAvatar =
    avatarPreview || (avatarUrl.trim() ? avatarUrl.trim() : null);

  const date = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
          new Date(iso),
        )
      : null;

  const trimmedName = fullName.trim();
  const trimmedPhone = phone.trim();
  const trimmedAvatar = avatarUrl.trim();
  const trimmedJustification = justification.trim();

  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 100;
  const isPhoneValid = !trimmedPhone || /^\+?[0-9]{8,15}$/.test(trimmedPhone);
  const isAvatarValid = !trimmedAvatar || /^https?:\/\/.+/i.test(trimmedAvatar);
  const isJustificationValid = trimmedJustification.length >= 5;

  const nameError =
    (attempted || fullName !== user.fullName) && !isNameValid
      ? t("admin.users.nameRule")
      : null;

  const phoneError =
    (attempted || phone !== (user.phone ?? "")) && !isPhoneValid
      ? t("admin.users.phoneInvalid")
      : null;

  const avatarError =
    (attempted || avatarUrl !== (user.avatarUrl ?? "")) && !isAvatarValid
      ? t("admin.users.avatarUrlInvalid")
      : null;

  const justificationError =
    (attempted || justification.length > 0) && !isJustificationValid
      ? t("admin.users.justificationRule")
      : null;

  const ready =
    isNameValid &&
    isPhoneValid &&
    isAvatarValid &&
    isJustificationValid &&
    !isUploadingAvatar;
  const code = errorCode(save.error);

  const planLabel = (name: string | null) =>
    name
      ? (plans.data?.find((p) => p.name === name)?.displayName ?? name)
      : t("admin.users.noPlan");

  const effective = user.currentPeriodEnd ? date(user.currentPeriodEnd) : null;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        if (ready) {
          save.mutate();
        } else if (!isJustificationValid) {
          reasonRef.current?.focus();
        }
      }}
    >
      {/* Header Card: Tóm tắt thông tin tài khoản */}
      <div className="bg-muted/40 border-border/80 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="border-border bg-muted text-foreground relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border font-bold">
            {displayAvatar && !avatarImageError ? (
              <img
                src={displayAvatar}
                alt={fullName || user.fullName}
                className="size-full object-cover"
                onError={() => setAvatarImageError(true)}
              />
            ) : (
              <span className="text-muted-foreground text-sm font-semibold">
                {(fullName || user.fullName || "?")
                  .trim()
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-foreground truncate text-base leading-snug font-bold">
                {fullName || user.fullName}
              </h4>
              <Badge
                variant={
                  user.status === "ACTIVE"
                    ? "PUBLISHED"
                    : user.status === "FLAGGED"
                      ? "PENDING_REVIEW"
                      : "outline"
                }
                className="text-[11px] font-medium"
              >
                {t(`admin.status.${user.status}`)}
              </Badge>
              <span className="bg-secondary/80 text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium">
                {user.role === "ADMIN" && (
                  <ShieldCheck className="text-brand-orange size-3" />
                )}
                {t(`admin.roles.${user.role}`)}
              </span>
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
            onClick={() => {
              void navigator.clipboard.writeText(user.id);
              toast.success(t("admin.users.idCopied"));
            }}
            title={t("admin.users.copyId")}
          >
            <Copy className="size-3.5" />
            <span>{t("admin.users.copyId")}</span>
          </Button>
        </div>
      </div>

      {user.status === "PENDING_VERIFICATION" && (
        <div className="border-brand-orange/30 bg-brand-orange-soft/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span>{t("admin.users.pendingActivation")}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resend.isPending}
            onClick={() => resend.mutate()}
          >
            {t("admin.users.resendAction")}
          </Button>
        </div>
      )}

      {/* Nhóm 1: Thông tin cơ bản */}
      <div className="space-y-3">
        <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {t("admin.users.sectionBasic")}
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t("admin.users.fullName")} *`} error={nameError}>
            <Input
              value={fullName}
              maxLength={100}
              aria-invalid={!!nameError}
              className={cn(
                nameError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field
            label={t("admin.users.email")}
            hint={t("admin.users.emailReadOnly")}
          >
            <Input
              value={user.email}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </Field>
          <Field label={t("admin.users.phone")} error={phoneError}>
            <Input
              value={phone}
              maxLength={20}
              placeholder="+84..."
              aria-invalid={!!phoneError}
              className={cn(
                phoneError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field
            label={t("admin.users.role")}
            hint={roleLock ? t(roleLock) : undefined}
          >
            <SelectMenu
              className="h-9 w-full text-sm"
              ariaLabel={t("admin.users.role")}
              value={role}
              disabled={!!roleLock}
              onChange={(value) => setRole(value as "ADMIN" | "USER")}
              options={[
                { value: "USER", label: t("admin.roles.USER") },
                { value: "ADMIN", label: t("admin.roles.ADMIN") },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Nhóm 2: Hồ sơ hiển thị */}
      <div className="space-y-3">
        <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {t("admin.users.sectionProfile")}
        </h4>
        <div className="space-y-3">
          <Field label={t("admin.users.avatar")} error={avatarError}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="border-border bg-muted text-foreground relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-xs">
                {displayAvatar && !avatarImageError ? (
                  <img
                    src={displayAvatar}
                    alt={fullName || user.fullName}
                    className="size-full object-cover"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <span className="text-muted-foreground text-base font-semibold">
                    {(fullName || user.fullName || "?")
                      .trim()
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
                {isUploadingAvatar && (
                  <div className="bg-background/60 backdrop-blur-xs absolute inset-0 flex items-center justify-center">
                    <Loader2 className="text-brand-orange size-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    disabled={isUploadingAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-8 gap-1.5 text-xs font-medium"
                  >
                    <Upload className="size-3.5" />
                    <span>
                      {displayAvatar
                        ? t("admin.users.changeAvatar")
                        : t("admin.users.uploadAvatar")}
                    </span>
                  </Button>
                  {displayAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isUploadingAvatar}
                      onClick={handleRemoveAvatar}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs font-medium"
                    >
                      <Trash2 className="size-3.5" />
                      <span>{t("admin.users.removeAvatar")}</span>
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("admin.users.avatarUploadGuide")}
                </p>
              </div>
            </div>
          </Field>
          <Field label={t("admin.users.bio")}>
            <Textarea
              value={bio}
              rows={2}
              maxLength={2000}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Nhóm 3: Gói dịch vụ & Vi phạm */}
      <div className="space-y-3">
        <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {t("admin.users.sectionPlanStrikes")}
        </h4>
        <section className="border-border bg-card space-y-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-foreground text-sm font-semibold">
              {t("admin.users.planTitle")}
            </h5>
            <p className="text-muted-foreground text-xs">
              {t("admin.users.currentPlan")}:{" "}
              <span className="text-foreground font-semibold">
                {planLabel(user.currentPlan)}
              </span>
              {effective && (
                <span>
                  {" "}
                  ({t("admin.users.periodEnds", { date: effective })})
                </span>
              )}
            </p>
          </div>
          {user.pendingPlan && (
            <p className="bg-muted/60 rounded-lg px-3 py-2 text-xs">
              {t("admin.users.pendingPlan", {
                plan: planLabel(user.pendingPlan),
                date:
                  date(user.pendingEffectiveAt) ??
                  t("admin.users.firstPayment"),
              })}
            </p>
          )}
          <SelectMenu
            className="h-9 w-full text-sm"
            ariaLabel={t("admin.users.nextPlan")}
            value={plan}
            onChange={setPlan}
            options={[
              { value: "__keep__", label: t("admin.users.keepPlan") },
              ...(user.pendingPlan
                ? [{ value: "", label: t("admin.users.cancelPending") }]
                : []),
              ...(plans.data ?? []).map((p) => ({
                value: p.name,
                label: p.displayName,
              })),
            ]}
          />
          <p className="text-muted-foreground text-xs leading-5">
            {t("admin.users.planRule", {
              date: effective ?? t("admin.users.firstPayment"),
            })}
          </p>

          <div className="border-border mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
            <span className="text-muted-foreground">
              {t("admin.users.strikesReadOnly")}
            </span>
            <div className="flex items-center gap-2.5 font-sans tabular-nums">
              <span className="border-border inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5">
                <span className="bg-warning h-2.5 w-2 rounded-sm" />
                <span className="text-muted-foreground text-[11px]">
                  {t("admin.level.YELLOW")}:
                </span>
                <span className="text-foreground font-semibold">
                  {user.yellow}/3
                </span>
              </span>
              <span className="border-border inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5">
                <span className="bg-brand-orange h-2.5 w-2 rounded-sm" />
                <span className="text-muted-foreground text-[11px]">
                  {t("admin.level.ORANGE")}:
                </span>
                <span className="text-foreground font-semibold">
                  {user.orange}/3
                </span>
              </span>
              <span className="border-border inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5">
                <span className="bg-destructive h-2.5 w-2 rounded-sm" />
                <span className="text-muted-foreground text-[11px]">
                  {t("admin.level.RED")}:
                </span>
                <span className="text-foreground font-semibold">
                  {user.red}
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Nhóm 4: Ghi chú kiểm toán */}
      <div className="space-y-3">
        <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {t("admin.users.sectionAudit")}
        </h4>
        <Field
          label={`${t("admin.users.justification")} *`}
          hint={t("admin.users.auditNote")}
          error={justificationError}
        >
          <Textarea
            ref={reasonRef}
            value={justification}
            rows={2}
            maxLength={2000}
            aria-invalid={!!justificationError}
            className={cn(
              justificationError &&
                "border-destructive focus-visible:ring-destructive/30",
            )}
            onChange={(e) => setJustification(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
            <span className="text-muted-foreground mr-1 text-[11px] font-medium">
              {t("admin.users.quickSuggestions")}:
            </span>
            {QUICK_REASONS.map((key) => {
              const reasonText = t(key);
              const isSelected = justification === reasonText;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setJustification(reasonText)}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    isSelected
                      ? "border-brand-orange bg-brand-orange-soft text-brand-orange font-medium"
                      : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {reasonText}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      {save.isError && (
        <p
          role="alert"
          className="text-destructive flex items-center gap-1.5 text-sm font-medium"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{t(ERRORS[code ?? ""] ?? "admin.users.errors.generic")}</span>
        </p>
      )}

      <div className="border-border flex justify-end gap-2 border-t pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("admin.reports.cancel")}
        </Button>
        <Button
          type="submit"
          variant="orange"
          disabled={!ready || save.isPending || isUploadingAvatar}
        >
          {t("admin.users.saveAction")}
        </Button>
      </div>
    </form>
  );
}
