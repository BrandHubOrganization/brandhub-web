import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit3, RefreshCw, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { CreditIntegrationNote } from "@/pages/credit/components/CreditIntegrationNote";
import { CreditPriceKpiRow } from "@/pages/credit/components/CreditPriceKpiRow";
import { CreditPriceDrawer } from "@/pages/credit/components/CreditPriceDrawer";
import { CreditPriceCsvImport } from "@/pages/credit/components/CreditPriceCsvImport";
import { useCreditPriceImport } from "@/pages/credit/hooks/useCreditPriceImport";
import { OPERATION_CONFIG } from "@/pages/credit/utils/creditOperations";
import { useCreditPrices } from "@/pages/credit/hooks/useCreditConfiguration";
import { creditService } from "@/pages/credit/services/creditService";
import { CREDIT_OPERATIONS } from "@/pages/credit/types/credit";
import type { CreditOperation, CreditPrice } from "@/pages/credit/types/credit";
import { creditErrorKey } from "@/pages/credit/utils/creditInput";

const CREDIT_TO_VND_RATE = 200;

export default function CreditPricesPage() {
  const { t } = useTranslation();
  const { query, save, reload } = useCreditPrices();
  const csvImport = useCreditPriceImport();

  // Drawer state
  const [drawerOperation, setDrawerOperation] =
    useState<CreditOperation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Row-level switch loading state
  const [togglingOp, setTogglingOp] = useState<CreditOperation | null>(null);

  const prices = query.data ?? [];

  // Active operation being edited in drawer
  const activeDrawerPrice = drawerOperation
    ? prices.find((p) => p.operation === drawerOperation)
    : undefined;

  const handleOpenEdit = (op: CreditOperation) => {
    setDrawerOperation(op);
    setIsDrawerOpen(true);
  };

  const handleToggleKillSwitch = async (
    op: CreditOperation,
    price?: CreditPrice,
  ) => {
    if (!price) {
      handleOpenEdit(op);
      return;
    }

    setTogglingOp(op);
    try {
      const updated = await creditService.savePrice(op, {
        unitCredits: price.unitCredits,
        enabled: !price.enabled,
        expectedRevision: price.revision,
      });
      save(updated);
      toast.success(
        updated.enabled
          ? `Đã kích hoạt thao tác ${t(`credit.operations.${op}`)}`
          : `Đã tạm ngưng thao tác ${t(`credit.operations.${op}`)} (Bảo trì model)`,
      );
    } catch (err) {
      const key = creditErrorKey(err);
      if (key === "credit.errors.stale") {
        toast.error(
          "Xung đột phiên bản (Stale Revision)! Đang đồng bộ dữ liệu mới nhất...",
        );
        await query.refetch();
      } else {
        toast.error(t(key));
      }
    } finally {
      setTogglingOp(null);
    }
  };

  const handleDrawerSave = async (
    op: CreditOperation,
    amount: number,
    enabled: boolean,
    expectedRevision: number,
  ) => {
    const updated = await creditService.savePrice(op, {
      unitCredits: amount,
      enabled,
      expectedRevision,
    });
    save(updated);
    toast.success(t("credit.saved"));
  };

  const handleDrawerReload = async (op: CreditOperation) => {
    return await reload(op);
  };

  return (
    <PageWrapper
      compact
      showGuideButton={false}
      title={t("credit.price.title")}
      description="Quản lý ma trận đơn giá AI Credit cho từng tác vụ và điều khiển công tắc khẩn cấp (Kill-Switch) bảo trì model."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="orange"
            size="sm"
            onClick={csvImport.choose}
            disabled={csvImport.busy === "apply"}
          >
            <Upload className="size-4" aria-hidden="true" />
            {t("credit.csv.choose")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`}
            />
            <span>Làm mới bảng giá</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <CreditPriceCsvImport state={csvImport} />
        {/* Domain Integration Note */}
        <div className="border-border/70 bg-card/60 rounded-xl border p-3.5 shadow-2xs backdrop-blur-xs">
          <CreditIntegrationNote />
        </div>

        {/* 1. Tokenomics KPI Summary Row (4 Bento Cards) */}
        <CreditPriceKpiRow prices={prices} rateVnd={CREDIT_TO_VND_RATE} />

        {/* 2. Runtime Price Matrix Table */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-foreground text-base font-semibold tracking-tight sm:text-lg">
                Ma trận Bảng giá Runtime (Tokenomics Price Matrix)
              </h2>
              <p className="text-muted-foreground text-xs">
                Cấu hình chi phí credit trực tiếp cho 7 thao tác AI, hỗ trợ
                kill-switch tức thời khi model bảo trì.
              </p>
            </div>
          </div>

          {query.isPending || query.isError ? (
            <div className="border-border/70 bg-card rounded-2xl border p-6">
              <CreditQueryState
                loading={query.isPending}
                error={query.error}
                retry={() => query.refetch()}
              />
            </div>
          ) : (
            <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[32%] min-w-[260px] py-3.5 font-semibold">
                      Thao tác AI
                    </TableHead>
                    <TableHead className="w-[12%] min-w-[100px] py-3.5 font-semibold">
                      Đơn vị tính
                    </TableHead>
                    <TableHead className="w-[14%] min-w-[120px] py-3.5 font-semibold">
                      Đơn giá
                    </TableHead>
                    <TableHead className="w-[15%] min-w-[130px] py-3.5 font-semibold">
                      Quy đổi tham chiếu
                    </TableHead>
                    <TableHead className="w-[10%] min-w-[90px] py-3.5 font-semibold">
                      Phiên bản
                    </TableHead>
                    <TableHead className="w-[17%] min-w-[170px] py-3.5 font-semibold">
                      Trạng thái & Kill-Switch
                    </TableHead>
                    <TableHead className="w-[10%] min-w-[100px] py-3.5 text-right font-semibold">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CREDIT_OPERATIONS.map((op) => {
                    const price = prices.find((p) => p.operation === op);
                    const meta = OPERATION_CONFIG[op];
                    const IconComponent = meta.icon;
                    const isToggling = togglingOp === op;
                    const isConfigured = !!price;
                    const isEnabled = price?.enabled ?? false;

                    const unitCredits = price?.unitCredits ?? 0;
                    const vndFormatted = new Intl.NumberFormat("vi-VN").format(
                      unitCredits * CREDIT_TO_VND_RATE,
                    );

                    return (
                      <TableRow
                        key={op}
                        className={`hover:bg-muted/20 transition-colors ${
                          !isEnabled && isConfigured
                            ? "bg-muted/10 opacity-80"
                            : ""
                        }`}
                      >
                        {/* Cột 1: Thao tác AI (Icon trực quan + Tên thao tác + Mô tả ngắn) */}
                        <TableCell className="py-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isEnabled
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <IconComponent className="size-5" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-foreground font-semibold">
                                  {t(`credit.operations.${op}`, {
                                    defaultValue: meta.label,
                                  })}
                                </span>
                                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                                  {op}
                                </span>
                              </div>
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {meta.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Cột 2: Đơn vị tính */}
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {meta.unitLabel}
                            </Badge>
                            <p className="text-muted-foreground text-[11px]">
                              Lượt hợp lệ
                            </p>
                          </div>
                        </TableCell>

                        {/* Cột 3: Đơn giá (unitCredits dạng Geist Mono to đậm) */}
                        <TableCell className="py-4">
                          {isConfigured ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-foreground font-mono text-lg font-bold tracking-tight">
                                {unitCredits}
                              </span>
                              <span className="text-muted-foreground font-mono text-xs font-medium">
                                Credits
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              Chưa cấu hình
                            </span>
                          )}
                        </TableCell>

                        {/* Cột 4: Quy đổi tham chiếu (~X VNĐ / lượt) */}
                        <TableCell className="py-4">
                          {isConfigured ? (
                            <div className="space-y-0.5">
                              <span className="text-foreground font-mono text-xs font-semibold">
                                {unitCredits === 0
                                  ? "0 VNĐ (Free)"
                                  : `~${vndFormatted} VNĐ`}
                              </span>
                              <p className="text-muted-foreground text-[10px]">
                                Tỷ lệ 1:200 VNĐ
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* Cột 5: Phiên bản (Rev #X) */}
                        <TableCell className="py-4">
                          {isConfigured ? (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground font-mono text-xs font-medium"
                            >
                              Rev #{price.revision}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[11px] text-amber-600 dark:text-amber-400"
                            >
                              Mới
                            </Badge>
                          )}
                        </TableCell>

                        {/* Cột 6: Trạng thái & Công tắc (Kill-Switch) */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() =>
                                  handleToggleKillSwitch(op, price)
                                }
                                disabled={isToggling}
                                aria-label={`Bật tắt thao tác ${op}`}
                              />
                              {isToggling && (
                                <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
                                  <Spinner className="text-primary size-3.5" />
                                </div>
                              )}
                            </div>

                            {isEnabled ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              >
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span>ACTIVE</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 border-amber-300 bg-amber-50 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                title="Mô hình AI đang tạm ngừng hoặc bảo trì"
                              >
                                <ShieldAlert className="size-3 text-amber-600 dark:text-amber-400" />
                                <span>DISABLED</span>
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Cột 7: Hành động (Nút Chỉnh sửa mở Drawer) */}
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(op)}
                            className="hover:border-primary/50 hover:text-primary gap-1.5 text-xs font-medium"
                          >
                            <Edit3 className="size-3.5" />
                            <span>Chỉnh sửa</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Slide-Over Edit Drawer / Dialog */}
      <CreditPriceDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        operation={drawerOperation}
        price={activeDrawerPrice}
        rateVnd={CREDIT_TO_VND_RATE}
        onSave={handleDrawerSave}
        onReload={handleDrawerReload}
      />
    </PageWrapper>
  );
}
