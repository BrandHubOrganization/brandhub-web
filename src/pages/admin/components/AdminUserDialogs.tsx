import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MailCheck, UserPlus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
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
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
      {(error || hint) && (
        <span
          className={cn(
            "block text-xs font-normal",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? hint}
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
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label={`${t("admin.users.email")} *`} error={emailError}>
            <Input
              type="email"
              value={email}
              maxLength={255}
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
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
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
          <DialogTitle>{t("admin.users.editTitle")}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {userId}
          </DialogDescription>
        </DialogHeader>
        {detail.isPending && <Skeleton className="h-80 rounded-lg" />}
        {detail.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.users.errors.notFound")}
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
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState<string>("__keep__");
  const [justification, setJustification] = useState("");
  const [attempted, setAttempted] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
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
  const date = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
          new Date(iso),
        )
      : null;
  const nameError =
    fullName.trim().length < 2 ? t("admin.users.nameRule") : null;
  // Save stays clickable; a missing reason is shown and focused instead of silently disabling the button.
  const justificationError =
    (attempted || justification) && justification.trim().length < 5
      ? t("admin.users.justificationRule")
      : null;
  const ready = !nameError && justification.trim().length >= 5;
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
        if (ready) save.mutate();
        else if (justification.trim().length < 5) reasonRef.current?.focus();
      }}
    >
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("admin.users.email")}
          hint={t("admin.users.emailReadOnly")}
        >
          <Input value={user.email} readOnly disabled />
        </Field>
        <Field label={`${t("admin.users.fullName")} *`} error={nameError}>
          <Input
            value={fullName}
            maxLength={100}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>
        <Field label={t("admin.users.phone")}>
          <Input
            value={phone}
            maxLength={20}
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
      <Field label={t("admin.users.avatarUrl")}>
        <Input
          type="url"
          value={avatarUrl}
          maxLength={500}
          placeholder="https://"
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </Field>
      <Field label={t("admin.users.bio")}>
        <Textarea
          value={bio}
          rows={2}
          maxLength={2000}
          onChange={(e) => setBio(e.target.value)}
        />
      </Field>

      <section className="border-border space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">{t("admin.users.planTitle")}</h3>
        <p className="text-sm">
          {t("admin.users.currentPlan")}:{" "}
          <span className="font-semibold">{planLabel(user.currentPlan)}</span>
          {effective && (
            <span className="text-muted-foreground">
              {" "}
              ({t("admin.users.periodEnds", { date: effective })})
            </span>
          )}
        </p>
        {user.pendingPlan && (
          <p className="bg-muted/60 rounded-lg px-3 py-2 text-xs">
            {t("admin.users.pendingPlan", {
              plan: planLabel(user.pendingPlan),
              date:
                date(user.pendingEffectiveAt) ?? t("admin.users.firstPayment"),
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
      </section>

      <p className="text-xs">
        {t("admin.users.strikesReadOnly")}{" "}
        <span className="font-mono">
          {t("admin.level.YELLOW")} {user.yellow}/3, {t("admin.level.ORANGE")}{" "}
          {user.orange}/3, {t("admin.level.RED")} {user.red}
        </span>
      </p>

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
          onChange={(e) => setJustification(e.target.value)}
        />
      </Field>
      {save.isError && (
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
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          disabled={save.isPending}
        >
          {t("admin.users.saveAction")}
        </Button>
      </div>
    </form>
  );
}
