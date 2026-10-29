import type { MailTemplateScope } from "./types";

export const BLOCK_TYPES = [
  "header",
  "heading",
  "paragraph",
  "image_banner",
  "cta_button",
  "divider",
  "spacer",
  "contact_strip",
  "footer",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type BlockProps = Record<string, string | number>;

export interface MailBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
}

export interface MailLayout {
  version: 1;
  blocks: MailBlock[];
}

export const CTA_URL_TYPES = ["site", "campaign", "client", "custom"] as const;

export const SCOPES_BY_AUDIENCE: Record<
  "workspace" | "admin" | "agency",
  MailTemplateScope[]
> = {
  workspace: ["WORKSPACE_MANAGER", "CAMPAIGN_BROADCAST"],
  admin: ["ADMIN_SYSTEM_BROADCAST", "TRANSACTIONAL_AUTO"],
  agency: ["AGENCY_INTERNAL", "AGENCY_CLIENT"],
};

const DEFAULT_PROPS: Record<BlockType, BlockProps> = {
  header: {},
  heading: { text: "", align: "left" },
  paragraph: { text: "" },
  image_banner: { imageUrl: "", imageAlt: "", linkUrl: "" },
  cta_button: { label: "", urlType: "site", customUrl: "" },
  divider: {},
  spacer: { heightPx: 24 },
  contact_strip: {},
  footer: {},
};

let counter = 0;
const nextId = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`;

export function newBlock(type: BlockType): MailBlock {
  return { id: nextId(), type, props: { ...DEFAULT_PROPS[type] } };
}

export function emptyLayout(): MailLayout {
  return { version: 1, blocks: [] };
}

/** Tolerates null/empty/corrupt JSON (legacy templates have no layout) and drops unknown block types. */
export function parseLayout(json: string | null | undefined): MailLayout {
  if (!json) return emptyLayout();
  try {
    const raw = JSON.parse(json) as { blocks?: unknown };
    if (!Array.isArray(raw.blocks)) return emptyLayout();
    const blocks = raw.blocks
      // The server accepts either case for the type name; the builder works with lowercase.
      .map((b) =>
        b && typeof b === "object" && typeof (b as MailBlock).type === "string"
          ? { ...(b as MailBlock), type: (b as MailBlock).type.toLowerCase() as BlockType }
          : b,
      )
      .filter(
        (b): b is MailBlock =>
          !!b &&
          typeof b === "object" &&
          typeof (b as MailBlock).id === "string" &&
          (BLOCK_TYPES as readonly string[]).includes((b as MailBlock).type),
      )
      .map((b) => ({
        ...b,
        props: { ...DEFAULT_PROPS[b.type], ...(b.props ?? {}) },
      }));
    return { version: 1, blocks };
  } catch {
    return emptyLayout();
  }
}

export function serializeLayout(layout: MailLayout): string {
  return JSON.stringify({ version: 1, blocks: layout.blocks });
}

export function insertBlock(
  blocks: MailBlock[],
  block: MailBlock,
  index: number,
): MailBlock[] {
  const at = Math.max(0, Math.min(index, blocks.length));
  return [...blocks.slice(0, at), block, ...blocks.slice(at)];
}

/** `to` is the final index of the moved block; out-of-range values are clamped. */
export function moveBlock(
  blocks: MailBlock[],
  from: number,
  to: number,
): MailBlock[] {
  if (from < 0 || from >= blocks.length) return blocks;
  const target = Math.max(0, Math.min(to, blocks.length - 1));
  if (target === from) return blocks;
  const next = blocks.slice();
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

export function removeBlock(blocks: MailBlock[], id: string): MailBlock[] {
  return blocks.filter((b) => b.id !== id);
}

export function updateBlockProps(
  blocks: MailBlock[],
  id: string,
  patch: BlockProps,
): MailBlock[] {
  return blocks.map((b) =>
    b.id === id ? { ...b, props: { ...b.props, ...patch } } : b,
  );
}

const isHttp = (url: string) => /^https?:\/\//i.test(url.trim());
const blank = (v: string | number | undefined) =>
  typeof v !== "string" || !v.trim();

/** Mirrors backend MailBlockRenderer.validateBlock; returns an i18n key suffix per failing block id. */
export function validateBlocks(blocks: MailBlock[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const { id, type, props } of blocks) {
    switch (type) {
      case "heading":
      case "paragraph":
        if (blank(props.text)) errors[id] = "textRequired";
        break;
      case "image_banner":
        if (blank(props.imageUrl) || blank(props.imageAlt))
          errors[id] = "imageRequired";
        else if (!isHttp(String(props.imageUrl))) errors[id] = "urlHttp";
        else if (!blank(props.linkUrl) && !isHttp(String(props.linkUrl)))
          errors[id] = "urlHttp";
        break;
      case "cta_button":
        if (blank(props.label)) errors[id] = "labelRequired";
        else if (props.urlType === "custom") {
          if (blank(props.customUrl)) errors[id] = "urlRequired";
          else if (!isHttp(String(props.customUrl))) errors[id] = "urlHttp";
        }
        break;
      case "spacer":
        if (
          typeof props.heightPx !== "number" ||
          props.heightPx < 0 ||
          props.heightPx > 200
        )
          errors[id] = "heightInvalid";
        break;
      default:
        break;
    }
  }
  return errors;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const ACCENT = "#f05a28";

/** One block as the server renders it (MailBlockRenderer): inline styles only, every value escaped. */
function previewBlock(type: BlockType, props: BlockProps): string {
  switch (type) {
    case "header":
      return `<div style="font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${ACCENT}">{{workspaceName}}</div>`;
    case "heading":
      return `<h2 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#18181b;text-align:${props.align === "center" || props.align === "right" ? props.align : "left"}">${esc(props.text)}</h2>`;
    case "paragraph":
      return `<p style="margin:0;font-size:15px;line-height:1.65;color:#3f3f46;white-space:pre-wrap">${esc(props.text)}</p>`;
    case "image_banner":
      return isHttp(String(props.imageUrl ?? ""))
        ? `<img src="${esc(props.imageUrl)}" alt="${esc(props.imageAlt)}" width="536" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:6px"/>`
        : "";
    case "cta_button":
      return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${ACCENT};border-radius:6px"><span style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;line-height:1.2;color:#ffffff">${esc(props.label)}</span></td></tr></table>`;
    case "divider":
      return '<div style="height:1px;line-height:1px;font-size:1px;background:#e4e4e7">&nbsp;</div>';
    case "spacer": {
      const px = Math.max(0, Number(props.heightPx) || 0);
      return `<div style="height:${px}px;line-height:${px}px;font-size:1px">&nbsp;</div>`;
    }
    case "contact_strip":
      return '<div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.6;color:#52525b">Liên hệ / Contact: <strong style="color:#18181b">{{senderName}}</strong> · {{workspaceName}}</div>';
    case "footer":
      return '<div style="padding-top:8px;font-size:12px;line-height:1.6;color:#71717a;text-align:center">Email được gửi từ {{workspaceName}} qua BrandHub.</div>';
  }
}

/**
 * Client-side mirror of the server render, for the live preview only: the same email-safe frame (600px card, accent
 * border, inline styles). `{{workspaceName}}` and `{{senderName}}` are filled with sample values by the preview frame.
 */
export function renderLayoutPreview(blocks: MailBlock[]): string {
  const rows = blocks
    .map(
      ({ type, props }) =>
        `<tr><td class="mail-block mail-block-${type}" style="padding:${type === "header" ? "12px 32px 4px" : "10px 32px"}">${previewBlock(type, props)}</td></tr>`,
    )
    .join("");
  const gap = '<tr><td style="height:12px;line-height:12px;font-size:1px">&nbsp;</td></tr>';
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">' +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-top:4px solid ${ACCENT};font-family:${FONT};color:#18181b">` +
    gap +
    rows +
    gap +
    "</table></td></tr></table>"
  );
}
