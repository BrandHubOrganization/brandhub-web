import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Printer,
  Download,
  Building2,
  Users,
  FolderOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileBarChart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { agencyService } from "@/services/agencyService";
import type { Agency, AgencyStatsResponse, CompanySize } from "@/types/agency";

interface AgencyReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencies: Agency[];
  defaultAgencyId?: string;
}

type PresetType = "7d" | "30d" | "month" | "all" | "custom";

export function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
}

export function formatCompanySize(size?: CompanySize | string | null): string {
  if (!size) return "";
  switch (size) {
    case "SIZE_1_10":
      return "1 - 10 nhân sự";
    case "SIZE_11_50":
      return "11 - 50 nhân sự";
    case "SIZE_51_200":
      return "51 - 200 nhân sự";
    case "SIZE_201_500":
      return "201 - 500 nhân sự";
    case "SIZE_500_PLUS":
      return "500+ nhân sự";
    default:
      return size.replace(/^SIZE_/, "").replace(/_/g, " ");
  }
}

function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STATUS_METAS: Record<
  string,
  { label: string; bgClass: string; textClass: string; barColor: string }
> = {
  PUBLISHED: {
    label: "Đã xuất bản",
    bgClass: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    textClass: "text-brand-orange",
    barColor: "bg-brand-orange",
  },
  COMPLETED: {
    label: "Hoàn tất",
    bgClass: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    textClass: "text-brand-orange",
    barColor: "bg-brand-orange",
  },
  IN_REVIEW: {
    label: "Chờ duyệt",
    bgClass: "bg-muted text-foreground border-border",
    textClass: "text-foreground",
    barColor: "bg-foreground/70",
  },
  PENDING: {
    label: "Chờ duyệt",
    bgClass: "bg-muted text-foreground border-border",
    textClass: "text-foreground",
    barColor: "bg-foreground/70",
  },
  IN_PROGRESS: {
    label: "Đang sản xuất",
    bgClass: "bg-muted/70 text-foreground/90 border-border/80",
    textClass: "text-foreground/90",
    barColor: "bg-foreground/40",
  },
  DRAFT: {
    label: "Bản nháp",
    bgClass: "bg-surface-soft text-muted-foreground border-border/60",
    textClass: "text-muted-foreground",
    barColor: "bg-muted-foreground/20",
  },
  REJECTED: {
    label: "Cần chỉnh sửa",
    bgClass: "bg-destructive/10 text-destructive border-destructive/20",
    textClass: "text-destructive",
    barColor: "bg-destructive/80",
  },
};

function getStatusMeta(status: string) {
  const upper = status.toUpperCase();
  if (STATUS_METAS[upper]) return STATUS_METAS[upper];

  if (upper.includes("PUBLISH") || upper.includes("FINISH") || upper.includes("COMPLETE")) {
    return STATUS_METAS.PUBLISHED;
  }
  if (upper.includes("REVIEW") || upper.includes("PENDING")) {
    return STATUS_METAS.IN_REVIEW;
  }
  if (upper.includes("PROGRESS")) {
    return STATUS_METAS.IN_PROGRESS;
  }
  if (upper.includes("REJECT") || upper.includes("FAIL")) {
    return STATUS_METAS.REJECTED;
  }
  return {
    label: status,
    bgClass: "bg-surface-soft text-muted-foreground border-border/60",
    textClass: "text-muted-foreground",
    barColor: "bg-muted-foreground/20",
  };
}

export function AgencyReportExportModal({
  isOpen,
  onClose,
  agencies,
  defaultAgencyId,
}: AgencyReportExportModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Selected agency state
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [agencyDetail, setAgencyDetail] = useState<Agency | null>(null);

  // Date filters
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [activePreset, setActivePreset] = useState<PresetType>("month");

  // Stats data
  const [stats, setStats] = useState<AgencyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Initialize selectedAgencyId
  useEffect(() => {
    if (!isOpen) return;

    if (defaultAgencyId && agencies.some((a) => a.id === defaultAgencyId)) {
      setSelectedAgencyId(defaultAgencyId);
    } else if (agencies.length > 0) {
      setSelectedAgencyId(agencies[0].id);
    }

    // Default preset: This month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFrom(formatDateYMD(startOfMonth));
    setTo(formatDateYMD(today));
    setActivePreset("month");
  }, [isOpen, defaultAgencyId, agencies]);

  // Handle Preset selection
  const handleApplyPreset = (preset: PresetType) => {
    const today = new Date();
    if (preset === "7d") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      setFrom(formatDateYMD(d));
      setTo(formatDateYMD(today));
      setActivePreset("7d");
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      setFrom(formatDateYMD(d));
      setTo(formatDateYMD(today));
      setActivePreset("30d");
    } else if (preset === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFrom(formatDateYMD(startOfMonth));
      setTo(formatDateYMD(today));
      setActivePreset("month");
    } else if (preset === "all") {
      setFrom("");
      setTo("");
      setActivePreset("all");
    }
  };

  // Fetch Agency Stats and details
  const fetchReportData = useCallback(async () => {
    if (!selectedAgencyId) return;

    setIsLoading(true);
    setIsError(false);

    try {
      // Find agency from prop or fetch if missing
      const foundAgency = agencies.find((a) => a.id === selectedAgencyId);
      if (foundAgency) {
        setAgencyDetail(foundAgency);
      } else {
        const agRes = await agencyService.getById(selectedAgencyId);
        setAgencyDetail(agRes.data.data);
      }

      const statsRes = await agencyService.getStats(selectedAgencyId, {
        from: from || undefined,
        to: to || undefined,
      });
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch agency report stats:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgencyId, from, to, agencies]);

  useEffect(() => {
    if (isOpen && selectedAgencyId) {
      fetchReportData();
    }
  }, [isOpen, selectedAgencyId, from, to, fetchReportData]);

  // Derived calculations
  const totalContent = useMemo(() => {
    if (!stats?.contentByStatus) return 0;
    return Object.values(stats.contentByStatus).reduce((a, b) => a + b, 0);
  }, [stats]);

  const completionRate = useMemo(() => {
    if (!stats?.contentByStatus || totalContent === 0) return 0;
    const c = stats.contentByStatus;
    const completedCount =
      (c["PUBLISHED"] ?? 0) +
      (c["published"] ?? 0) +
      (c["FINISHED"] ?? 0) +
      (c["finished"] ?? 0) +
      (c["COMPLETED"] ?? 0) +
      (c["completed"] ?? 0);
    return Math.min(100, Math.round((completedCount / totalContent) * 100));
  }, [stats, totalContent]);

  // Clean description string stripped of all HTML tags
  const cleanDescription = useMemo(() => {
    return stripHtml(agencyDetail?.description || "");
  }, [agencyDetail?.description]);

  // Print function using isolated iframe
  const handlePrint = () => {
    const printableElement = document.getElementById("agency-report-printable");
    if (!printableElement) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Lấy styles hiện tại của ứng dụng
    const styleTags = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']")
    )
      .map((el) => el.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>Báo cáo - ${agencyDetail?.name || "BrandHub"}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              color: #111827 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            #agency-report-printable {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              background: #ffffff !important;
            }
            .no-print {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div id="agency-report-printable">
            ${printableElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print error:", e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 300);
  };

  // CSV export function
  const handleExportCsv = () => {
    if (!stats) return;
    const agencyName = agencyDetail?.name || "Agency";
    const dateRangeStr =
      from && to ? `${from}_den_${to}` : "toan_bo_thoi_gian";
    const safeFilename = `Bao_cao_${agencyName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_")}_${dateRangeStr}.csv`;

    const csvRows: (string | number)[][] = [
      ["BÁO CÁO TỔNG QUAN DOANH NGHIỆP / AGENCY - BRANDHUB"],
      ["Tên công ty:", agencyName],
      [
        "Khoảng thời gian:",
        from && to ? `${from} đến ${to}` : "Toàn bộ thời gian",
      ],
      ["Ngày xuất báo cáo:", new Date().toLocaleString("vi-VN")],
      [],
      ["1. CHỈ SỐ TỔNG QUAN"],
      ["Chỉ số", "Giá trị"],
      ["Tổng số thành viên", stats.memberCount],
      ["Tổng số Workspace", stats.workspaceCount],
      ["Tổng số bài viết / nội dung", totalContent],
      ["Tỷ lệ hoàn thành / xuất bản", `${completionRate}%`],
      [],
      ["2. PHÂN BỔ BÀI VIẾT THEO TRẠNG THÁI"],
      ["Trạng thái", "Số lượng"],
      ...Object.entries(stats.contentByStatus || {}).map(([k, v]) => [
        t(`dashboard.reportExport.statusLabels.${k}`, k),
        v,
      ]),
      [],
      ["3. THÀNH VIÊN THEO VAI TRÒ"],
      ["Vai trò", "Số lượng"],
      ...Object.entries(stats.membersByRole || {}).map(([k, v]) => [k, v]),
      [],
      ["4. WORKSPACE THEO NGÀNH NGHỀ"],
      ["Ngành nghề", "Số lượng"],
      ...Object.entries(stats.workspacesByIndustry || {}).map(([k, v]) => [
        k,
        v,
      ]),
    ];

    const csvContent =
      "\uFEFF" +
      csvRows
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="no-print p-4 sm:p-5 pb-3 border-b border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
              <FileBarChart className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {t("dashboard.reportExport.title", "Tải báo cáo công ty")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "dashboard.reportExport.description",
                  "Xem trước số liệu tổng quan, in báo cáo PDF hoặc tải bảng dữ liệu thống kê của công ty.",
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Inline Compact Toolbar (Single Line) */}
        <div className="no-print px-4 py-2.5 border-b border-border/80 bg-muted/20 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
          {/* Agency Selector */}
          <div className="flex items-center gap-2 min-w-[200px] max-w-[320px] flex-1">
            <Building2 className="size-3.5 text-brand-orange shrink-0" />
            {agencies.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                {t("dashboard.reportExport.noAgencies", "Không có công ty")}
              </span>
            ) : agencies.length === 1 ? (
              <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-border bg-card text-xs font-medium text-foreground truncate w-full">
                <span className="truncate">{agencies[0].name}</span>
                {agencies[0].companySize && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    ({formatCompanySize(agencies[0].companySize)})
                  </span>
                )}
              </div>
            ) : (
              <Select
                value={selectedAgencyId}
                onChange={(e) => setSelectedAgencyId(e.target.value)}
                className="text-xs h-7 py-0 pl-2.5 pr-6 cursor-pointer bg-background w-full"
              >
                {agencies.map((agency) => {
                  const sizeLabel = formatCompanySize(agency.companySize);
                  return (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} {sizeLabel ? `(${sizeLabel})` : ""}
                    </option>
                  );
                })}
              </Select>
            )}
          </div>

          {/* Date Range Toolbar Group: Presets + Date Pickers */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Date Presets */}
            <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-background shadow-xs">
              <Button
                type="button"
                variant={activePreset === "7d" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleApplyPreset("7d")}
                className={`h-7 px-2 text-xs font-medium cursor-pointer transition-all ${
                  activePreset === "7d"
                    ? "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t("dashboard.reportExport.presets.last7Days", "7 ngày")}
              </Button>
              <Button
                type="button"
                variant={activePreset === "30d" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleApplyPreset("30d")}
                className={`h-7 px-2 text-xs font-medium cursor-pointer transition-all ${
                  activePreset === "30d"
                    ? "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t("dashboard.reportExport.presets.last30Days", "30 ngày")}
              </Button>
              <Button
                type="button"
                variant={activePreset === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleApplyPreset("month")}
                className={`h-7 px-2 text-xs font-medium cursor-pointer transition-all ${
                  activePreset === "month"
                    ? "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t("dashboard.reportExport.presets.thisMonth", "Tháng này")}
              </Button>
              <Button
                type="button"
                variant={activePreset === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleApplyPreset("all")}
                className={`h-7 px-2 text-xs font-medium cursor-pointer transition-all ${
                  activePreset === "all"
                    ? "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t("dashboard.reportExport.presets.allTime", "Toàn bộ")}
              </Button>
            </div>

            <div className="h-4 w-px bg-border/80 hidden sm:block" />

            {/* Custom Date Pickers */}
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setActivePreset("custom");
                }}
                className="w-[145px] sm:w-[150px] h-7 text-xs px-2 bg-background cursor-pointer"
                title="Từ ngày"
              />
              <span className="text-xs text-muted-foreground font-medium">→</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setActivePreset("custom");
                }}
                className="w-[145px] sm:w-[150px] h-7 text-xs px-2 bg-background cursor-pointer"
                title="Đến ngày"
              />
            </div>

            {isLoading && (
              <span title="Đang tải số liệu...">
                <RefreshCw className="size-3.5 text-brand-orange animate-spin shrink-0" />
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-muted/10">
          {isLoading && !stats ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
              <AlertCircle className="size-8 text-destructive mx-auto" />
              <p className="text-sm font-medium text-destructive">
                {t("dashboard.reportExport.loadError", "Không thể tải số liệu báo cáo.")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReportData}
                className="gap-1.5 cursor-pointer text-xs"
              >
                <RefreshCw className="size-3.5" />
                {t("dashboard.reportExport.retry", "Thử lại")}
              </Button>
            </div>
          ) : stats ? (
            /* Printable Report Container */
            <div
              id="agency-report-printable"
              className="bg-card text-foreground rounded-xl border border-border p-5 sm:p-6 shadow-sm space-y-5"
            >
              {/* Executive Corporate Report Header */}
              <div className="border-b border-border/80 pb-5 space-y-4">
                {/* Top Corporate Branding Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange text-white font-bold text-xs shadow-xs">
                      BH
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-brand-orange">
                        BrandHub Enterprise Analytics
                      </span>
                      <span className="text-muted-foreground ml-2 hidden sm:inline text-[11px]">
                        • Hệ thống báo cáo quản trị doanh nghiệp
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-muted/70 text-foreground/80 border-border/60 gap-1 text-[11px] font-medium py-0.5"
                    >
                      <CheckCircle2 className="size-3 text-brand-orange" />
                      Báo cáo hợp lệ & Xác thực
                    </Badge>
                  </div>
                </div>

                {/* Main Profile Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
                  <div className="flex items-start gap-3.5">
                    {agencyDetail?.logoUrl ? (
                      <img
                        src={agencyDetail.logoUrl}
                        alt={agencyDetail.name}
                        className="size-14 rounded-xl object-cover border border-border shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="size-14 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 shadow-xs">
                        <Building2 className="size-7" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        {agencyDetail?.name || "Doanh nghiệp"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {agencyDetail?.companySize && (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground/80 bg-muted px-2 py-0.5 rounded-md">
                            <Users className="size-3 text-brand-orange" />
                            {formatCompanySize(agencyDetail.companySize)}
                          </span>
                        )}
                        {agencyDetail?.category && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                            {agencyDetail.category}
                          </span>
                        )}
                        {agencyDetail?.location && (
                          <span className="text-muted-foreground text-[11px]">
                            📍 {agencyDetail.location}
                          </span>
                        )}
                      </div>
                      {cleanDescription ? (
                        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed pt-0.5 line-clamp-2">
                          {cleanDescription}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic pt-0.5">
                          {t("dashboard.reportExport.noDescription", "Doanh nghiệp chưa cập nhật phần giới thiệu tổng quan.")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata block */}
                  <div className="sm:text-right shrink-0 space-y-1 text-xs text-muted-foreground border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div>
                      <span className="text-muted-foreground font-medium">Kỳ báo cáo: </span>
                      <span className="font-semibold text-foreground">
                        {from && to
                           ? `${from} → ${to}`
                          : t("dashboard.reportExport.presets.allTime", "Toàn bộ thời gian")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Thời gian trích xuất: </span>
                      <span className="font-mono text-[11px] text-foreground">
                        {new Date().toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground/80 font-mono">
                      Mã báo cáo: BH-{selectedAgencyId ? selectedAgencyId.slice(0, 8).toUpperCase() : "AG"}-{new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Core Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Total Members */}
                <div className="p-3.5 rounded-xl border border-border bg-background/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("dashboard.reportExport.memberCount", "Thành viên")}
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted text-foreground/80 border border-border/40">
                      <Users className="size-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                      {stats.memberCount}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">
                      nhân sự
                    </span>
                  </div>
                </div>

                {/* Total Workspaces */}
                <div className="p-3.5 rounded-xl border border-border bg-background/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("dashboard.reportExport.workspaceCount", "Workspace")}
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted text-foreground/80 border border-border/40">
                      <FolderOpen className="size-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                      {stats.workspaceCount}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">
                      không gian
                    </span>
                  </div>
                </div>

                {/* Total Posts */}
                <div className="p-3.5 rounded-xl border border-border bg-background/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("dashboard.reportExport.contentCount", "Tổng bài viết")}
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted text-foreground/80 border border-border/40">
                      <FileText className="size-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                      {totalContent}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">
                      nội dung
                    </span>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="p-3.5 rounded-xl border border-border bg-background/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("dashboard.reportExport.completionRate", "Tỷ lệ hoàn thành")}
                    </span>
                    <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                      {completionRate}%
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">
                      hoàn tất
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Distribution Breakdown with Visual Progress Bar */}
              <div className="p-4 rounded-xl border border-border/80 bg-background/40 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                      {t("dashboard.reportExport.contentDistribution", "Phân bổ nội dung theo trạng thái")}
                    </h4>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                      {totalContent} bài viết
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tỷ lệ hoàn tất: <strong className="text-brand-orange font-mono">{completionRate}%</strong>
                  </span>
                </div>

                {totalContent === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center">
                    {t("dashboard.reportExport.noData", "Chưa có dữ liệu bài viết trong khoảng thời gian này.")}
                  </p>
                ) : (
                  <>
                    {/* Visual Stacked Progress Bar */}
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted/60 p-0.5 border border-border/50">
                      {Object.entries(stats.contentByStatus || {}).map(([statusKey, count]) => {
                        if (count <= 0) return null;
                        const percentage = (count / totalContent) * 100;
                        const meta = getStatusMeta(statusKey);
                        return (
                          <div
                            key={statusKey}
                            style={{ width: `${percentage}%` }}
                            className={`${meta.barColor} h-full first:rounded-l-full last:rounded-r-full transition-all`}
                            title={`${t(`dashboard.reportExport.statusLabels.${statusKey}`, statusKey)}: ${count} (${percentage.toFixed(1)}%)`}
                          />
                        );
                      })}
                    </div>

                    {/* Distribution Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                      {Object.entries(stats.contentByStatus || {}).map(([statusKey, count]) => {
                        const meta = getStatusMeta(statusKey);
                        const percentage = totalContent > 0 ? ((count / totalContent) * 100).toFixed(1) : "0";
                        return (
                          <div
                            key={statusKey}
                            className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 ${meta.bgClass}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium truncate">
                                {t(`dashboard.reportExport.statusLabels.${statusKey}`, statusKey)}
                              </span>
                              <span className={`text-[11px] font-mono font-bold ${meta.textClass}`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between text-xs pt-0.5">
                              <span className="text-[11px] text-muted-foreground">Số lượng</span>
                              <span className="font-bold text-foreground text-sm font-mono">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Roles & Industries Structured Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Members by Role */}
                <div className="p-4 rounded-xl border border-border/80 bg-background/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      {t("dashboard.reportExport.membersByRole", "Cơ cấu nhân sự theo vai trò")}
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {stats.memberCount} nhân sự
                    </span>
                  </div>
                  {Object.keys(stats.membersByRole || {}).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      {t("dashboard.reportExport.noData", "Chưa có dữ liệu")}
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border/60">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase border-b border-border/60">
                          <tr>
                            <th className="py-1.5 px-3">Vai trò</th>
                            <th className="py-1.5 px-3 text-right">Số lượng</th>
                            <th className="py-1.5 px-3 text-right">Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-medium">
                          {Object.entries(stats.membersByRole).map(([role, count]) => {
                            const rolePct =
                              stats.memberCount > 0
                                ? ((count / stats.memberCount) * 100).toFixed(1)
                                : "0";
                            return (
                              <tr key={role} className="hover:bg-muted/20">
                                <td className="py-1.5 px-3 text-foreground font-medium">{role}</td>
                                <td className="py-1.5 px-3 text-right font-mono font-bold text-foreground">{count}</td>
                                <td className="py-1.5 px-3 text-right font-mono text-muted-foreground text-xs">
                                  {rolePct}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Workspaces by Industry */}
                <div className="p-4 rounded-xl border border-border/80 bg-background/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                      <FolderOpen className="size-3.5 text-muted-foreground" />
                      {t("dashboard.reportExport.workspacesByIndustry", "Workspace theo ngành nghề")}
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {stats.workspaceCount} không gian
                    </span>
                  </div>
                  {Object.keys(stats.workspacesByIndustry || {}).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      {t("dashboard.reportExport.noData", "Chưa có dữ liệu")}
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border/60">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase border-b border-border/60">
                          <tr>
                            <th className="py-1.5 px-3">Ngành nghề</th>
                            <th className="py-1.5 px-3 text-right">Số lượng</th>
                            <th className="py-1.5 px-3 text-right">Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-medium">
                          {Object.entries(stats.workspacesByIndustry).map(([industry, count]) => {
                            const indPct =
                              stats.workspaceCount > 0
                                ? ((count / stats.workspaceCount) * 100).toFixed(1)
                                : "0";
                            return (
                              <tr key={industry} className="hover:bg-muted/20">
                                <td className="py-1.5 px-3 text-foreground font-medium">
                                  {industry || "Khác / Chung"}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono font-bold text-foreground">{count}</td>
                                <td className="py-1.5 px-3 text-right font-mono text-muted-foreground text-xs">
                                  {indPct}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Printable Corporate Footer */}
              <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground/80">BrandHub Intelligence Report</span>
                  <span>•</span>
                  <span>{t("dashboard.reportExport.systemGenerated", "Báo cáo được trích xuất tự động từ hệ thống")}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span>Bản quyền © {new Date().getFullYear()} BrandHub Inc.</span>
                  <span>•</span>
                  <span className="text-brand-orange">https://brandhub.vn</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <div className="no-print p-3.5 sm:p-4 px-4 sm:px-6 border-t border-border bg-card/60 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              navigate("/reports");
            }}
            className="text-xs text-muted-foreground hover:text-brand-orange gap-1.5 cursor-pointer"
          >
            <ExternalLink className="size-3.5" />
            {t(
              "dashboard.reportExport.viewFullReports",
              "Trang báo cáo chuyên sâu",
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || !stats}
              onClick={handleExportCsv}
              className="text-xs gap-1.5 cursor-pointer hover:border-brand-orange/40 hover:text-brand-orange transition-colors"
            >
              <Download className="size-3.5" />
              {t("dashboard.reportExport.exportCsv", "Tải CSV")}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isLoading || !stats}
              onClick={handlePrint}
              className="text-xs gap-1.5 cursor-pointer bg-brand-orange hover:bg-brand-orange/90 text-white font-medium shadow-sm transition-all"
            >
              <Printer className="size-3.5" />
              {t("dashboard.reportExport.printPdf", "In / Xuất PDF")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgencyReportExportModal;