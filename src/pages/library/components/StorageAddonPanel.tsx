import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { formatFileSize } from "@/lib/utils";
import type { StorageAddonOrder } from "@/types/material";
export function StorageAddonPanel() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<StorageAddonOrder>();
  const [key] = useState(() => crypto.randomUUID());
  const label = (name: string) => t(`materials.repository.${name}`);
  const plans = useQuery({
    queryKey: ["storage-addon-plans"],
    enabled: open,
    queryFn: ({ signal }) => materialService.listStorageAddons(signal),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (plan: string) =>
      materialService.checkoutStorage(
        plan,
        role === "CLIENT" ? undefined : (workspace?.agencyId ?? undefined),
        role === "CLIENT" ? "CLIENT_VAULT" : "AGENCY",
        `${key}:${plan}`,
      ),
    onSuccess: setOrder,
  });
  const payment = useQuery({
    queryKey: ["storage-addon-order", actor, order?.orderId],
    enabled: !!order,
    queryFn: ({ signal }) =>
      materialService.storageOrder(order!.orderId, signal),
    refetchInterval: (query) =>
      ["PENDING_PAYMENT", "PAID"].includes(
        query.state.data?.status ?? order?.status ?? "",
      )
        ? 3000
        : false,
    retry: false,
  });
  const current = payment.data ?? order;
  return (
    <section className="space-y-3">
      <Button variant="outline" onClick={() => setOpen(!open)}>
        {label("buyStorage")}
      </Button>
      {open && (
        <div className="border-border bg-card space-y-3 rounded-lg border p-3">
          <p className="text-muted-foreground text-sm">
            {label("storageNotice")}
          </p>
          {plans.isError && <p role="alert">{label("failed")}</p>}
          {plans.isPending && <p role="status">{label("loading")}</p>}
          {plans.data?.map((plan) => (
            <div
              key={plan.code}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span>
                +{formatFileSize(plan.extraBytes)} ·{" "}
                {t("materials.repository.monthlyPrice", {
                  price: Number(plan.priceMonthlyVnd).toLocaleString(),
                })}
              </span>
              {(role === "OWNER" || role === "CLIENT") && (
                <Button
                  disabled={
                    mutation.isPending ||
                    (!!current && current.status === "PENDING_PAYMENT")
                  }
                  onClick={() => mutation.mutate(plan.code)}
                >
                  {label("checkout")}
                </Button>
              )}
            </div>
          ))}
          {mutation.isError && (
            <p role="alert">{label("checkoutUnavailable")}</p>
          )}
          {current && (
            <div className="space-y-2" role="status">
              <p>
                {current.status === "FULFILLED"
                  ? label("checkoutFulfilled")
                  : label("checkoutPending")}
              </p>
              <p>
                {label("checkoutAmount")}:{" "}
                {Number(current.amount).toLocaleString()} {current.currency}
              </p>
              <p>
                {label("checkoutCode")}:{" "}
                <strong>{current.transferContent}</strong>
              </p>
              <p>
                {label("checkoutExpiry")}:{" "}
                {new Date(current.expiresAt).toLocaleString()}
              </p>
              {current.status === "PENDING_PAYMENT" && (
                <img
                  className="max-w-64"
                  src={current.qrUrl}
                  alt={label("checkout")}
                />
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  void payment.refetch();
                  void client.invalidateQueries({
                    queryKey: ["material-storage-usage"],
                  });
                }}
              >
                {label("retry")}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
