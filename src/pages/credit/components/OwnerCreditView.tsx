import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditBalancePanel } from "@/pages/credit/components/CreditBalancePanel";
import { WorkspaceCreditPanel } from "@/pages/credit/components/WorkspaceCreditPanel";
import {
  agencyBillingService,
  type AgencyBillingOrder,
} from "@/services/agencyBillingService";
import { formatCredits } from "@/pages/credit/utils/creditFormat";
import { creditKeys } from "@/pages/credit/utils/creditQuery";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CREDIT_UNIT_PRICE_VND = 200;
const MAX_TOPUP_CREDITS = 1_000_000;
const PRESET_AMOUNTS = [5000, 10000, 20000] as const;

type TopUpOption = 5000 | 10000 | 20000 | "custom";

function formatThousandDots(value: string): string {
  const withoutDots = value.replace(/\./g, "");
  if (/^[1-9]\d*$/.test(withoutDots)) {
    return withoutDots.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return value;
}

function validateCreditInput(
  raw: string,
  t: (key: string, fallback: string) => string,
): { credits: number | null; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      credits: null,
      error: t(
        "credit.topup.errors.required",
        "Vui lòng nhập số lượng Credit cần nạp.",
      ),
    };
  }
  const normalized = trimmed.replace(/\./g, "");
  if (!/^\d+$/.test(normalized)) {
    return {
      credits: null,
      error: t(
        "credit.topup.errors.integer",
        "Chỉ nhập số nguyên dương (không dùng số thập phân, dấu âm hoặc ký tự đặc biệt).",
      ),
    };
  }
  const amount = Number(normalized);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    return {
      credits: null,
      error: t(
        "credit.topup.errors.min",
        "Số lượng Credit cần nạp phải từ 1 trở lên.",
      ),
    };
  }
  if (amount > MAX_TOPUP_CREDITS) {
    return {
      credits: null,
      error: t(
        "credit.topup.errors.max",
        "Số lượng Credit tối đa mỗi lần nạp là 1.000.000 credit.",
      ),
    };
  }
  return { credits: amount, error: "" };
}

export function OwnerCreditView({ agencyId }: { agencyId: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TopUpOption>(5000);
  const [customCredits, setCustomCredits] = useState("5.000");
  const [customTouched, setCustomTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<AgencyBillingOrder | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
  const formatVnd = (vnd: number | bigint) =>
    `${new Intl.NumberFormat(locale).format(vnd)} VND`;

  const validation =
    selectedOption === "custom"
      ? validateCreditInput(customCredits, t)
      : { credits: selectedOption, error: "" };

  const activeCredits = validation.credits;
  const totalVnd =
    activeCredits !== null ? activeCredits * CREDIT_UNIT_PRICE_VND : 0;

  // Poll order status every 4s while PENDING_PAYMENT
  useEffect(() => {
    if (!topUpOpen || !order || order.status !== "PENDING_PAYMENT") return;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const latest = await agencyBillingService.getOrder(
          agencyId,
          order.orderId,
        );
        if (!cancelled) {
          setOrder(latest);
          if (latest.status !== "PENDING_PAYMENT") {
            window.clearInterval(timer);
          }
        }
      } catch {
        // Keep current pending state; user can retry or continue waiting
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [agencyId, order, topUpOpen]);

  // Refresh balances when order reaches FULFILLED
  useEffect(() => {
    if (order?.status !== "FULFILLED") return;
    void queryClient.invalidateQueries({
      queryKey: creditKeys.scope(userId, agencyId),
    });
    void queryClient.invalidateQueries({
      queryKey: ["ai-credit-balance"],
    });
    toast.success(
      t(
        "credit.topup.success",
        "Thanh toán thành công! Đã cộng Credit vào quỹ Agency.",
      ),
    );
  }, [order?.status, queryClient, t, userId, agencyId]);

  // 1s countdown timer while QR is pending
  useEffect(() => {
    if (!topUpOpen || order?.status !== "PENDING_PAYMENT") return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [topUpOpen, order?.status, order?.expiresAt]);

  const remainingSeconds = order
    ? Math.max(0, Math.ceil((Date.parse(order.expiresAt) - now) / 1000))
    : 0;
  const qrExpired =
    order?.status === "EXPIRED" ||
    (order?.status === "PENDING_PAYMENT" && remainingSeconds === 0);
  const countdown = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const createTopUpOrder = async (creditsToBuy: number) => {
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const created = await agencyBillingService.createCreditTopUpOrder(
        agencyId,
        creditsToBuy,
        idempotencyKey,
      );
      setOrder(created);
      setNow(Date.now());
    } catch (cause) {
      const apiError = (
        cause as {
          response?: { data?: { error?: { code?: string; message?: string } } };
        }
      )?.response?.data?.error;
      if (apiError?.code === "BILLING_NOT_CONFIGURED") {
        setCheckoutError(
          t(
            "subscription.checkout.notConfigured",
            "Cổng thanh toán SePay chưa được cấu hình trên máy chủ.",
          ),
        );
      } else if (apiError?.code === "BILLING_SUBSCRIPTION_NOT_READY") {
        setCheckoutError(
          t(
            "subscription.plans.subscriptionNotReady",
            "Ví Credit của Agency chưa sẵn sàng để giao dịch.",
          ),
        );
      } else {
        setCheckoutError(
          apiError?.message ||
            t(
              "credit.topup.error",
              "Không thể khởi tạo đơn thanh toán Credit. Vui lòng thử lại.",
            ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTopUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCustomTouched(true);
    if (activeCredits === null || submitting) return;
    await createTopUpOrder(activeCredits);
  };

  const handleCopyTransferContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleOpenDialog = () => {
    setCheckoutError(null);
    setTopUpOpen(true);
  };

  return (
    <div className="space-y-5">
      <CreditBalancePanel
        agencyId={agencyId}
        onTopUpClick={handleOpenDialog}
      />
      <WorkspaceCreditPanel agencyId={agencyId} canEdit />

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("credit.topup.title", "Nạp thêm Credit")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "credit.topup.description",
                "Mua lẻ Credit bổ sung cho quỹ dùng chung của Agency (không hết hạn cuối kỳ).",
              )}
            </DialogDescription>
          </DialogHeader>

          {!order ? (
            <form className="space-y-4" onSubmit={handleTopUpSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  {t("credit.topup.selectPackage", "Chọn gói Credit")}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESET_AMOUNTS.map((preset) => {
                    const isSelected = selectedOption === preset;
                    const priceVnd = preset * CREDIT_UNIT_PRICE_VND;
                    return (
                      <button
                        key={preset}
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setSelectedOption(preset);
                          setCheckoutError(null);
                        }}
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-3 text-left transition-colors cursor-pointer",
                          isSelected
                            ? "border-brand-orange bg-brand-orange/5 text-foreground"
                            : "border-border bg-card hover:bg-muted/40 text-foreground",
                        )}
                      >
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCredits(preset, i18n.language)} Credits
                        </span>
                        <span className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          {formatVnd(priceVnd)}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setSelectedOption("custom");
                      setCheckoutError(null);
                    }}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-3 text-left transition-colors cursor-pointer",
                      selectedOption === "custom"
                        ? "border-brand-orange bg-brand-orange/5 text-foreground"
                        : "border-border bg-card hover:bg-muted/40 text-foreground",
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {t("credit.topup.customOption", "Tùy chọn (Custom)")}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      {t("credit.topup.customSubtitle", "Nhập số lượng bất kỳ")}
                    </span>
                  </button>
                </div>
              </div>

              {selectedOption === "custom" && (
                <div className="space-y-1.5">
                  <Input
                    label={t(
                      "credit.topup.amountLabel",
                      "Số lượng Credit cần nạp",
                    )}
                    inputMode="numeric"
                    placeholder="VD: 15.000"
                    value={customCredits}
                    onChange={(event) => {
                      setCustomCredits(formatThousandDots(event.target.value));
                      setCustomTouched(true);
                    }}
                    onBlur={() => setCustomTouched(true)}
                    disabled={submitting}
                    error={
                      customTouched && validation.error
                        ? validation.error
                        : undefined
                    }
                  />
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "credit.topup.customHint",
                      "Nhập số nguyên dương từ 1 đến 1.000.000 credit (Đơn giá: 200 VND / credit).",
                    )}
                  </p>
                </div>
              )}

              {checkoutError && (
                <div
                  role="alert"
                  className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTopUpOpen(false)}
                  disabled={submitting}
                >
                  {t("common.cancel", "Hủy")}
                </Button>
                <Button
                  type="submit"
                  variant="orange"
                  loading={submitting}
                  disabled={submitting || activeCredits === null}
                >
                  {activeCredits !== null
                    ? t("credit.topup.payButtonWithPrice", {
                        price: formatVnd(totalVnd),
                        defaultValue: `Thanh toán ${formatVnd(totalVnd)}`,
                      })
                    : t("credit.topup.payButton", "Thanh toán")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {t(
                  "subscription.checkout.transferInstructions",
                  "Quét mã VietQR hoặc chuyển khoản chính xác số tiền và nội dung bên dưới. Credit sẽ tự động cộng vào quỹ Agency ngay khi hệ thống nhận xác nhận thanh toán.",
                )}
              </p>

              <div className="grid gap-5 sm:grid-cols-[190px_1fr]">
                <div
                  className={cn(
                    "border-border mx-auto flex aspect-square w-full max-w-[190px] items-center justify-center rounded-lg border p-2",
                    qrExpired ? "bg-muted/30" : "bg-white",
                  )}
                >
                  {!qrExpired ? (
                    <img
                      src={order.qrUrl}
                      alt={t("subscription.checkout.qrAlt", "Mã QR thanh toán")}
                      className="aspect-square w-full object-contain"
                    />
                  ) : (
                    <p className="text-muted-foreground p-3 text-center text-xs">
                      {t(
                        "subscription.checkout.qrExpired",
                        "Mã QR đã hết hạn.",
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {t("credit.topup.creditsToReceive", "Số Credit nạp")}
                    </span>
                    <strong className="tabular-nums">
                      {activeCredits !== null
                        ? `${formatCredits(activeCredits, i18n.language)} Credits`
                        : "—"}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {t("subscription.checkout.amount", "Số tiền")}
                    </span>
                    <strong className="tabular-nums">
                      {formatVnd(BigInt(order.amount))}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {t(
                        "subscription.checkout.transferContentLabel",
                        "Nội dung CK",
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <strong className="font-mono text-xs break-all select-all">
                        {order.transferContent}
                      </strong>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyTransferContent(order.transferContent)
                        }
                        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
                        title={t("common.copy", "Sao chép")}
                      >
                        {copied ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {t("subscription.checkout.status", "Trạng thái")}
                    </span>
                    <strong role="status" data-testid="payment-state">
                      {t(`subscription.checkout.states.${order.status}`, {
                        defaultValue: order.status,
                      })}
                    </strong>
                  </div>

                  {order.status === "PENDING_PAYMENT" && !qrExpired && (
                    <div className="border-border/60 space-y-1.5 border-t pt-2">
                      <p
                        role="timer"
                        aria-live="off"
                        data-testid="payment-countdown"
                        className="text-muted-foreground text-xs tabular-nums"
                      >
                        {t("subscription.checkout.countdown", {
                          time: countdown,
                          defaultValue: `Thời hạn mã QR: ${countdown}`,
                        })}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2 text-xs">
                        <RefreshCw className="size-3.5 animate-spin" />
                        {t(
                          "subscription.checkout.waitingForWebhook",
                          "Đang chờ xác nhận thanh toán tự động...",
                        )}
                      </p>
                    </div>
                  )}

                  {order.status === "FULFILLED" && (
                    <p className="flex items-center gap-2 pt-1 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="size-4" />
                      {t(
                        "credit.topup.fulfilledNote",
                        "Đã nhận thanh toán và cộng Credit vào ví Agency!",
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                {order.status !== "FULFILLED" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOrder(null);
                      setCheckoutError(null);
                    }}
                  >
                    <ArrowLeft className="mr-1.5 size-3.5" />
                    {t("credit.topup.changeAmount", "Chọn lại số lượng")}
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  {(qrExpired || order.status !== "PENDING_PAYMENT") &&
                    order.status !== "FULFILLED" &&
                    activeCredits !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={submitting}
                        onClick={() => void createTopUpOrder(activeCredits)}
                      >
                        {t("subscription.checkout.startAgain", "Tạo mã QR mới")}
                      </Button>
                    )}

                  <Button
                    type="button"
                    variant={
                      order.status === "FULFILLED" ? "orange" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      if (order.status === "FULFILLED") {
                        setOrder(null);
                      }
                      setTopUpOpen(false);
                    }}
                  >
                    {t("credit.topup.close", "Đóng")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
