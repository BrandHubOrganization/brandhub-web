import type { SceneTracks, TimelineElement } from "@/timeline/types";
import { isTransitionKind, type TransitionKind } from "./transitions/motion";
import bundledFonts from "@/fonts/bundled-fonts.json";

export interface TextStyle {
  font_family?: string;
  color?: string;
  background_color?: string;
  size?: "small" | "medium" | "large";
  bold?: boolean;
  italic?: boolean;
  position?: "top" | "center" | "bottom";
  animation?: "none" | "fade" | "slide" | "pop";
}

const HEX = /^#[0-9A-Fa-f]{6}$/;
const STYLE_RULES: Record<keyof TextStyle, (value: unknown) => boolean> = {
  font_family: (v) => typeof v === "string" && Object.hasOwn(bundledFonts, v),
  color: (v) => typeof v === "string" && HEX.test(v),
  background_color: (v) => typeof v === "string" && HEX.test(v),
  size: (v) => ["small", "medium", "large"].includes(v as string),
  bold: (v) => typeof v === "boolean",
  italic: (v) => typeof v === "boolean",
  position: (v) => ["top", "center", "bottom"].includes(v as string),
  animation: (v) => ["none", "fade", "slide", "pop"].includes(v as string),
};
function validStyle(value: unknown): value is TextStyle {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return (
    entries.length > 0 &&
    entries.every(
      ([key, v]) =>
        Object.hasOwn(STYLE_RULES, key) &&
        STYLE_RULES[key as keyof TextStyle](v),
    )
  );
}

export interface EditAction {
  kind:
    | "rename_project"
    | "set_aspect_ratio"
    | "add_text"
    | "set_text"
    | "set_volume"
    | "trim_clip"
    | "set_speed"
    | "set_transition";
  text?: string;
  element_id?: string;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  start_seconds?: number;
  duration_seconds?: number;
  volume?: number;
  speed?: number;
  transition_id?: TransitionKind;
  style?: TextStyle;
}

export interface EditQuestion {
  question: string;
  options?: { label: string; description?: string; recommended?: boolean }[];
}

export function validEditQuestion(
  value: unknown,
): value is string | EditQuestion {
  if (typeof value === "string")
    return Boolean(value.trim()) && value.length <= 500;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const q = value as EditQuestion;
  if (
    Object.keys(q).some((key) => !["question", "options"].includes(key)) ||
    typeof q.question !== "string" ||
    !q.question.trim() ||
    q.question.length > 500
  )
    return false;
  if (q.options === undefined) return true;
  if (
    !Array.isArray(q.options) ||
    q.options.length === 1 ||
    q.options.length > 3
  )
    return false;
  const labels = new Set<string>();
  let recommended = 0;
  return q.options.every((option) => {
    if (
      !option ||
      typeof option !== "object" ||
      Array.isArray(option) ||
      Object.keys(option).some(
        (key) => !["label", "description", "recommended"].includes(key),
      ) ||
      typeof option.label !== "string" ||
      !option.label.trim() ||
      option.label.length > 160 ||
      (option.description !== undefined &&
        (typeof option.description !== "string" ||
          option.description.length > 240)) ||
      (option.recommended !== undefined &&
        typeof option.recommended !== "boolean")
    )
      return false;
    const label = option.label.trim().toLowerCase();
    if (labels.has(label)) return false;
    labels.add(label);
    if (option.recommended && ++recommended > 1) return false;
    return true;
  });
}

export interface EditPlan {
  summary: string;
  actions: EditAction[];
  questions?: (string | EditQuestion)[];
  base_revision: number;
}

const fields: Record<EditAction["kind"], readonly string[]> = {
  rename_project: ["text"],
  set_aspect_ratio: ["aspect_ratio"],
  add_text: ["text", "start_seconds", "duration_seconds", "style"],
  set_text: ["element_id", "text", "style"],
  set_volume: ["element_id", "volume"],
  trim_clip: ["element_id", "start_seconds", "duration_seconds"],
  set_speed: ["element_id", "speed"],
  set_transition: ["element_id", "transition_id", "duration_seconds"],
};
function invalid(): never {
  throw new Error("VIDEO_EDIT_PLAN_INVALID");
}
function bounded(
  value: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

// Validate the complete untrusted response before constructing native commands.
export function validateEditPlan(
  value: unknown,
  tracks: SceneTracks,
  ticksPerSecond: number,
): asserts value is EditPlan {
  if (!value || typeof value !== "object") invalid();
  const plan = value as EditPlan;
  if (
    typeof plan.summary !== "string" ||
    plan.summary.length > 4000 ||
    !Number.isSafeInteger(plan.base_revision) ||
    plan.base_revision < 1 ||
    !Array.isArray(plan.actions) ||
    plan.actions.length > 10
  )
    invalid();
  if (
    plan.questions !== undefined &&
    (!Array.isArray(plan.questions) ||
      plan.questions.length > 3 ||
      plan.questions.some((question) => !validEditQuestion(question)) ||
      (plan.questions.length > 0 && plan.actions.length > 0))
  )
    invalid();
  const allTracks = [tracks.main, ...tracks.overlay, ...tracks.audio];
  const seen = new Set<string>();
  const timing = new Set<string>();
  const transitions: string[][] = [];
  for (const action of plan.actions) {
    if (
      !action ||
      typeof action !== "object" ||
      !Object.hasOwn(fields, action.kind) ||
      Object.keys(action).some(
        (key) => key !== "kind" && !fields[action.kind].includes(key),
      )
    )
      invalid();
    const key = `${action.kind}:${action.element_id ?? (action.kind === "add_text" ? JSON.stringify([action.text, action.start_seconds ?? 0, action.duration_seconds ?? 3]) : "project")}`;
    if (seen.has(key)) invalid();
    seen.add(key);
    if (
      action.text !== undefined &&
      (typeof action.text !== "string" ||
        (action.kind !== "set_text" && !action.text.trim()) ||
        action.text.length > (action.kind === "rename_project" ? 200 : 500))
    )
      invalid();
    if (
      action.start_seconds !== undefined &&
      !bounded(
        action.start_seconds,
        0,
        Number.MAX_SAFE_INTEGER / ticksPerSecond,
      )
    )
      invalid();
    if (
      action.duration_seconds !== undefined &&
      !bounded(
        action.duration_seconds,
        1 / ticksPerSecond,
        Number.MAX_SAFE_INTEGER / ticksPerSecond,
      )
    )
      invalid();
    if (
      (["rename_project", "add_text"].includes(action.kind) ||
        (action.kind === "set_text" && action.style === undefined)) &&
      typeof action.text !== "string"
    )
      invalid();
    if (action.style !== undefined && !validStyle(action.style)) invalid();
    if (
      action.kind === "set_aspect_ratio" &&
      !["16:9", "9:16", "1:1"].includes(action.aspect_ratio ?? "")
    )
      invalid();
    if (action.kind === "set_volume" && !bounded(action.volume, 0, 2))
      invalid();
    if (action.kind === "set_speed" && !bounded(action.speed, 0.25, 4))
      invalid();
    if (!fields[action.kind].includes("element_id")) continue;
    if (typeof action.element_id !== "string" || !action.element_id) invalid();
    const matches = allTracks.flatMap((track) =>
      track.elements
        .filter((element) => element.id === action.element_id)
        .map((element) => ({ track, element })),
    );
    if (matches.length !== 1) invalid();
    const { track, element } = matches[0];
    if (action.kind === "set_text" && element.type !== "text") invalid();
    if (
      ["set_volume", "trim_clip", "set_speed"].includes(action.kind) &&
      element.type !== "audio" &&
      element.type !== "video"
    )
      invalid();
    if (action.kind === "trim_clip" || action.kind === "set_speed") {
      if (timing.has(element.id)) invalid();
      timing.add(element.id);
      const clip = element as Extract<
        TimelineElement,
        { type: "video" | "audio" }
      >;
      const rate = clip.retime?.rate ?? 1;
      const source =
        clip.sourceDuration ??
        clip.trimStart + clip.duration * rate + clip.trimEnd;
      if (
        ![clip.duration, clip.trimStart, clip.trimEnd, rate, source].every(
          (n) => bounded(n, 0),
        ) ||
        rate === 0 ||
        clip.duration === 0 ||
        clip.trimStart + clip.duration * rate > source + 1
      )
        invalid();
      if (action.kind === "trim_clip") {
        const offset = (action.start_seconds ?? 0) * ticksPerSecond;
        const duration = (action.duration_seconds ?? 3) * ticksPerSecond;
        if (
          offset + duration > clip.duration + 1 ||
          clip.trimStart + (offset + duration) * rate > source + 1
        )
          invalid();
      }
    }
    if (action.kind === "set_transition") {
      if (
        !isTransitionKind(action.transition_id) ||
        track.id !== tracks.main.id
      )
        invalid();
      const sorted = [...tracks.main.elements].sort(
        (a, b) => a.startTime - b.startTime,
      );
      const previous =
        sorted[sorted.findIndex((item) => item.id === element.id) - 1];
      if (
        !previous ||
        Math.abs(previous.startTime + previous.duration - element.startTime) >
          1 ||
        previous.duration <= 0 ||
        element.duration <= 0
      )
        invalid();
      transitions.push([previous.id, element.id]);
    }
  }
  if (transitions.some((ids) => ids.some((id) => timing.has(id)))) invalid();
}
