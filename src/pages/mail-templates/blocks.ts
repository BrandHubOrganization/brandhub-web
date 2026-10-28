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

/** Client-side approximation of the server render, for the live preview only. Every value is escaped. */
export function renderLayoutPreview(blocks: MailBlock[]): string {
  return blocks
    .map(({ type, props }) => {
      switch (type) {
        case "header":
          return '<div style="padding:12px 0;font-weight:600">Logo</div>';
        case "heading":
          return `<h2 style="text-align:${props.align === "center" ? "center" : "left"}">${esc(props.text)}</h2>`;
        case "paragraph":
          return `<p style="white-space:pre-wrap">${esc(props.text)}</p>`;
        case "image_banner":
          return isHttp(String(props.imageUrl ?? ""))
            ? `<img src="${esc(props.imageUrl)}" alt="${esc(props.imageAlt)}" style="max-width:100%"/>`
            : "";
        case "cta_button":
          return `<p><span style="display:inline-block;padding:10px 18px;background:#f05a28;color:#fff;border-radius:6px">${esc(props.label)}</span></p>`;
        case "divider":
          return "<hr/>";
        case "spacer":
          return `<div style="height:${Math.max(0, Number(props.heightPx) || 0)}px"></div>`;
        case "contact_strip":
          return '<div style="padding:8px 0;color:#666;font-size:12px">Contact</div>';
        case "footer":
          return '<div style="padding:8px 0;color:#999;font-size:12px">Footer</div>';
      }
    })
    .join("");
}
