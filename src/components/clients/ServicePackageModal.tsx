import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  Client,
  PackageTier,
  UpdateServicePackageDTO,
} from "@/types/client";
import { Zap, Calendar, AlertCircle } from "lucide-react";

interface ServicePackageModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSubmit: (clientId: string, dto: UpdateServicePackageDTO) => Promise<void>;
  isLoading?: boolean;
}

export function ServicePackageModal({
  isOpen,
  client,
  onClose,
  onSubmit,
  isLoading = false,
}: ServicePackageModalProps) {
  const [tier, setTier] = useState<PackageTier>("GROWTH");
  const [quota, setQuota] = useState<number>(30);
  const [expiryDate, setExpiryDate] = useState<string>("2026-12-31");

  useEffect(() => {
    if (client) {
      setTier(client.servicePackage.packageTier);
      setQuota(client.servicePackage.monthlyPostQuota);
      setExpiryDate(client.servicePackage.expiryDate || "2026-12-31");
    }
  }, [client]);

  if (!client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(client.id, {
      packageTier: tier,
      monthlyPostLimit: Number(quota),
      expiryDate,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Zap className="size-4 text-amber-500" />
            Cấu hình Gói Dịch Vụ — {client.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Cấp độ gói (Tier) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Cấp độ Gói Dịch Vụ (Tier)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["STARTER", "GROWTH", "ENTERPRISE"] as PackageTier[]).map(
                (t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setTier(t);
                      setQuota(t === "STARTER" ? 15 : t === "GROWTH" ? 30 : 45);
                    }}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      tier === t
                        ? "border-[#f05a28] bg-[#f05a28]/10 text-[#f05a28]"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{t}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {t === "STARTER"
                        ? "15 bài"
                        : t === "GROWTH"
                          ? "30 bài"
                          : "45 bài"}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Hạn ngạch bài đăng / tháng */}
          <div className="space-y-1.5">
            <Label htmlFor="quota" className="text-xs font-semibold">
              Hạn ngạch Bài đăng hàng tháng (Post Quota)
            </Label>
            <Input
              id="quota"
              type="number"
              min={1}
              max={500}
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="text-xs"
            />
          </div>

          {/* Ngày hết hạn */}
          <div className="space-y-1.5">
            <Label
              htmlFor="expiry"
              className="flex items-center gap-1 text-xs font-semibold"
            >
              <Calendar className="text-muted-foreground size-3" /> Ngày hết hạn
              gói dịch vụ
            </Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Giao diện sẽ tự động cập nhật ngay lập tức (Optimistic Update).
              Nếu hệ thống gặp sự cố, gói cũ sẽ tự động được khôi phục.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="cursor-pointer bg-[#f05a28] text-xs font-semibold text-white hover:bg-[#f05a28]/90"
            >
              {isLoading ? "Đang lưu..." : "Cập nhật Gói Dịch Vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
