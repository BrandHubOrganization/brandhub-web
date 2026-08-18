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
import type { Client, PackageTier, UpdateServicePackageDTO } from "@/types/client";
import type { Platform } from "@/types/post";
import {
  Zap,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";

interface ServicePackageModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSubmit: (clientId: string, dto: UpdateServicePackageDTO) => Promise<void>;
  isLoading?: boolean;
  workspaceMaxPosts?: number; // Workspace subscription limit
}

const AVAILABLE_PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: "FACEBOOK", label: "Facebook Fanpage", color: "text-blue-500" },
  { id: "INSTAGRAM", label: "Instagram Business", color: "text-pink-500" },
  { id: "TIKTOK", label: "TikTok Channel", color: "text-slate-800 dark:text-slate-100" },
  { id: "THREADS", label: "Threads Account", color: "text-purple-500" },
  { id: "YOUTUBE", label: "YouTube Channel", color: "text-red-500" },
];

export function ServicePackageModal({
  isOpen,
  client,
  onClose,
  onSubmit,
  isLoading = false,
  workspaceMaxPosts = 100, // Default workspace subscription quota limit
}: ServicePackageModalProps) {
  const [tier, setTier] = useState<PackageTier>("GROWTH");
  const [quota, setQuota] = useState<number>(30);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "FACEBOOK",
    "INSTAGRAM",
    "TIKTOK",
  ]);
  const [aiCredits, setAiCredits] = useState<number>(250);
  const [expiryDate, setExpiryDate] = useState<string>("2026-12-31");

  const [platformError, setPlatformError] = useState<string>("");

  useEffect(() => {
    if (client) {
      setTier(client.servicePackage.packageTier);
      setQuota(client.servicePackage.monthlyPostQuota || 30);
      setSelectedPlatforms(
        client.servicePackage.platforms && client.servicePackage.platforms.length > 0
          ? client.servicePackage.platforms
          : ["FACEBOOK", "INSTAGRAM", "TIKTOK"]
      );
      setAiCredits(client.servicePackage.aiCreditsPerMonth ?? 250);
      setExpiryDate(client.servicePackage.expiryDate || "2026-12-31");
      setPlatformError("");
    }
  }, [client]);

  if (!client) return null;

  const togglePlatform = (pId: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(pId) ? prev.filter((p) => p !== pId) : [...prev, pId];
      if (next.length > 0) setPlatformError("");
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) {
      setPlatformError("Yêu cầu chọn ít nhất 1 nền tảng mạng xã hội.");
      return;
    }

    await onSubmit(client.id, {
      packageTier: tier,
      monthlyPostLimit: Number(quota),
      allowedPlatforms: selectedPlatforms,
      aiCreditsPerMonth: Number(aiCredits),
      expiryDate,
    });
    onClose();
  };

  const isExceedingWorkspaceLimit = quota > workspaceMaxPosts;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Zap className="size-4 text-[#f05a28]" />
            Cấu hình Gói Dịch Vụ — {client.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Cấp độ gói (Tier) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Layers className="size-3.5 text-muted-foreground" /> Cấp độ Gói (Tier)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["STARTER", "GROWTH", "ENTERPRISE"] as PackageTier[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setTier(t);
                    const defaultPosts = t === "STARTER" ? 15 : t === "GROWTH" ? 30 : 60;
                    setQuota(defaultPosts);
                    setAiCredits(t === "STARTER" ? 100 : t === "GROWTH" ? 250 : 500);
                  }}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                    tier === t
                      ? "border-[#f05a28] bg-[#f05a28]/10 text-[#f05a28]"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>{t}</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {t === "STARTER" ? "15 bài" : t === "GROWTH" ? "30 bài" : "60 bài"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hạn ngạch bài đăng / tháng: Number input + Slider */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quota" className="text-xs font-semibold">
                Hạn ngạch Bài đăng hàng tháng (Posts / Month)
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  id="quota"
                  type="number"
                  min={1}
                  max={500}
                  value={quota}
                  onChange={(e) => setQuota(Math.min(500, Math.max(1, Number(e.target.value))))}
                  className="h-7 w-20 text-center font-bold text-xs"
                />
                <span className="text-muted-foreground text-[11px]">bài/tháng</span>
              </div>
            </div>

            {/* Range Slider for Posts */}
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="w-full accent-[#f05a28] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1 bài</span>
              <span>250 bài</span>
              <span>500 bài</span>
            </div>

            {/* Workspace Limit Warning Banner */}
            {isExceedingWorkspaceLimit && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo:</strong> Số bài đăng ({quota} bài) đã vượt quá giới hạn đăng ký của Workspace (tối đa {workspaceMaxPosts} bài/tháng).
                </span>
              </div>
            )}
          </div>

          {/* Platform Access Checkboxes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Nền tảng được phép xuất bản <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {AVAILABLE_PLATFORMS.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#f05a28]/60 bg-[#f05a28]/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="size-4 text-[#f05a28] shrink-0" />
                    ) : (
                      <Square className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={`font-medium ${p.color}`}>{p.label}</span>
                  </button>
                );
              })}
            </div>
            {platformError && (
              <p className="text-[11px] text-rose-500 font-medium pt-0.5">{platformError}</p>
            )}
          </div>

          {/* AI Credits per month Slider */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" /> AI Credits phân bổ hàng tháng
              </Label>
              <span className="font-bold text-[#f05a28] text-xs bg-[#f05a28]/10 px-2 py-0.5 rounded border border-[#f05a28]/20">
                {aiCredits} Credits
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={aiCredits}
              onChange={(e) => setAiCredits(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>0 Credits</span>
              <span>500 Credits</span>
              <span>1,000 Credits</span>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs font-semibold flex items-center gap-1">
              <Calendar className="size-3.5 text-muted-foreground" /> Ngày hết hạn gói dịch vụ
            </Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Optimistic UI Info */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Info className="size-4 shrink-0" />
            <span>
              Giao diện sẽ tự động cập nhật ngay lập tức (Optimistic Update) và tự động khôi phục nếu API lỗi.
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
