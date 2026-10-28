import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  BLOCK_TYPES,
  CTA_URL_TYPES,
  insertBlock,
  moveBlock,
  newBlock,
  removeBlock,
  updateBlockProps,
  type BlockProps,
  type BlockType,
  type MailBlock,
} from "../blocks";

interface Props {
  blocks: MailBlock[];
  onChange: (blocks: MailBlock[]) => void;
  /** Block id -> i18n key suffix, from validateBlocks. */
  errors: Record<string, string>;
  disabled?: boolean;
}

gsap.registerPlugin(Flip);

const ICON_BTN =
  "rounded p-1.5 hover:bg-muted focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40";

const PALETTE_PREFIX = "palette:";
const BLOCK_PREFIX = "block:";

export function BlockBuilder({ blocks, onChange, errors, disabled }: Props) {
  const { t } = useTranslation();
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  // Structural changes (add / move / remove) animate so the user sees which block went where.
  // Typing in a block uses onChange directly and does not animate.
  const change = (next: MailBlock[]) => {
    if (listRef.current) flipState.current = Flip.getState(Array.from(listRef.current.children));
    onChange(next);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    Flip.from(state, {
      duration: 0.25,
      ease: "power2.out",
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }),
    });
  }, [blocks]);

  const add = (type: BlockType, index = blocks.length) => {
    const block = newBlock(type);
    change(insertBlock(blocks, block, index));
    setOpenId(block.id);
  };

  const drop = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setOverIndex(null);
    setDragIndex(null);
    if (disabled) return;
    const payload = event.dataTransfer.getData("text/plain");
    if (payload.startsWith(PALETTE_PREFIX)) {
      const type = payload.slice(PALETTE_PREFIX.length) as BlockType;
      if ((BLOCK_TYPES as readonly string[]).includes(type)) add(type, index);
    } else if (payload.startsWith(BLOCK_PREFIX)) {
      const from = Number(payload.slice(BLOCK_PREFIX.length));
      if (Number.isInteger(from))
        change(moveBlock(blocks, from, index > from ? index - 1 : index));
    }
  };

  const allowDrop = (event: React.DragEvent, index: number) => {
    if (disabled) return;
    event.preventDefault();
    setOverIndex(index);
  };

  const patch = (id: string, p: BlockProps) =>
    onChange(updateBlockProps(blocks, id, p));

  return (
    <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
      <ul
        aria-label={t("mailTemplate.builder.palette")}
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-1 sm:content-start"
      >
        {BLOCK_TYPES.map((type) => (
          <li key={type}>
            <button
              type="button"
              disabled={disabled}
              draggable={!disabled}
              data-testid={`palette-${type}`}
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", PALETTE_PREFIX + type)
              }
              onClick={() => add(type)}
              className="hover:bg-muted focus-visible:ring-ring flex w-full items-center gap-1.5 rounded border px-2 py-1.5 text-left text-xs transition-transform focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:opacity-40"
            >
              <Plus className="size-3.5 shrink-0" />
              {t(`mailTemplate.builder.blocks.${type}`)}
            </button>
          </li>
        ))}
      </ul>

      <div
        aria-label={t("mailTemplate.builder.canvas")}
        data-testid="builder-canvas"
        className={`min-h-40 space-y-2 rounded border border-dashed p-2 ${overIndex === blocks.length ? "ring-brand-orange ring-2" : ""}`}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverIndex(null); }}
        onDragOver={(e) => allowDrop(e, blocks.length)}
        onDrop={(e) => drop(e, blocks.length)}
      >
        {blocks.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {t("mailTemplate.builder.empty")}
          </p>
        )}
        <ol ref={listRef} className="space-y-2">
          {blocks.map((block, index) => {
            const open = openId === block.id;
            const error = errors[block.id];
            return (
              <li
                key={block.id}
                data-testid={`block-${index}`}
                onDragOver={(e) => {
                  e.stopPropagation();
                  allowDrop(e, index);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  drop(e, index);
                }}
                className={`rounded border bg-white dark:bg-zinc-900 ${overIndex === index ? "ring-brand-orange ring-2" : ""} ${dragIndex === index ? "opacity-50" : ""} ${error ? "border-destructive" : ""}`}
              >
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <span
                    draggable={!disabled}
                    aria-hidden="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", BLOCK_PREFIX + index);
                      setDragIndex(index);
                    }}
                    onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </span>
                  <button
                    type="button"
                    className="focus-visible:ring-ring flex-1 truncate rounded px-1 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : block.id)}
                  >
                    {t(`mailTemplate.builder.blocks.${block.type}`)}
                  </button>
                  <button
                    type="button"
                    className={ICON_BTN}
                    disabled={disabled || index === 0}
                    aria-label={t("mailTemplate.builder.moveUp")}
                    onClick={() => change(moveBlock(blocks, index, index - 1))}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={ICON_BTN}
                    disabled={disabled || index === blocks.length - 1}
                    aria-label={t("mailTemplate.builder.moveDown")}
                    onClick={() => change(moveBlock(blocks, index, index + 1))}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${ICON_BTN} hover:text-destructive`}
                    disabled={disabled}
                    aria-label={t("mailTemplate.builder.remove")}
                    onClick={() => change(removeBlock(blocks, block.id))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="text-destructive px-2 pb-1 text-xs"
                  >
                    {t(`mailTemplate.builder.errors.${error}`)}
                  </p>
                )}
                {open && (
                  <div className="space-y-2 border-t px-2 py-2">
                    <PropsEditor
                      block={block}
                      disabled={disabled}
                      onPatch={(p) => patch(block.id, p)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function PropsEditor({
  block,
  disabled,
  onPatch,
}: {
  block: MailBlock;
  disabled?: boolean;
  onPatch: (p: BlockProps) => void;
}) {
  const { t } = useTranslation();
  const { props } = block;
  const field = (
    key: string,
    labelKey: string,
    extra?: { maxLength?: number; type?: string },
  ) => (
    <label className="block space-y-1 text-xs font-medium">
      <span>{t(labelKey)}</span>
      <Input
        value={String(props[key] ?? "")}
        disabled={disabled}
        maxLength={extra?.maxLength}
        type={extra?.type}
        onChange={(e) => onPatch({ [key]: e.target.value })}
      />
    </label>
  );

  switch (block.type) {
    case "heading":
      return (
        <>
          {field("text", "mailTemplate.builder.props.text", { maxLength: 200 })}
          <label className="block space-y-1 text-xs font-medium">
            <span>{t("mailTemplate.builder.props.align")}</span>
            <select
              className="bg-background w-full rounded border px-2 py-1.5 text-sm"
              disabled={disabled}
              value={String(props.align)}
              onChange={(e) => onPatch({ align: e.target.value })}
            >
              <option value="left">
                {t("mailTemplate.builder.props.alignLeft")}
              </option>
              <option value="center">
                {t("mailTemplate.builder.props.alignCenter")}
              </option>
            </select>
          </label>
        </>
      );
    case "paragraph":
      return (
        <label className="block space-y-1 text-xs font-medium">
          <span>{t("mailTemplate.builder.props.text")}</span>
          <textarea
            className="bg-background min-h-24 w-full rounded border px-2 py-1.5 text-sm"
            disabled={disabled}
            maxLength={5000}
            value={String(props.text ?? "")}
            onChange={(e) => onPatch({ text: e.target.value })}
          />
        </label>
      );
    case "image_banner":
      return (
        <>
          {field("imageUrl", "mailTemplate.builder.props.imageUrl")}
          {field("imageAlt", "mailTemplate.builder.props.imageAlt", {
            maxLength: 200,
          })}
          {field("linkUrl", "mailTemplate.builder.props.linkUrl")}
        </>
      );
    case "cta_button":
      return (
        <>
          {field("label", "mailTemplate.builder.props.label", {
            maxLength: 80,
          })}
          <label className="block space-y-1 text-xs font-medium">
            <span>{t("mailTemplate.builder.props.urlType")}</span>
            <select
              className="bg-background w-full rounded border px-2 py-1.5 text-sm"
              disabled={disabled}
              value={String(props.urlType)}
              onChange={(e) => onPatch({ urlType: e.target.value })}
            >
              {CTA_URL_TYPES.map((u) => (
                <option key={u} value={u}>
                  {t(`mailTemplate.builder.props.urlTypes.${u}`)}
                </option>
              ))}
            </select>
          </label>
          {props.urlType === "custom" &&
            field("customUrl", "mailTemplate.builder.props.customUrl")}
        </>
      );
    case "spacer":
      return (
        <label className="block space-y-1 text-xs font-medium">
          <span>{t("mailTemplate.builder.props.heightPx")}</span>
          <Input
            type="number"
            min={0}
            max={200}
            value={Number(props.heightPx)}
            disabled={disabled}
            onChange={(e) =>
              onPatch({
                heightPx: e.target.value === "" ? -1 : Number(e.target.value),
              })
            }
          />
        </label>
      );
    default:
      return (
        <p className="text-muted-foreground text-xs">
          {t("mailTemplate.builder.noProps")}
        </p>
      );
  }
}
