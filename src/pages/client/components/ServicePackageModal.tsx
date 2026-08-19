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
import type { Client, UpdateServicePackageDTO, PackageTier } from "../types/client";
import { ShieldCheck, Zap } from "lucide-react";

interface ServicePackageModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateServicePackageDTO) => Promise<void>;
  isLoading?: boolean;
}

export function ServicePackageModal({
  isOpen,
  client,
  onClose,
  onSubmit,
  isLoading = false,
}: ServicePackageModalProps) {
  const [formData, setFormData] = useState<UpdateServicePackageDTO>({
    packageTier: "GROWTH",
    monthlyPostLimit: 30,
    aiCreditsPerMonth: 200,
    expiryDate: "2026-12-31",
  });

  useEffect(() => {
    if (client?.servicePackage) {
      setFormData({
        packageTier: client.servicePackage.packageTier,
        monthlyPostLimit: client.servicePackage.monthlyPostQuota,
        aiCreditsPerMonth: client.servicePackage.aiCreditsPerMonth || 200,
        expiryDate: client.servicePackage.expiryDate || "2026-12-31",
      });
    }
  }, [client]);

  const handleTierChange = (tier: PackageTier) => {
    const quotaMap: Record<PackageTier, number> = {
      STARTER: 15,
      GROWTH: 30,
      ENTERPRISE: 45,
    };
    setFormData((prev) => ({
      ...prev,
      packageTier: tier,
      monthlyPostLimit: quotaMap[tier],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    await onSubmit(client.id, formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="size-4 text-[#f05a28]" />
            Nâng cấp / Điều chỉnh Gói dịch vụ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {client && (
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <span className="text-muted-foreground block">Thương hiệu áp dụng:</span>
              <strong className="text-foreground text-sm font-bold">{client.name}</strong>
            </div>
          )}

          {/* Hạng gói dịch vụ */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Chọn Hạng Gói (Tier)</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["STARTER", "GROWTH", "ENTERPRISE"] as PackageTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleTierChange(tier)}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                    formData.packageTier === tier
                      ? "border-[#f05a28] bg-[#fff0eb] text-[#f05a28] dark:bg-[#f05a28]/10"
                      : "border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Quota bài viết & AI credits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="postLimit" className="text-xs font-semibold">
                Quota Post / Tháng
              </Label>
              <Input
                id="postLimit"
                type="number"
                value={formData.monthlyPostLimit}
                onChange={(e) => setFormData({ ...formData, monthlyPostLimit: Number(e.target.value) })}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aiCredits" className="text-xs font-semibold flex items-center gap-1">
                <Zap className="size-3 text-amber-500" /> AI Credits / Tháng
              </Label>
              <Input
                id="aiCredits"
                type="number"
                value={formData.aiCreditsPerMonth || 200}
                onChange={(e) => setFormData({ ...formData, aiCreditsPerMonth: Number(e.target.value) })}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Ngày hết hạn gói */}
          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs font-semibold">
              Ngày hết hạn hợp đồng / gói dịch vụ
            </Label>
            <Input
              id="expiry"
              type="date"
              value={formData.expiryDate || ""}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white text-xs gap-1.5 cursor-pointer"
            >
              {isLoading ? "Đang xử lý..." : "Cập nhật Gói Dịch Vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
