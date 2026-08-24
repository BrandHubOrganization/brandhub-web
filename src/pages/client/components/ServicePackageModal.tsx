import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  UpdateServicePackageDTO,
  PackageTier,
} from "../types/client";
import { Package, Zap } from "lucide-react";

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
  const { t } = useTranslation();
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
      FREE: 5,
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
            <Package className="text-brand-orange size-4" />
            {t("client.servicePackage.modalTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {client && (
            <div className="bg-muted/40 space-y-1 rounded-lg p-3 text-xs">
              <span className="text-muted-foreground block">
                {t("client.servicePackage.appliedBrand")}
              </span>
              <strong className="text-foreground text-sm font-bold">
                {client.name}
              </strong>
            </div>
          )}

          {/* Hạng gói dịch vụ */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("client.servicePackage.tierLabel")}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["STARTER", "GROWTH", "ENTERPRISE"] as PackageTier[]).map(
                (tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierChange(tier)}
                    className={`text-3xs cursor-pointer rounded-lg border p-2.5 text-center font-bold transition-all sm:text-xs ${
                      formData.packageTier === tier
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/10"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {tier}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Quota bài viết & AI credits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="postLimit" className="text-xs font-semibold">
                {t("client.servicePackage.postLimitLabel")}
              </Label>
              <Input
                id="postLimit"
                type="number"
                value={formData.monthlyPostLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyPostLimit: Number(e.target.value),
                  })
                }
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="aiCredits"
                className="flex items-center gap-1 text-xs font-semibold"
              >
                <Zap className="size-3 text-amber-500" />{" "}
                {t("client.servicePackage.aiCreditsLabel")}
              </Label>
              <Input
                id="aiCredits"
                type="number"
                value={formData.aiCreditsPerMonth || 200}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aiCreditsPerMonth: Number(e.target.value),
                  })
                }
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Ngày hết hạn gói */}
          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs font-semibold">
              {t("client.servicePackage.expiryLabel")}
            </Label>
            <Input
              id="expiry"
              type="date"
              value={formData.expiryDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer text-xs"
            >
              {t("client.servicePackage.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white"
            >
              {isLoading
                ? t("client.servicePackage.processing")
                : t("client.servicePackage.updateButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
