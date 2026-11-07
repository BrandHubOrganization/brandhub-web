import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  KeyRound,
  Lightbulb,
  ShieldCheck,
  TriangleAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityTipsCardProps {
  className?: string;
}

export function SecurityTipsCard({ className }: SecurityTipsCardProps) {
  const { t } = useTranslation();

  const tips = [
    {
      id: "2fa",
      icon: ShieldCheck,
      iconClass:
        "text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
      title: t("security.tips.tip1Title", "Kích hoạt xác thực 2 bước (2FA)"),
      desc: t(
        "security.tips.tip1Desc",
        "Ngăn chặn hơn 99% nguy cơ bị xâm nhập trái phép bằng mã xác thực TOTP.",
      ),
    },
    {
      id: "pwd",
      icon: KeyRound,
      iconClass:
        "text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
      title: t("security.tips.tip2Title", "Sử dụng mật khẩu duy nhất"),
      desc: t(
        "security.tips.tip2Desc",
        "Không dùng lại mật khẩu BrandHub cho bất kỳ dịch vụ hoặc nền tảng nào khác.",
      ),
    },
    {
      id: "otp",
      icon: TriangleAlert,
      iconClass:
        "text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
      title: t("security.tips.tip3Title", "Cảnh giác với mã xác thực"),
      desc: t(
        "security.tips.tip3Desc",
        "Không bao giờ chia sẻ mã OTP hoặc mã khôi phục cho bất kỳ ai, kể cả nhân viên BrandHub.",
      ),
    },
  ];

  return (
    <div
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-sm",
        className,
      )}
    >
      <div className="border-border flex items-center gap-3 border-b pb-4">
        <div className="bg-brand-orange-soft text-brand-orange rounded-xl p-2.5">
          <Lightbulb className="size-5" />
        </div>
        <div>
          <h3 className="text-foreground text-sm font-semibold">
            {t("security.tips.title", "Mẹo bảo mật")}
          </h3>
          <p className="text-muted-foreground text-xs">
            {t(
              "security.tips.subtitle",
              "Khuyến nghị giúp bảo vệ tài khoản và tài sản thương hiệu",
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.id} className="flex items-start gap-3 text-left">
              <div
                className={cn(
                  "mt-0.5 shrink-0 rounded-lg p-2 transition-colors",
                  tip.iconClass,
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-semibold">
                  {tip.title}
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-border mt-5 border-t pt-4">
        <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
          {t("security.tips.quickLinks", "Lối tắt cài đặt")}
        </p>
        <div className="space-y-2">
          <Link
            to="/settings/connections"
            className="border-border hover:bg-accent flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="text-muted-foreground size-3.5" />
              <span className="text-foreground">
                {t("security.tips.manageConnections", "Quản lý liên kết OAuth")}
              </span>
            </div>
            <ArrowRight className="text-muted-foreground size-3" />
          </Link>

          <Link
            to="/settings/profile"
            className="border-border hover:bg-accent flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground size-3.5" />
              <span className="text-foreground">
                {t("security.tips.manageProfile", "Hồ sơ cá nhân & Liên hệ")}
              </span>
            </div>
            <ArrowRight className="text-muted-foreground size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SecurityTipsCard;
