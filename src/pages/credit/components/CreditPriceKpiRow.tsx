import { Zap, CheckCircle2, Coins, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CreditPrice } from "@/pages/credit/types/credit";
import { CREDIT_OPERATIONS } from "@/pages/credit/types/credit";

interface CreditPriceKpiRowProps {
  prices: CreditPrice[];
  rateVnd?: number;
}

export function CreditPriceKpiRow({
  prices,
  rateVnd = 200,
}: CreditPriceKpiRowProps) {

  const totalOps = CREDIT_OPERATIONS.length;
  const activeOps = prices.filter((p) => p.enabled).length;

  const validPrices = prices.filter(
    (p) => Number.isSafeInteger(p.unitCredits) && p.unitCredits >= 0,
  );
  const totalCredits = validPrices.reduce((sum, p) => sum + p.unitCredits, 0);
  const avgCredits =
    validPrices.length > 0
      ? (totalCredits / validPrices.length).toFixed(1).replace(/\.0$/, "")
      : "0";
  const avgCreditsNum = Number(avgCredits);
  const avgVnd = new Intl.NumberFormat("vi-VN").format(
    Math.round(avgCreditsNum * rateVnd),
  );

  const maxRevision =
    prices.length > 0 ? Math.max(...prices.map((p) => p.revision ?? 0)) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Tổng số thao tác AI */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4.5 shadow-xs transition-all hover:border-border hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Tổng số thao tác AI
          </span>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
            <Zap className="size-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalOps}
          </span>
          <span className="text-xs text-muted-foreground">thao tác AI</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span>Danh mục model runtime</span>
        </div>
      </div>

      {/* KPI 2: Đang kích hoạt */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4.5 shadow-xs transition-all hover:border-border hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Đang kích hoạt
          </span>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
            <CheckCircle2 className="size-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {activeOps}/{totalOps}
          </span>
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold"
          >
            Active
          </Badge>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span>
            {activeOps === totalOps
              ? "Tất cả mô hình đang hoạt động"
              : `${totalOps - activeOps} mô hình đang tạm ngưng`}
          </span>
        </div>
      </div>

      {/* KPI 3: Đơn giá trung bình */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4.5 shadow-xs transition-all hover:border-border hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Đơn giá trung bình
          </span>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
            <Coins className="size-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {avgCredits}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Credits / thao tác
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span>Quy đổi ~{avgVnd} VNĐ / lượt</span>
        </div>
      </div>

      {/* KPI 4: Phiên bản cấu hình (Revision) */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4.5 shadow-xs transition-all hover:border-border hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Phiên bản cấu hình
          </span>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
            <Shield className="size-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Rev #{maxRevision}
          </span>
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold"
          >
            Concurrency safe
          </Badge>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span>Kiểm soát xung đột phiên bản</span>
        </div>
      </div>
    </div>
  );
}
