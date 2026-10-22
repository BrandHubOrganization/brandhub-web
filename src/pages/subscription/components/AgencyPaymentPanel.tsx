import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  agencyBillingService,
  type AgencyBillingOrder,
} from "@/services/agencyBillingService";
import { useAgencyStore } from "@/store/agencyStore";

export function AgencyPaymentPanel({
  scope,
  onFulfilled,
  action = "UPGRADE",
}: {
  scope: string;
  onFulfilled?: () => void;
  action?: "UPGRADE" | "RENEWAL";
}) {
  const { t, i18n } = useTranslation();
  const agencyId = useAgencyStore((state) => state.currentAgencyId);
  const agency = useAgencyStore((state) =>
    state.agencyList.find((item) => item.id === state.currentAgencyId),
  );
  const isPlus = true;
  const [order, setOrder] = useState<AgencyBillingOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageKey = `brandhub-plus-checkout:${scope}`;
  const [idempotencyKey, setIdempotencyKey] = useState(() => {
    const key = sessionStorage.getItem(storageKey) || crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
    return key;
  });
  const creatingRef = useRef(false);
  const attemptedKey = useRef<string | null>(null);
  const isOwner = Boolean(agencyId && agency?.myRole === "OWNER");

  useEffect(() => {
    if (!isPlus || !isOwner || attemptedKey.current === idempotencyKey) return;
    attemptedKey.current = idempotencyKey;
    void createOrder();
    // Creation is triggered only by eligible context or an explicit new attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlus, isOwner, idempotencyKey]);

  async function createOrder() {
    if (!agencyId || !isOwner || !isPlus || creatingRef.current) return;
    creatingRef.current = true;
    setIsCreating(true);
    setError(null);
    try {
      const result = await agencyBillingService.createPlusOrder(
        agencyId,
        idempotencyKey,
        action,
      );
      setOrder(result);
    } catch (cause) {
      const apiError = (
        cause as {
          response?: { data?: { error?: { code?: string; message?: string } } };
        }
      )?.response?.data?.error;
      if (apiError?.code === "BILLING_NOT_CONFIGURED") {
        setError(t("subscription.checkout.notConfigured"));
      } else if (apiError?.code === "BILLING_SUBSCRIPTION_NOT_READY") {
        setError(t("subscription.plans.subscriptionNotReady"));
      } else {
        setError(apiError?.message || t("subscription.checkout.payError"));
      }
    } finally {
      creatingRef.current = false;
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!order || !agencyId || order.status !== "PENDING_PAYMENT") return;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const latest = await agencyBillingService.getOrder(
          agencyId,
          order.orderId,
        );
        if (!cancelled) {
          setOrder(latest);
          if (latest.status !== "PENDING_PAYMENT") window.clearInterval(timer);
        }
      } catch {
        // Keep the current pending state. The owner can retry explicitly.
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [agencyId, order]);

  useEffect(() => {
    if (order?.status === "FULFILLED") onFulfilled?.();
  }, [order?.status, onFulfilled]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (order?.status !== "PENDING_PAYMENT") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [order?.status, order?.expiresAt]);

  const remainingSeconds = order
    ? Math.max(0, Math.ceil((Date.parse(order.expiresAt) - now) / 1000))
    : 0;
  const qrExpired =
    order?.status === "EXPIRED" ||
    (order?.status === "PENDING_PAYMENT" && remainingSeconds === 0);
  const countdown = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const formattedAmount = order
    ? new Intl.NumberFormat(i18n.language === "vi" ? "vi-VN" : "en-US").format(
        BigInt(order.amount),
      )
    : null;

  return (
    <>
      {!isPlus || !isOwner ? (
        <div
          role="alert"
          className="border-border bg-card text-muted-foreground rounded-xl border p-6 text-sm"
        >
          {t("subscription.plans.ownerOnly")}
        </div>
      ) : (
        <div className="min-w-0">
          <p className="text-muted-foreground mt-1 text-sm">
            {t("subscription.checkout.transferInstructions")}
          </p>

          {!order && !error && (
            <p
              role="status"
              className="text-muted-foreground mt-6 flex items-center gap-2 text-sm"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("subscription.checkout.generatingQr")}
            </p>
          )}
          {!order && error && (
            <Button
              className="mt-6 w-full"
              variant="outline"
              onClick={createOrder}
              disabled={isCreating}
            >
              {t("subscription.catalog.retry")}
            </Button>
          )}

          {error && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/5 text-destructive mt-5 flex items-start gap-2 rounded-lg border p-3 text-sm"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
              <div className={`border-border mx-auto w-full max-w-[220px] rounded-lg border p-2 ${qrExpired ? "bg-card" : "bg-white"}`}>
                {!qrExpired && (
                  <img
                    src={order.qrUrl}
                    alt={t("subscription.checkout.qrAlt")}
                    className="aspect-square w-full object-contain"
                  />
                )}
                {qrExpired && (
                  <p className="text-muted-foreground p-4 text-center text-sm">
                    {t("subscription.checkout.qrExpired")}
                  </p>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("subscription.checkout.amount")}
                  </span>
                  <strong>
                    {formattedAmount} {order.currency}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("subscription.checkout.transferContentLabel")}
                  </span>
                  <strong className="min-w-0 text-right break-all select-all">
                    {order.transferContent}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("subscription.checkout.status")}
                  </span>
                  <strong role="status" data-testid="payment-state">
                    {t(
                      action === "RENEWAL" && order.status === "FULFILLED"
                        ? "subscription.checkout.renewalRecorded"
                        : `subscription.checkout.states.${order.status}`,
                      {
                        defaultValue: order.status,
                      },
                    )}
                  </strong>
                </div>
                {order.status === "PENDING_PAYMENT" && (
                  <p
                    role="timer"
                    aria-live="off"
                    data-testid="payment-countdown"
                    className="text-muted-foreground text-xs tabular-nums"
                  >
                    {t("subscription.checkout.countdown", { time: countdown })}
                  </p>
                )}
                {order.status === "PENDING_PAYMENT" && (
                  <p className="text-muted-foreground flex items-center gap-2 text-xs">
                    <RefreshCw className="size-3.5 animate-spin" />
                    {t("subscription.checkout.waitingForWebhook")}
                  </p>
                )}
                {order.status === "FULFILLED" && (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="size-4" />
                    {t(
                      action === "RENEWAL"
                        ? "subscription.checkout.renewed"
                        : "subscription.checkout.activated",
                    )}
                  </p>
                )}
                {(qrExpired || order.status !== "PENDING_PAYMENT") &&
                  order.status !== "FULFILLED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const key = crypto.randomUUID();
                        sessionStorage.setItem(storageKey, key);
                        setOrder(null);
                        setIdempotencyKey(key);
                      }}
                    >
                      {t("subscription.checkout.startAgain")}
                    </Button>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
