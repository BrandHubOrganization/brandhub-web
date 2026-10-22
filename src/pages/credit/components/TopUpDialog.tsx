import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Zap,
  Sparkles,
  QrCode,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TopUpPlan {
  id: string;
  name: string;
  priceVnd: number;
  credits: number;
  bonusPercent?: number;
  recommended?: boolean;
  badge?: string;
  description: string;
  features: string[];
}

const TOP_UP_PLANS: TopUpPlan[] = [
  {
    id: "starter",
    name: "Gói Khởi động",
    priceVnd: 100000,
    credits: 500,
    description: "Phù hợp cho nhu cầu trải nghiệm và thử nghiệm các chiến dịch vừa & nhỏ.",
    features: [
      "~15 bài viết SEO chất lượng cao",
      "~5 ảnh 4K thương mại",
      "Vô thời hạn sử dụng",
    ],
  },
  {
    id: "accelerate",
    name: "Gói Tăng tốc",
    priceVnd: 500000,
    credits: 2800,
    bonusPercent: 12,
    recommended: true,
    badge: "Phổ biến nhất",
    description: "Tối ưu nhất cho các Agency đang đẩy mạnh sản xuất nội dung hàng tuần.",
    features: [
      "~80 bài viết SEO & Captions",
      "~30 ảnh 4K thương mại",
      "+12% bonus credits ưu đãi",
      "Hỗ trợ ưu tiên hàng đợi tạo AI",
    ],
  },
  {
    id: "enterprise",
    name: "Gói Doanh nghiệp",
    priceVnd: 2000000,
    credits: 12000,
    bonusPercent: 20,
    badge: "Tiết kiệm tối đa",
    description: "Dành cho Agency quy mô lớn, vận hành đa thương hiệu và sản xuất video AI.",
    features: [
      "~350 bài viết SEO đa định dạng",
      "~150 ảnh 4K thương mại",
      "+20% bonus credits siêu hời",
      "Sẵn sàng tạo video AI nâng cao",
    ],
  },
];

export interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agencyId: string;
}

export function TopUpDialog({ isOpen, onClose }: TopUpDialogProps) {
  const { t, i18n } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState("accelerate");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan =
    TOP_UP_PLANS.find((plan) => plan.id === selectedPlanId) ?? TOP_UP_PLANS[1];

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat(
      i18n.language === "vi" ? "vi-VN" : "en-US",
      {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      },
    ).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat(
      i18n.language === "vi" ? "vi-VN" : "en-US",
    ).format(amount);
  };

  const handleProceedPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.info(
        t(
          "credit.topup.payosDemo",
          `Cổng thanh toán PayOS sẵn sàng: Đơn hàng gói "${selectedPlan.name}" (${formatVnd(selectedPlan.priceVnd)} = ${formatNumber(selectedPlan.credits)} Credits).`,
        ),
      );
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 border-border/70">
        <DialogHeader className="text-left space-y-1.5 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
              <Zap className="size-4.5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {t("credit.topup.title", "Nạp thêm Credit cho Agency")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t(
              "credit.topup.description",
              "Chọn gói credit phù hợp để mở rộng hạn ngạch tạo nội dung, hình ảnh và video AI chất lượng cao cho đội ngũ của bạn.",
            )}
          </DialogDescription>
        </DialogHeader>

        {/* 3 Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {TOP_UP_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isRecommended = plan.recommended;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all cursor-pointer border text-left",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 ring-2 ring-brand-orange shadow-lg shadow-brand-orange/10"
                    : isRecommended
                      ? "border-brand-orange/40 bg-card hover:border-brand-orange/70 shadow-xs"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
                )}
              >
                {/* Spotlight Badge */}
                {plan.badge && (
                  <div
                    className={cn(
                      "absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs",
                      isRecommended
                        ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white"
                        : "bg-emerald-600 text-white",
                    )}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">
                      {plan.name}
                    </h3>
                    <div
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? "border-brand-orange bg-brand-orange text-white"
                          : "border-muted-foreground/30 bg-transparent",
                      )}
                    >
                      {isSelected && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Price and Credits */}
                  <div className="mt-3 space-y-1">
                    <div className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                      {formatVnd(plan.priceVnd)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-brand-orange" />
                      <span className="font-mono text-sm font-bold text-brand-orange tabular-nums">
                        {formatNumber(plan.credits)} Credits
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                    {plan.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <ul className="mt-4 space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span className="text-[11px] leading-tight text-foreground/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2">
                  <div
                    className={cn(
                      "w-full text-center py-1.5 rounded-lg text-xs font-semibold transition-colors",
                      isSelected
                        ? "bg-brand-orange text-white"
                        : "bg-muted text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {isSelected
                      ? t("common.selected", "Đang chọn")
                      : t("common.select", "Chọn gói")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* VietQR & PayOS Payment Notice */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground mt-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange shrink-0">
            <QrCode className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-xs">
                VietQR / PayOS Gateway
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-medium">
                <ShieldCheck className="size-3" />
                {t("credit.topup.instant", "Tự động kích hoạt")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t(
                "credit.topup.payosNote",
                "Hỗ trợ thanh toán nhanh quét mã VietQR / PayOS tự động kích hoạt credit tức thì.",
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer text-xs"
          >
            {t("credit.topup.close", "Đóng")}
          </Button>

          <Button
            type="button"
            variant="orange"
            loading={isProcessing}
            onClick={handleProceedPayment}
            className="cursor-pointer text-xs sm:text-sm font-semibold shadow-md shadow-brand-orange/20"
          >
            <CreditCard className="size-4 mr-1.5" />
            <span>
              {t("credit.topup.proceedPayOS", "Thanh toán ngay qua PayOS")} (
              {formatVnd(selectedPlan.priceVnd)})
            </span>
            <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
