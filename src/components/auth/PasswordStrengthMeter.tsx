import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return { score };
}

function getLabel(score: number, t: (key: string) => string) {
  const labels: Record<number, string> = {
    0: t("auth.passwordStrength.veryWeak"),
    1: t("auth.passwordStrength.weak"),
    2: t("auth.passwordStrength.medium"),
    3: t("auth.passwordStrength.good"),
    4: t("auth.passwordStrength.strong"),
    5: t("auth.passwordStrength.veryStrong"),
  };
  return labels[score] ?? "";
}

function getColor(score: number) {
  if (score <= 1) return "bg-destructive";
  if (score === 2) return "bg-amber-500";
  if (score === 3) return "bg-lime-500";
  if (score === 4) return "bg-emerald-500";
  return "bg-emerald-600";
}

interface Props {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: Props) {
  const { t } = useTranslation();
  if (!password) return null;

  const { score } = getStrength(password);
  const label = getLabel(score, t);
  const color = getColor(score);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex h-1.5 gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-200",
              i < score ? color : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-2xs font-medium">
        {t("auth.passwordStrength.label")}{" "}
        <span className="text-foreground">{label}</span>
        {score < 3 && t("auth.passwordStrength.hint")}
      </p>
    </div>
  );
}
