import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Copy,
  HardDrive,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { materialService } from "@/services/materialService";
import { formatBytes } from "./MaterialRepositoryCard";
import type { StorageAddonOrder, StorageAddonPlan } from "@/types/material";

const GiB = 1024 ** 3;

export function StorageAddonPanel({
  open,
  onOpenChange,
  agencyId,
  payerScope,
  usedBytes = 0,
  quotaBytes = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId?: string;
  payerScope: "AGENCY" | "CLIENT_VAULT";
  usedBytes?: number;
  quotaBytes?: number;
}) {
  const queryClient = useQueryClient();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [order, setOrder] = useState<StorageAddonOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["storage-addons"],
    enabled: open,
    queryFn: ({ signal }) => materialService.listStorageAddons(signal),
    staleTime: 60_000,
  });

  const orderStatusQuery = useQuery({
    queryKey: ["storage-order", order?.orderId],
    enabled: open && Boolean(order?.orderId) && order?.status === "PENDING",
    queryFn: ({ signal }) =>
      materialService.storageOrder(order!.orderId, signal),
    refetchInterval: (q) =>
      q.state.data?.status === "PENDING" ? 3000 : false,
  });

  const currentOrder = orderStatusQuery.data ?? order;

  useEffect(() => {
    if (
      plansQuery.data &&
      plansQuery.data.length > 0 &&
      !selectedPlanCode
    ) {
      const middle =
        plansQuery.data[Math.min(1, plansQuery.data.length - 1)] ??
        plansQuery.data[0];
      setSelectedPlanCode(middle.code);
    }
  }, [plansQuery.data, selectedPlanCode]);

  useEffect(() => {
    if (currentOrder?.status === "PAID") {
      toast.success("Thanh toán thành công! Dung lượng S3 đã được cộng thêm.");
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["client-vault-storage"] });
    }
  }, [currentOrder?.status, queryClient]);

  const handleCheckout = async (plan: StorageAddonPlan) => {
    if (payerScope === "AGENCY" && !agencyId) {
      toast.error("Không xác định được Agency để nâng cấp dung lượng");
      return;
    }
    setSubmitting(true);
    try {
      const created = await materialService.checkoutStorage(
        plan.code,
        agencyId,
        payerScope,
        crypto.randomUUID(),
      );
      setOrder(created);
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể khởi tạo đơn mua dung lượng S3",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (label: string, value?: string) => {
    if (!value) return;
    void navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast.success(`Đã sao chép ${label}`);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const usagePercent =
    quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 100)) : 0;

  const selectedPlan = plansQuery.data?.find(
    (p) => p.code === selectedPlanCode,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setOrder(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl p-0 [&>[data-slot=dialog-close]]:rounded-lg [&>[data-slot=dialog-close]]:p-1 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-85 [&>[data-slot=dialog-close]]:hover:bg-white/10 [&>[data-slot=dialog-close]]:hover:opacity-100">
        {/* Dark BrandHub Header */}
        <div className="bg-[#16171B] px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white shadow-sm">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">
                  Mua thêm dung lượng lưu trữ S3
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  {payerScope === "AGENCY"
                    ? "Cộng dồn trực tiếp vào hạn mức lưu trữ S3 của Agency (vĩnh viễn)"
                    : "Cộng dồn trực tiếp vào Kho lưu trữ cá nhân của bạn"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Current Usage Summary Strip */}
          {quotaBytes > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Dung lượng đang sử dụng</span>
                <span className="font-semibold tabular-nums text-white">
                  {formatBytes(usedBytes)} / {formatBytes(quotaBytes)} ({usagePercent}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    usagePercent >= 90
                      ? "bg-red-500"
                      : usagePercent >= 75
                        ? "bg-amber-400"
                        : "bg-brand-orange"
                  }`}
                  style={{ width: `${Math.max(3, usagePercent)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {!currentOrder ? (
            <div className="space-y-5">
              {plansQuery.isLoading ? (
                <div className="flex h-44 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(plansQuery.data ?? []).map((plan, idx) => {
                      const gb = Math.round(Number(plan.extraBytes) / GiB);
                      const priceVnd = Number(plan.priceMonthlyVnd);
                      const isSelected = plan.code === selectedPlanCode;
                      const isPopular = idx === 1;

                      return (
                        <button
                          key={plan.code}
                          type="button"
                          onClick={() => setSelectedPlanCode(plan.code)}
                          className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-brand-orange bg-brand-orange/[0.06] ring-2 ring-brand-orange shadow-sm"
                              : "border-border/80 bg-card hover:border-brand-orange/40 hover:bg-muted/30"
                          }`}
                        >
                          {isPopular && (
                            <span className="-top-2.5 right-3 absolute inline-flex items-center gap-1 rounded-full bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                              <Sparkles className="h-2.5 w-2.5" />
                              Phổ biến
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center rounded-lg bg-brand-orange/15 px-2.5 py-1 text-xs font-extrabold text-brand-orange">
                                +{gb} GB
                              </span>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "border-brand-orange bg-brand-orange text-white"
                                    : "border-muted-foreground/40"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                            </div>

                            <p className="mt-3 text-lg font-extrabold tabular-nums text-foreground">
                              {priceVnd.toLocaleString("vi-VN")} ₫
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Thanh toán 1 lần • Cộng thêm {gb} GB S3
                            </p>
                          </div>

                          {quotaBytes > 0 && (
                            <div className="mt-4 border-t border-border/60 pt-2.5 text-[11px] font-medium text-muted-foreground">
                              Sau nâng cấp:{" "}
                              <strong className="text-foreground">
                                {formatBytes(quotaBytes + Number(plan.extraBytes))}
                              </strong>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>
                        Kích hoạt tự động ngay sau khi quét mã VietQR (SePay)
                      </span>
                    </div>

                    <Button
                      type="button"
                      disabled={!selectedPlan || submitting}
                      onClick={() =>
                        selectedPlan && void handleCheckout(selectedPlan)
                      }
                      className="h-10 gap-2 rounded-xl bg-brand-orange px-5 text-xs font-bold text-white shadow-sm hover:bg-brand-orange/90"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4" />
                      )}
                      <span>
                        {selectedPlan
                          ? `Thanh toán +${Math.round(Number(selectedPlan.extraBytes) / GiB)} GB (${Number(selectedPlan.priceMonthlyVnd).toLocaleString("vi-VN")} ₫)`
                          : "Chọn gói dung lượng"}
                      </span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : currentOrder.status === "PAID" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Nâng cấp dung lượng S3 thành công!
              </h3>
              <p className="max-w-sm text-xs text-muted-foreground">
                Đã cộng thêm{" "}
                <strong>
                  +
                  {Math.round(
                    Number(
                      plansQuery.data?.find(
                        (p) => p.code === currentOrder.planCode,
                      )?.extraBytes ??
                        selectedPlan?.extraBytes ??
                        0,
                    ) / GiB,
                  )}{" "}
                  GB
                </strong>{" "}
                vào kho lưu trữ của bạn. Bạn có thể tiếp tục tải tệp lên ngay.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setOrder(null);
                  onOpenChange(false);
                }}
                className="mt-2 rounded-xl bg-brand-orange px-6 text-xs font-semibold text-white hover:bg-brand-orange/90"
              >
                Hoàn tất
              </Button>
            </div>
          ) : (
            /* 2-Column SePay QR Checkout View */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-white p-4 text-center shadow-xs">
                {currentOrder.qrUrl ? (
                  <img
                    src={currentOrder.qrUrl}
                    alt="Mã QR thanh toán dung lượng S3"
                    className="h-52 w-52 object-contain"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-xs text-zinc-500">
                    Đang tạo mã QR...
                  </div>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-orange" />
                  Đang chờ xác nhận thanh toán tự động...
                </span>
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <span className="shrink-0 text-muted-foreground">Gói nâng cấp</span>
                    <span className="font-bold text-brand-orange">
                      +
                      {Math.round(
                        Number(
                          plansQuery.data?.find(
                            (p) => p.code === currentOrder.planCode,
                          )?.extraBytes ??
                            selectedPlan?.extraBytes ??
                            0,
                        ) / GiB,
                      )}{" "}
                      GB S3
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Số tiền</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {Number(currentOrder.amount).toLocaleString("vi-VN")}{" "}
                      {currentOrder.currency || "₫"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        Nội dung chuyển khoản (bắt buộc)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            "nội dung chuyển khoản",
                            currentOrder.transferContent,
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-brand-orange px-2.5 py-1 text-[10px] font-bold text-white hover:bg-brand-orange/90"
                      >
                        {copiedField === "nội dung chuyển khoản" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Sao chép</span>
                      </button>
                    </div>
                    <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-3 py-2">
                      <span className="block break-all font-mono text-xs font-extrabold tracking-wide text-brand-orange">
                        {currentOrder.transferContent}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOrder(null)}
                  className="w-full rounded-xl text-xs"
                >
                  ← Chọn gói dung lượng khác
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
