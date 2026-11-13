import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, ChevronDown, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  agencyMailTemplateService,
  mailTemplateService,
} from "@/pages/mail-templates/services/mailTemplateService";
import type { MailTemplate, MailTemplateSummary } from "@/pages/mail-templates/types";
import { htmlToPlainText } from "@/pages/mail-templates/utils";

export interface MailTemplateSelectorProps {
  workspaceId?: string | null;
  agencyId?: string | null;
  scope?: "AGENCY_INTERNAL" | "WORKSPACE_MANAGER" | "AGENCY_CLIENT" | "ALL";
  selectedTemplateId?: string | null;
  onSelectNote: (note: string, template?: MailTemplateSummary | MailTemplate) => void;
  contextVariables?: {
    agencyName?: string | null;
    workspaceName?: string | null;
    senderName?: string | null;
    inviteeName?: string | null;
    role?: string | null;
  };
  className?: string;
  showPresets?: boolean;
}

export function MailTemplateSelector({
  workspaceId,
  agencyId,
  scope = "ALL",
  selectedTemplateId,
  onSelectNote,
  contextVariables = {},
  className,
  showPresets = true,
}: MailTemplateSelectorProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [templates, setTemplates] = useState<MailTemplateSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
    selectedTemplateId ?? null,
  );

  useEffect(() => {
    if (selectedTemplateId !== undefined) {
      setActiveTemplateId(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  // Load available templates from workspace or agency
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchTemplates = async () => {
      try {
        const rows: MailTemplateSummary[] = [];

        // Fetch workspace templates (includes system defaults)
        if (workspaceId) {
          try {
            const res = await mailTemplateService.list(workspaceId, {
              includeSystem: true,
              size: 50,
            });
            rows.push(...res.content);
          } catch {
            // Workspace template load failed silently
          }
        }

        // Fetch agency templates if agencyId available
        if (agencyId) {
          try {
            const res = await agencyMailTemplateService.list(agencyId, {
              size: 50,
            });
            for (const item of res.content) {
              if (!rows.some((r) => r.id === item.id)) {
                rows.push(item);
              }
            }
          } catch {
            // Agency template load failed silently
          }
        }

        if (!cancelled) {
          setTemplates(rows);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchTemplates();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, agencyId]);

  // If a templateId is specified in props or URL, auto-load it
  useEffect(() => {
    if (!activeTemplateId) return;
    const match = templates.find((tpl) => tpl.id === activeTemplateId);
    if (match) {
      void handleApplyTemplate(match, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplateId, templates]);

  const substituteVariables = (text: string) => {
    const agencyName = contextVariables.agencyName || "BrandHub Agency";
    const workspaceName = contextVariables.workspaceName || agencyName;
    const senderName = contextVariables.senderName || (isEn ? "Team" : "Đội ngũ BrandHub");
    const targetName = contextVariables.inviteeName || (isEn ? "there" : "bạn");
    const role = contextVariables.role || (isEn ? "Member" : "Thành viên");

    return text
      .replace(/\{\{\s*agencyName\s*\}\}/g, agencyName)
      .replace(/\{\{\s*workspaceName\s*\}\}/g, workspaceName)
      .replace(/\{\{\s*senderName\s*\}\}/g, senderName)
      .replace(/\{\{\s*inviteeName\s*\}\}/g, targetName)
      .replace(/\{\{\s*name\s*\}\}/g, targetName)
      .replace(/\{\{\s*role\s*\}\}/g, role)
      .replace(/\{\{\s*inviteLink\s*\}\}/g, "#")
      .replace(/\{\{\s*expiryDays\s*\}\}/g, "30")
      .replace(/\{\{\s*note\s*\}\}/g, "");
  };

  const handleApplyTemplate = async (
    item: MailTemplateSummary,
    notify = true,
  ) => {
    try {
      let bodyHtml = "";
      if (workspaceId) {
        const full = await mailTemplateService.get(workspaceId, item.id);
        bodyHtml = full.bodyHtml;
      } else if (agencyId) {
        const full = await agencyMailTemplateService.get(agencyId, item.id);
        bodyHtml = full.bodyHtml;
      }

      const plain = htmlToPlainText(bodyHtml);
      const substituted = substituteVariables(plain);
      setActiveTemplateId(item.id);
      onSelectNote(substituted, item);
      if (notify) {
        toast.success(
          isEn
            ? `Applied email template: ${item.name}`
            : `Đã áp dụng mẫu email: ${item.name}`,
        );
      }
    } catch {
      toast.error(
        isEn
          ? "Failed to load email template"
          : "Không tải được nội dung mẫu email",
      );
    }
  };

  // Filter templates relevant to this scope
  const filteredTemplates = useMemo(() => {
    if (scope === "ALL") return templates;
    return templates.filter((tpl) => {
      if (scope === "AGENCY_INTERNAL") {
        return (
          tpl.scope === "AGENCY_INTERNAL" ||
          /thành viên|gia nhập|nội bộ|internal|member/i.test(tpl.name) ||
          tpl.type === "SYSTEM_DEFAULT"
        );
      }
      if (scope === "WORKSPACE_MANAGER") {
        return (
          tpl.scope === "WORKSPACE_MANAGER" ||
          /workspace|thành viên|member|cộng tác/i.test(tpl.name) ||
          tpl.type === "SYSTEM_DEFAULT"
        );
      }
      if (scope === "AGENCY_CLIENT") {
        return (
          tpl.scope === "AGENCY_CLIENT" ||
          /khách hàng|client/i.test(tpl.name) ||
          tpl.type === "SYSTEM_DEFAULT"
        );
      }
      return true;
    });
  }, [templates, scope]);

  // Built-in presets for quick insertion
  const presets = useMemo(() => {
    if (isEn) {
      return [
        {
          label: "Formal",
          text: substituteVariables(
            "Hello {{inviteeName}},\nI am {{senderName}} from {{agencyName}}. We warmly invite you to join our team on BrandHub to collaborate on upcoming projects.\n\nWe look forward to working with you!\nSincerely,\n{{senderName}}\n{{agencyName}}",
          ),
        },
        {
          label: "Project",
          text: substituteVariables(
            "Hello {{inviteeName}},\n{{agencyName}} is expanding our team and would love to collaborate with you on BrandHub for our upcoming campaigns. Join us to create outstanding results together!",
          ),
        },
        {
          label: "Casual",
          text: substituteVariables(
            "Hi {{inviteeName}}! Great to invite you to {{agencyName}} on BrandHub. Let's work together and build amazing projects!",
          ),
        },
      ];
    }
    return [
      {
        label: "Trang trọng",
        text: substituteVariables(
          "Xin chào {{inviteeName}},\nTôi là {{senderName}} thuộc công ty {{agencyName}}. Tôi trân trọng gửi lời mời bạn tham gia làm thành viên của công ty {{agencyName}} trên nền tảng BrandHub để cùng hợp tác trong các dự án sắp tới.\n\nRất mong nhận được sự đồng hành của bạn!\n\nTrân trọng,\n{{senderName}}\n{{agencyName}}",
        ),
      },
      {
        label: "Hợp tác dự án",
        text: substituteVariables(
          "Chào {{inviteeName}}, {{agencyName}} đang mở rộng đội ngũ và rất mong có cơ hội hợp tác cùng bạn trong các chiến dịch sắp tới trên BrandHub. Hãy tham gia cùng chúng tôi để cùng tạo nên những nội dung xuất sắc nhé!",
        ),
      },
      {
        label: "Thân mật",
        text: substituteVariables(
          "Chào {{inviteeName}}! Rất vui được mời bạn tham gia vào {{agencyName}} trên BrandHub. Cùng nhau làm việc và phát triển các dự án thật bùng nổ nhé!",
        ),
      },
    ];
  }, [isEn, contextVariables]);

  const manageUrl = workspaceId
    ? `/workspaces/${workspaceId}/mail-templates`
    : agencyId
      ? `/agency/${agencyId}/mail-templates`
      : "/mail-templates";

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-3xs font-medium">
            {isEn ? "Presets:" : "Gợi ý nhanh:"}
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setActiveTemplateId(null);
                onSelectNote(p.text);
              }}
              className="border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange cursor-pointer rounded-full border px-2.5 py-0.5 text-3xs font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown selector for saved / system mail templates */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 cursor-pointer gap-1.5 rounded-full px-3 text-3xs font-medium text-foreground hover:border-brand-orange hover:text-brand-orange"
          >
            <FileText className="size-3 text-brand-orange" />
            <span>
              {activeTemplateId
                ? templates.find((t) => t.id === activeTemplateId)?.name ||
                  (isEn ? "Selected Template" : "Mẫu đã chọn")
                : isEn
                  ? "Choose Email Template"
                  : "Chọn từ mẫu email"}
            </span>
            <ChevronDown className="size-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-lg">
          <DropdownMenuLabel className="flex items-center justify-between text-2xs font-semibold text-muted-foreground px-2 py-1">
            <span>{isEn ? "Saved Email Templates" : "Danh sách Mẫu email"}</span>
            <span className="text-3xs font-normal">({filteredTemplates.length})</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {loading ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {isEn ? "Loading templates..." : "Đang tải mẫu email..."}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {isEn ? "No templates found." : "Chưa có mẫu email nào."}
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isSelected = activeTemplateId === tpl.id;
              return (
                <DropdownMenuItem
                  key={tpl.id}
                  onClick={() => void handleApplyTemplate(tpl)}
                  className={cn(
                    "cursor-pointer rounded-xl px-2.5 py-2 text-xs flex flex-col items-start gap-1 transition-colors",
                    isSelected
                      ? "bg-[#fff0eb] text-[#ca3d0e] dark:bg-brand-orange/20 dark:text-brand-orange font-semibold"
                      : "hover:bg-muted/70",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-1.5">
                    <span className="font-medium truncate">{tpl.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {tpl.type === "SYSTEM_DEFAULT" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {isEn ? "System" : "Hệ thống"}
                        </Badge>
                      )}
                      {isSelected && <Check className="size-3.5 text-[#ca3d0e]" />}
                    </div>
                  </div>
                  <span className="text-3xs text-muted-foreground truncate w-full">
                    {tpl.subject}
                  </span>
                </DropdownMenuItem>
              );
            })
          )}

          <DropdownMenuSeparator />
          <div className="p-1">
            <Link
              to={manageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 px-2 py-1.5 text-3xs font-medium text-brand-orange hover:bg-brand-orange/5 transition-colors"
            >
              <ExternalLink className="size-3" />
              <span>{isEn ? "Manage Email Templates" : "Quản lý / Tạo mẫu email mới"}</span>
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Direct link to email template manager */}
      <Link
        to={manageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-3xs font-medium text-muted-foreground hover:text-brand-orange transition-colors"
        title={isEn ? "Open Email Template Studio" : "Mở trang Quản lý mẫu email"}
      >
        <ExternalLink className="size-3" />
        <span className="hidden sm:inline">
          {isEn ? "Template Studio" : "Mẫu email"}
        </span>
      </Link>
    </div>
  );
}
