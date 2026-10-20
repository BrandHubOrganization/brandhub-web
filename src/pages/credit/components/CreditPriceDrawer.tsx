import { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Coins,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { CreditOperation, CreditPrice } from "@/pages/credit/types/credit";
import {
  creditInteger,
  creditUnit,
  creditErrorKey,
} from "@/pages/credit/utils/creditInput";
import { OPERATION_CONFIG } from "@/pages/credit/utils/creditOperations";

interface CreditPriceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: CreditOperation | null;
  price?: CreditPrice;
  rateVnd?: number;
  onSave: (
    operation: CreditOperation,
    amount: number,
    enabled: boolean,
    expectedRevision: number,
  ) => Promise<void>;
  onReload: (
    operation: CreditOperation,
  ) => Promise<{ initial: number | null; enabled?: boolean }>;
}

export function CreditPriceDrawer({
  open,
  onOpenChange,
  operation,
  price,
  rateVnd = 200,
  onSave,
  onReload,
}: CreditPriceDrawerProps) {
  if (!operation) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-l border-border/80 p-0 sm:max-w-md md:max-w-lg"
      >
        <CreditPriceDrawerContent
          key={`${operation}-${price?.revision ?? 0}`}
          operation={operation}
          price={price}
          rateVnd={rateVnd}
          onClose={() => onOpenChange(false)}
          onSave={onSave}
          onReload={onReload}
        />
      </SheetContent>
    </Sheet>
  );
}

interface CreditPriceDrawerContentProps {
  operation: CreditOperation;
  price?: CreditPrice;
  rateVnd: number;
  onClose: () => void;
  onSave: (
    operation: CreditOperation,
    amount: number,
    enabled: boolean,
    expectedRevision: number,
  ) => Promise<void>;
  onReload: (
    operation: CreditOperation,
  ) => Promise<{ initial: number | null; enabled?: boolean }>;
}

function CreditPriceDrawerContent({
  operation,
  price,
  rateVnd,
  onClose,
  onSave,
  onReload,
}: CreditPriceDrawerContentProps) {
  const { t } = useTranslation();
  const inputId = useId();

  const [unitCreditsDraft, setUnitCreditsDraft] = useState<string>(() =>
    price?.unitCredits !== undefined && price.unitCredits !== null
      ? String(price.unitCredits)
      : "10",
  );
  const [enabledDraft, setEnabledDraft] = useState<boolean>(
    () => price?.enabled ?? true,
  );
  const [currentRevision, setCurrentRevision] = useState<number>(
    () => price?.revision ?? 0,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const meta = OPERATION_CONFIG[operation] || {
    icon: Sparkles,
    label: operation,
    description: t(`credit.operations.${operation}`),
    unitLabel: creditUnit(operation),
    unitDesc: t(`credit.unitName.${creditUnit(operation)}`),
  };
  const IconComponent = meta.icon;

  const parsedAmount = creditInteger(unitCreditsDraft);
  const isInputValid = parsedAmount !== null;
  const isUnsafe =
    !Number.isSafeInteger(currentRevision) ||
    (parsedAmount !== null && !Number.isSafeInteger(parsedAmount));

  const estimatedVnd =
    parsedAmount !== null
      ? new Intl.NumberFormat("vi-VN").format(parsedAmount * rateVnd)
      : null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isInputValid || isSaving || isStale || isUnsafe) return;

    setIsSaving(true);
    setErrorMsg(null);
    setIsStale(false);

    try {
      await onSave(operation, parsedAmount, enabledDraft, currentRevision);
      onClose();
    } catch (err) {
      const errorKey = creditErrorKey(err);
      if (errorKey === "credit.errors.stale") {
        setIsStale(true);
        setErrorMsg(t("credit.errors.stale"));
      } else {
        setErrorMsg(t(errorKey));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReloadFresh = async () => {
    setIsReloading(true);
    setErrorMsg(null);
    try {
      const fresh = await onReload(operation);
      if (fresh.initial !== null && fresh.initial !== undefined) {
        setUnitCreditsDraft(String(fresh.initial));
      }
      setEnabledDraft(fresh.enabled ?? false);
      if (price?.revision !== undefined) {
        setCurrentRevision(price.revision);
      }
      setIsStale(false);
    } catch (err) {
      setErrorMsg(t(creditErrorKey(err)));
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <>
      {/* Drawer Header */}
      <SheetHeader className="border-b border-border/80 bg-muted/15 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconComponent className="size-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-lg font-bold tracking-tight text-foreground">
                {t(`credit.operations.${operation}`, {
                  defaultValue: meta.label,
                })}
              </SheetTitle>
              <Badge
                variant="outline"
                className="font-mono text-[11px] text-muted-foreground"
              >
                Rev #{currentRevision}
              </Badge>
            </div>
            <SheetDescription className="text-xs leading-relaxed text-muted-foreground">
              {meta.description}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      {/* Drawer Body */}
      <form
        id="credit-price-form"
        onSubmit={handleSave}
        noValidate
        className="flex-1 space-y-6 p-5 sm:p-6"
      >
        {/* Stale Concurrency Warning Alert */}
        {isStale && (
          <div className="flex flex-col gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="size-5 shrink-0" />
              <span>Xung đột phiên bản (Stale Revision)</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("credit.errors.stale")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReloadFresh}
              disabled={isReloading}
              className="mt-1 w-fit gap-2 border-destructive/30 bg-background text-xs font-semibold text-destructive hover:bg-destructive/15"
            >
              <RefreshCw
                className={`size-3.5 ${isReloading ? "animate-spin" : ""}`}
              />
              <span>Tải lại dữ liệu mới nhất</span>
            </Button>
          </div>
        )}

        {/* General Error Banner */}
        {errorMsg && !isStale && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Unit Type Info Card */}
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Đơn vị tính quy chuẩn
            </span>
            <p className="text-xs text-muted-foreground">{meta.unitDesc}</p>
          </div>
          <Badge variant="secondary" className="font-medium">
            {meta.unitLabel}
          </Badge>
        </div>

        {/* Unit Credits Input */}
        <div className="space-y-2">
          <label
            htmlFor={inputId}
            className="flex items-center justify-between text-xs font-semibold text-foreground"
          >
            <span>{t("credit.price.amount")} (Credits)</span>
            <span className="font-normal text-muted-foreground">
              Số nguyên không âm
            </span>
          </label>
          <div className="relative">
            <Input
              id={inputId}
              type="text"
              inputMode="numeric"
              required
              disabled={isSaving || isUnsafe}
              value={unitCreditsDraft}
              onChange={(e) => {
                setUnitCreditsDraft(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="font-mono text-base font-bold pr-16"
              placeholder="0"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
              Credits
            </span>
          </div>

          {!isInputValid && unitCreditsDraft.trim() !== "" && (
            <p className="text-xs text-destructive">
              {t("credit.errors.integer")}
            </p>
          )}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t("credit.zeroPriceHint")}
          </p>
        </div>

        {/* Realtime VND Reference Preview Bento */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30 p-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Coins className="size-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Quy đổi tham chiếu (1 Credit = {rateVnd} VNĐ)
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 text-[10px] text-primary"
            >
              Tham chiếu
            </Badge>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {parsedAmount === null
                ? "—"
                : parsedAmount === 0
                  ? "0 VNĐ (Miễn phí)"
                  : `~${estimatedVnd} VNĐ`}
            </span>
            {parsedAmount !== null && parsedAmount > 0 && (
              <span className="text-xs text-muted-foreground">
                / {meta.unitLabel.toLowerCase()}
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Tỷ giá quy đổi nội bộ dùng để ước tính chi phí vận hành AI.
          </p>
        </div>

        {/* Kill-Switch Service Status */}
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                Trạng thái phục vụ (Kill-Switch)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Cho phép người dùng tạo yêu cầu với model AI này
              </p>
            </div>
            <Switch
              id={`${inputId}-enabled`}
              checked={enabledDraft}
              onCheckedChange={setEnabledDraft}
              disabled={isSaving || isUnsafe}
            />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            {enabledDraft ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Đang hoạt động (ACTIVE) — Sẵn sàng phục vụ</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-3.5" />
                <span>Tạm ngưng (DISABLED) — Cảnh báo bảo trì model</span>
              </div>
            )}
          </div>
        </div>

        {/* Concurrency Safe Notice */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          <HelpCircle className="size-4 shrink-0 text-muted-foreground/80" />
          <span>
            Mỗi lần lưu sẽ tăng phiên bản (Rev #{currentRevision} &rarr; Rev #
            {currentRevision + 1}) và bảo toàn lịch sử giao dịch trước đó.
          </span>
        </div>
      </form>

      {/* Drawer Footer */}
      <SheetFooter className="border-t border-border/80 bg-muted/15 p-4 sm:p-5">
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="credit-price-form"
            variant="orange"
            disabled={isSaving || isStale || !isInputValid || isUnsafe}
            className="min-w-[130px] gap-2"
          >
            {isSaving ? (
              <>
                <Spinner className="size-4 text-white" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
