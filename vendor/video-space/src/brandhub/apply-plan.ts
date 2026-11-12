import {
  BatchCommand,
  Command,
  InsertElementCommand,
  UpdateElementsCommand,
  UpdateProjectSettingsCommand,
} from "@/commands";
import type { EditorCore } from "@/core";
import { buildTextElement } from "@/timeline/element-utils";
import { clampDb } from "@/timeline/audio-state";
import { mediaTimeFromSeconds, roundMediaTime, TICKS_PER_SECOND } from "@/wasm";
import type { TimelineElement } from "@/timeline/types";
import { transitionDuration } from "./transitions/motion";
import { validateEditPlan } from "./edit-plan";
import { FONT_SIZE_SCALE_REFERENCE } from "@/text/typography";
import { entranceAnimation } from "./resources/templates";
import type { TextStyle } from "./edit-plan";

type Canvas = { width: number; height: number };

// Native font sizes scale with canvas height (not pixels); cap by the template builder's safe-width estimate.
function fitFontSize(content: string, { width, height }: Canvas, cap: number) {
  const longest = Math.max(
    ...content.split("\n").map((line) => line.length),
    1,
  );
  return Math.min(
    cap,
    (width * 0.84 * FONT_SIZE_SCALE_REFERENCE) / (longest * 0.65 * height),
  );
}

// Validated AI style -> native text params; only the properties the AI set.
function styleParams(
  style: TextStyle | undefined,
  content: string,
  canvas: Canvas,
) {
  const params: Record<string, string | number | boolean> = {};
  if (!style) return params;
  if (style.font_family) params.fontFamily = style.font_family;
  if (style.color) params.color = style.color;
  if (style.bold !== undefined)
    params.fontWeight = style.bold ? "bold" : "normal";
  if (style.italic !== undefined)
    params.fontStyle = style.italic ? "italic" : "normal";
  if (style.background_color) {
    params["background.enabled"] = true;
    params["background.color"] = style.background_color;
  }
  if (style.position)
    params["transform.positionY"] =
      { top: -0.32, center: 0, bottom: 0.32 }[style.position] * canvas.height;
  if (style.size)
    params.fontSize = fitFontSize(
      content,
      canvas,
      { small: 3, medium: 5, large: 7.5 }[style.size],
    );
  return params;
}

class RenameCommand extends Command {
  private previous = "";
  constructor(
    private editor: EditorCore,
    private name: string,
  ) {
    super();
  }
  execute() {
    this.previous = this.editor.project.getActive().metadata.name;
    this.rename(this.name);
    return undefined;
  }
  undo() {
    this.rename(this.previous);
  }
  private rename(name: string) {
    const project = this.editor.project.getActive();
    this.editor.project.setActiveProject({
      project: {
        ...project,
        metadata: { ...project.metadata, name, updatedAt: new Date() },
      },
    });
    this.editor.save.markDirty();
  }
}

export function applyEditPlan({
  editor,
  plan,
}: {
  editor: EditorCore;
  plan: unknown;
}) {
  const tracks = editor.scenes.getActiveScene().tracks;
  validateEditPlan(plan, tracks, TICKS_PER_SECOND);
  if (plan.questions?.length) throw new Error("VIDEO_EDIT_PLAN_INVALID");
  if (plan.actions.length === 0) return;
  const allTracks = [tracks.main, ...tracks.overlay, ...tracks.audio];
  const { width, height } = editor.project.getActive().settings.canvasSize;
  const commands = plan.actions.map((action): Command => {
    if (action.kind === "rename_project")
      return new RenameCommand(editor, action.text!.trim());
    if (action.kind === "set_aspect_ratio")
      return new UpdateProjectSettingsCommand({
        canvasSize: {
          "16:9": { width: 1920, height: 1080 },
          "9:16": { width: 1080, height: 1920 },
          "1:1": { width: 1080, height: 1080 },
        }[action.aspect_ratio!],
        canvasSizeMode: "preset",
      });
    if (action.kind === "add_text") {
      const style = styleParams(action.style, action.text!, { width, height });
      const animation = action.style?.animation;
      return new InsertElementCommand({
        element: {
          ...buildTextElement({
            raw: {
              name: action.text!.slice(0, 40),
              duration: mediaTimeFromSeconds({
                seconds: action.duration_seconds ?? 3,
              }),
              params: {
                content: action.text!,
                fontSize: fitFontSize(action.text!, { width, height }, 7),
                fontFamily: "Be Vietnam Pro",
                color: "#ffffff",
                ...style,
              },
            },
            startTime: mediaTimeFromSeconds({
              seconds: action.start_seconds ?? 0,
            }),
          }),
          ...(animation && {
            animations: entranceAnimation({
              animation,
              y: Number(style["transform.positionY"] ?? 0),
            }),
          }),
        },
        placement: { mode: "auto" },
      });
    }
    const track = allTracks.find((item) =>
      item.elements.some((element) => element.id === action.element_id),
    )!;
    const element = track.elements.find(
      (item) => item.id === action.element_id,
    )!;
    let patch: Partial<TimelineElement>;
    if (action.kind === "set_text") {
      const current = element.params as Record<string, unknown>;
      const content = action.text ?? String(current.content ?? "");
      const style = styleParams(action.style, content, { width, height });
      patch = {
        params: {
          ...(action.text !== undefined && { content: action.text }),
          ...style,
        },
      } as Partial<TimelineElement>;
      if (action.style?.animation)
        patch.animations = entranceAnimation({
          animation: action.style.animation,
          y: Number(
            style["transform.positionY"] ?? current["transform.positionY"] ?? 0,
          ),
        });
    } else if (action.kind === "set_volume")
      patch = {
        params: {
          volume:
            action.volume! > 0 ? clampDb(20 * Math.log10(action.volume!)) : 0,
          muted: action.volume === 0,
        },
      };
    else if (action.kind === "set_speed") {
      const clip = element as Extract<
        TimelineElement,
        { type: "video" | "audio" }
      >;
      patch = { retime: { ...clip.retime, rate: action.speed! } };
    } else if (action.kind === "trim_clip") {
      const clip = element as Extract<
        TimelineElement,
        { type: "video" | "audio" }
      >;
      const rate = clip.retime?.rate ?? 1;
      const sourceDuration =
        clip.sourceDuration ??
        clip.trimStart + clip.duration * rate + clip.trimEnd;
      const trimStart = roundMediaTime({
        time:
          clip.trimStart +
          (action.start_seconds ?? 0) * TICKS_PER_SECOND * rate,
      });
      const duration = mediaTimeFromSeconds({
        seconds: action.duration_seconds ?? 3,
      });
      patch = {
        trimStart,
        duration,
        sourceDuration: roundMediaTime({ time: sourceDuration }),
        trimEnd: roundMediaTime({
          time: Math.max(0, sourceDuration - trimStart - duration * rate),
        }),
      };
    } else {
      const sorted = [...tracks.main.elements].sort(
        (a, b) => a.startTime - b.startTime,
      );
      const previous =
        sorted[sorted.findIndex((item) => item.id === element.id) - 1];
      patch = {
        params: {
          "bh.transition": action.transition_id!,
          "bh.transition.duration": roundMediaTime({
            time: transitionDuration({
              requested: mediaTimeFromSeconds({
                seconds: action.duration_seconds ?? 3,
              }),
              previous: previous.duration,
              next: element.duration,
            }),
          }),
        },
      };
    }
    return new UpdateElementsCommand({
      updates: [{ trackId: track.id, elementId: element.id, patch }],
    });
  });
  editor.command.execute({ command: new BatchCommand(commands) });
}
