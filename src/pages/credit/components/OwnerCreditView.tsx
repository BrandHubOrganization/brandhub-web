import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/services/api";
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

export function OwnerCreditView({ agencyId }: { agencyId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [credits, setCredits] = useState("500");
  const [submitting, setSubmitting] = useState(false);

  const handleTopUp = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number.parseInt(credits, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setSubmitting(true);
    try {
      await api.post("/api/v1/billing/credits/buy", {
        amount,
        credits: amount,
        paymentMethod: "SEPAY",
        agencyId,
      });
      await queryClient.invalidateQueries({
        queryKey: ["credit-balance", agencyId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["ai-credit-balance"],
      });
      setTopUpOpen(false);
      toast.success(
        t("credit.topup.success", "Đã nạp thêm Credit cho Agency thành công."),
      );
    } catch {
      toast.error(
        t("credit.topup.error", "Không thể nạp thêm Credit. Vui lòng thử lại."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <CreditBalancePanel
        agencyId={agencyId}
        onTopUpClick={() => setTopUpOpen(true)}
      />
      <WorkspaceCreditPanel agencyId={agencyId} canEdit />
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="rounded-xl">
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
          <form className="space-y-4" onSubmit={handleTopUp}>
            <Input
              label={t("credit.topup.amountLabel", "Số lượng Credit cần nạp")}
              type="number"
              min={1}
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
              disabled={submitting}
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTopUpOpen(false)}
                disabled={submitting}
              >
                {t("common.cancel", "Hủy")}
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {t("credit.topup.confirm", "Xác nhận nạp Credit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
