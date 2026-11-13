import { useDeferredValue, useMemo, useState } from "react";
import { Monitor, Smartphone, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface InvitationMailPreviewProps {
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
  agencyTagline?: string | null;
  agencyPhone?: string | null;
  agencyWebsite?: string | null;
  agencyLocation?: string | null;
  agencyCategory?: string | null;
  agencyCompanySize?: string | null;
  workspaceName?: string | null;
  role?: string | null;
  inviteeName?: string | null;
  recipientEmail?: string | null;
  note?: string | null;
  expiryDays?: number | null;
  inviteLink?: string | null;
  fullHeight?: boolean;
  className?: string;
  isClient?: boolean;
  subjectOverride?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRoleLabel(role: string | null | undefined, isEn: boolean): string {
  if (!role) return isEn ? "Member" : "Thành viên";
  switch (role) {
    case "OWNER":
      return isEn ? "Owner" : "Chủ sở hữu";
    case "MANAGER":
    case "PROJECT_MANAGER":
      return isEn ? "Manager" : "Quản lý";
    case "CREATOR":
      return isEn ? "Creator" : "Người tạo nội dung";
    case "CLIENT":
      return isEn ? "Client" : "Khách hàng";
    case "ADMIN":
      return isEn ? "Admin" : "Quản trị viên";
    case "VIEWER":
      return isEn ? "Viewer" : "Người xem";
    default:
      return role;
  }
}

/**
 * Builds the HTML content for an invitation email preview matching BrandHub's MailServiceImpl.java
 */
function buildInvitationHtml(props: InvitationMailPreviewProps, isEn: boolean): string {
  const agencyName = escapeHtml(props.agencyName?.trim() || "BrandHub Agency");
  const headingName = escapeHtml(
    props.workspaceName?.trim()
      ? props.workspaceName.trim()
      : props.agencyName?.trim() || "BrandHub Agency",
  );
  const targetName = props.inviteeName?.trim()
    ? escapeHtml(props.inviteeName.trim())
    : isEn
      ? "there"
      : "bạn";

  const isClientRole = props.isClient || props.role === "CLIENT";
  const roleDisplay = getRoleLabel(props.role, isEn);
  const expiryDays = Math.max(1, props.expiryDays ?? 30);

  let descriptionHtml: string;
  if (isClientRole && props.workspaceName) {
    descriptionHtml = isEn
      ? `You've been invited to join the workspace <strong>${escapeHtml(props.workspaceName)}</strong> under <strong>${agencyName}</strong> as a <strong>Client</strong> on BrandHub to review deliverables and approve content. Click the button below to accept.`
      : `Bạn được mời tham gia với vai trò <strong>Khách hàng (Client)</strong> tại không gian làm việc <strong>${escapeHtml(props.workspaceName)}</strong> thuộc công ty <strong>${agencyName}</strong> trên BrandHub để cùng theo dõi tiến độ, trao đổi và phê duyệt nội dung. Bấm nút bên dưới để chấp nhận.`;
  } else if (props.workspaceName) {
    descriptionHtml = isEn
      ? `You've been invited to join the workspace <strong>${escapeHtml(props.workspaceName)}</strong> under <strong>${agencyName}</strong> as <strong>${roleDisplay}</strong> on BrandHub. Click the button below to accept.`
      : `Bạn được mời tham gia không gian làm việc <strong>${escapeHtml(props.workspaceName)}</strong> thuộc công ty <strong>${agencyName}</strong> với vai trò <strong>${roleDisplay}</strong> trên BrandHub. Bấm nút bên dưới để chấp nhận.`;
  } else {
    descriptionHtml = isEn
      ? `You've been invited to join <strong>${agencyName}</strong> on BrandHub to collaborate on upcoming projects. Click the button below to accept.`
      : `Bạn được mời tham gia công ty <strong>${agencyName}</strong> trên BrandHub để cùng hợp tác trong các dự án. Bấm nút bên dưới để chấp nhận.`;
  }

  // Agency info box
  let agencyInfoHtml = `<div style="background:#fafafa;border:1px solid #eee;border-radius:10px;padding:16px 18px;margin:0 0 22px">`;
  if (props.agencyLogoUrl) {
    agencyInfoHtml += `<img src="${escapeHtml(props.agencyLogoUrl)}" alt="${agencyName}" style="max-width:44px;max-height:44px;border-radius:8px;margin:0 0 10px;display:block;object-fit:cover" />`;
  }
  agencyInfoHtml += `<p style="margin:0 0 4px;font-weight:700;color:#18181b;font-size:15px">${agencyName}</p>`;
  if (props.agencyTagline?.trim()) {
    agencyInfoHtml += `<p style="margin:0 0 6px;color:#52525b;font-style:italic;font-size:13px">&ldquo;${escapeHtml(props.agencyTagline.trim())}&rdquo;</p>`;
  }
  if (props.agencyCategory?.trim()) {
    agencyInfoHtml += `<p style="margin:0 0 2px;color:#777;font-size:12px">${escapeHtml(props.agencyCategory.trim())}</p>`;
  }
  if (props.agencyCompanySize?.trim()) {
    agencyInfoHtml += `<p style="margin:0 0 2px;color:#777;font-size:12px">${escapeHtml(props.agencyCompanySize.trim())}</p>`;
  }
  agencyInfoHtml += `</div>`;

  // Note block
  let noteHtml = "";
  if (props.note?.trim()) {
    noteHtml = `<div style="background:#fff1ec;border-left:3.5px solid #ca3d0e;border-radius:6px;padding:13px 16px;margin:0 0 22px">
      <p style="margin:0;color:#444;font-size:13px;line-height:1.6;white-space:pre-line">${escapeHtml(props.note.trim())}</p>
    </div>`;
  }

  // Contacts
  const contacts: string[] = [];
  if (props.agencyPhone?.trim()) {
    contacts.push(`📞 ${escapeHtml(props.agencyPhone.trim())}`);
  }
  if (props.agencyWebsite?.trim()) {
    contacts.push(`🌐 ${escapeHtml(props.agencyWebsite.trim())}`);
  }
  if (props.agencyLocation?.trim()) {
    contacts.push(`📍 ${escapeHtml(props.agencyLocation.trim())}`);
  }

  const footerContactsHtml =
    contacts.length > 0
      ? `<div style="margin:26px 0 0;padding-top:16px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;line-height:1.6">
           <p style="margin:0 0 4px;font-weight:600;color:#27272a">${agencyName}</p>
           <p style="margin:0">${contacts.join(" | ")}</p>
         </div>`
      : "";

  const greeting = isEn ? `Hello ${targetName},` : `Chào ${targetName},`;
  const acceptText = isEn ? "Accept Invitation" : "Chấp nhận lời mời";
  const expiryText = isEn
    ? `This invitation link is valid for ${expiryDays} days. If you weren't expecting this invitation, you can safely ignore this email.`
    : `Liên kết lời mời có hiệu lực trong ${expiryDays} ngày. Nếu bạn không mong đợi lời mời này, hãy bỏ qua email này.`;

  return `<!DOCTYPE html>
<html lang="${isEn ? "en" : "vi"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      padding: 24px 12px;
      display: flex;
      justify-content: center;
      background: #f4f4f5;
      min-height: 100vh;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px 28px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      border-top: 4px solid #ca3d0e;
      margin: 0 auto;
    }
    .brand-logo {
      margin: 0 0 24px;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.02em;
    }
    .brand { color: #18181b; }
    .hub { color: #ca3d0e; }
    h1 {
      color: #18181b;
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.35;
    }
    .greeting {
      margin: 0 0 8px;
      color: #555;
      font-size: 14px;
      line-height: 1.6;
    }
    .description {
      margin: 0 0 20px;
      color: #555;
      font-size: 14px;
      line-height: 1.6;
    }
    .btn-wrap {
      margin: 22px 0;
    }
    .btn-cta {
      display: inline-block;
      background: #ca3d0e;
      color: #ffffff !important;
      padding: 13px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 3px 8px rgba(202,61,14,0.28);
    }
    .expiry {
      margin: 20px 0 0;
      color: #999;
      font-size: 12px;
      line-height: 1.5;
    }
    .brand-footer {
      border: none;
      border-top: 1px solid #eee;
      margin: 26px 0 14px;
    }
    .brand-subtext {
      margin: 0;
      color: #bbb;
      font-size: 11px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="brand-logo">
        <span class="brand">Brand</span><span class="hub">Hub</span>
      </div>
      <h1>${isEn ? `You're invited to join ${headingName}` : `Bạn được mời tham gia ${headingName}`}</h1>
      <p class="greeting">${greeting}</p>
      <div class="description">${descriptionHtml}</div>
      ${agencyInfoHtml}
      ${noteHtml}
      <div class="btn-wrap">
        <a href="${props.inviteLink ? escapeHtml(props.inviteLink) : "#"}" class="btn-cta" onclick="return false;">
          ${acceptText}
        </a>
      </div>
      <p class="expiry">${expiryText}</p>
      ${footerContactsHtml}
      <hr class="brand-footer" />
      <p class="brand-subtext">BrandHub &mdash; All-in-one social media management</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Reusable Live Sandboxed Email Preview for Member & Client Invitations.
 * Follows the design system used in mail-templates/MailPreview.
 */
export function InvitationMailPreview(props: InvitationMailPreviewProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const isClientRole = props.isClient || props.role === "CLIENT";

  // Calculate subject line
  const subject = useMemo(() => {
    if (props.subjectOverride?.trim()) return props.subjectOverride.trim();

    const agency = props.agencyName?.trim() || "BrandHub Agency";
    const ws = props.workspaceName?.trim();

    if (isClientRole && ws) {
      return isEn
        ? `You've been invited to join ${ws} (${agency}) as Client on BrandHub`
        : `Bạn được mời tham gia ${ws} (${agency}) với vai trò Khách hàng trên BrandHub`;
    }
    if (ws) {
      return isEn
        ? `You've been invited to join ${ws} (${agency}) on BrandHub`
        : `Bạn được mời tham gia ${ws} (${agency}) trên BrandHub`;
    }
    return isEn
      ? `You've been invited to join ${agency} on BrandHub`
      : `Bạn được mời tham gia ${agency} trên BrandHub`;
  }, [props.subjectOverride, props.agencyName, props.workspaceName, isClientRole, isEn]);

  // Deferred rendering for snappy typing in forms
  const deferredProps = useDeferredValue(props);
  const previewHtml = useMemo(
    () => buildInvitationHtml(deferredProps, isEn),
    [deferredProps, isEn],
  );

  const buttonClass = (active: boolean) =>
    `h-7 gap-1 px-2.5 text-xs cursor-pointer transition-colors ${
      active
        ? "bg-brand-orange/10 font-semibold text-brand-orange border border-brand-orange/30"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <section
      aria-label={t("agency.emailPreview.title", "Xem trước email")}
      className={`flex flex-col space-y-2.5 rounded-xl border border-border/80 bg-card p-4 shadow-xs ${
        props.fullHeight ? "h-full flex-1" : ""
      } ${props.className ?? ""}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
            <Mail className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>{t("agency.emailPreview.title", "Xem trước email gửi đi")}</span>
              <Sparkles className="size-3 text-amber-500" />
            </h3>
            <p className="text-3xs text-muted-foreground">
              {t("agency.emailPreview.subtitle", "Cập nhật trực quan theo nội dung soạn thảo")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClientRole ? (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-3xs font-medium"
            >
              {t("agency.emailPreview.clientBadge", "Lời mời Client")}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange text-3xs font-medium"
            >
              {t("agency.emailPreview.memberBadge", "Lời mời Thành viên")}
            </Badge>
          )}

          <div
            className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5"
            role="group"
            aria-label={t("mailTemplate.preview.device", "Kích thước xem trước")}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={buttonClass(device === "desktop")}
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="size-3.5" />
              <span>{t("mailTemplate.preview.desktop", "Máy tính")}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={buttonClass(device === "mobile")}
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="size-3.5" />
              <span>{t("mailTemplate.preview.mobile", "Điện thoại")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Subject and recipient banner */}
      <div className="space-y-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-muted-foreground shrink-0 w-16">
            {t("agency.emailPreview.to", "Gửi tới")}:
          </span>
          <span className="text-foreground truncate font-medium">
            {props.recipientEmail?.trim() || "teammate@company.com"}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-muted-foreground shrink-0 w-16">
            {t("agency.emailPreview.subject", "Tiêu đề")}:
          </span>
          <span className="text-foreground line-clamp-1 font-medium text-brand-orange">
            {subject}
          </span>
        </div>
      </div>

      {/* Frame viewport */}
      <div
        className={`flex justify-center rounded-xl border border-border/80 bg-muted/50 p-3 overflow-hidden ${
          props.fullHeight ? "flex-1 min-h-[460px]" : "h-[460px]"
        }`}
      >
        <iframe
          title={t("mailTemplate.preview.frame", "Xem trước email")}
          sandbox=""
          srcDoc={previewHtml}
          className="h-full rounded-lg border border-border/60 bg-white shadow-xs transition-all duration-200"
          style={{
            width: device === "mobile" ? "375px" : "100%",
            maxWidth: "100%",
          }}
        />
      </div>

      <p className="text-3xs text-muted-foreground text-center">
        {t(
          "agency.emailPreview.disclaimer",
          "Bố cục và nội dung email được bảo mật, tự động đồng bộ theo thông điệp bạn gửi.",
        )}
      </p>
    </section>
  );
}
