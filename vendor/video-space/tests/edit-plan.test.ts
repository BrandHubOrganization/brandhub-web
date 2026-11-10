import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandManager } from "../src/core/managers/commands";
import { applyEditPlan } from "../src/brandhub/apply-plan";
import { validateEditPlan } from "../src/brandhub/edit-plan";
import type { EditAction } from "../src/brandhub/edit-plan";
import { editingBasis } from "../src/brandhub/snapshot";
import { mediaTimeFromSeconds, TICKS_PER_SECOND } from "../src/wasm";

const state = vi.hoisted(() => ({ editor: null as any }));
vi.mock("@/core", () => ({ EditorCore: { getInstance: () => state.editor } }));
const time = (seconds: number) => mediaTimeFromSeconds({ seconds });
function fixture() {
  const video = (id: string, start: number) => ({
    id,
    name: id,
    type: "video",
    mediaId: "asset",
    duration: time(8),
    startTime: time(start),
    trimStart: time(2),
    trimEnd: time(2),
    sourceDuration: time(12),
    params: {},
  });
  let tracks: any = {
    main: {
      id: "main",
      type: "video",
      name: "Main",
      hidden: false,
      muted: false,
      elements: [video("a", 0), video("b", 8)],
    },
    overlay: [
      {
        id: "text-track",
        type: "text",
        name: "Text",
        hidden: false,
        elements: [
          {
            id: "text",
            name: "Text",
            type: "text",
            duration: time(8),
            startTime: time(0),
            trimStart: time(0),
            trimEnd: time(0),
            params: { content: "Original" },
          },
        ],
      },
    ],
    audio: [],
  };
  let project: any = {
    metadata: {
      id: "project",
      name: "Original",
      createdAt: new Date(),
      updatedAt: new Date(),
      videoSpaceRevision: 1,
    },
    settings: { canvasSize: { width: 1920, height: 1080 } },
    currentSceneId: "scene",
    scenes: [],
  };
  const editor: any = {
    scenes: {
      getActiveScene: () => ({ id: "scene", tracks }),
      getActiveSceneOrNull: () => ({ id: "scene", tracks }),
    },
    timeline: {
      updateTracks: (value: any) => {
        tracks = value;
      },
    },
    project: {
      getActive: () => project,
      setActiveProject: ({ project: value }: any) => {
        project = value;
      },
    },
    selection: {
      getSnapshot: () => ({}),
      applySelectionPatch: (patch: any) => patch,
      restoreSnapshot: vi.fn(),
    },
    save: { markDirty: vi.fn() },
  };
  editor.command = new CommandManager(editor);
  state.editor = editor;
  return { editor, tracks: () => tracks, project: () => project };
}
const plan = (actions: EditAction[]) => ({
  summary: "Edit",
  actions,
  base_revision: 1,
});
beforeEach(() => {
  state.editor = null;
});

describe("native assistant edit plans", () => {
  it("validates clarification without executing it or partially changing layers", () => {
    const f = fixture();
    const before = structuredClone(f.tracks());
    const question = {
      ...plan([]),
      questions: ["Which clip should be shortened?"],
    };
    expect(() =>
      validateEditPlan(question, f.tracks(), TICKS_PER_SECOND),
    ).not.toThrow();
    expect(() => applyEditPlan({ editor: f.editor, plan: question })).toThrow(
      "VIDEO_EDIT_PLAN_INVALID",
    );
    for (const questions of [
      [" "],
      ["x".repeat(501)],
      ["a", "b", "c", "d"],
      [42],
    ]) {
      expect(() =>
        validateEditPlan(
          { ...plan([]), questions },
          f.tracks(),
          TICKS_PER_SECOND,
        ),
      ).toThrow();
    }
    expect(() =>
      validateEditPlan(
        {
          ...plan([{ kind: "rename_project", text: "Guess" }]),
          questions: ["Which name?"],
        },
        f.tracks(),
        TICKS_PER_SECOND,
      ),
    ).toThrow();
    expect(f.tracks()).toEqual(before);
    expect(f.editor.command.canUndo()).toBe(false);
  });
  it("accepts structured choices and rejects unknown fields, duplicate or multiple recommendations", () => {
    const f = fixture();
    const question = {
      question: "Which layout?",
      options: [
        { label: "Portrait", recommended: true },
        { label: "Landscape" },
      ],
    };
    expect(() =>
      validateEditPlan(
        { ...plan([]), questions: [question] },
        f.tracks(),
        TICKS_PER_SECOND,
      ),
    ).not.toThrow();
    for (const bad of [
      { ...question, options: [{ label: "Only" }] },
      { ...question, options: [{ label: "Same" }, { label: " same " }] },
      {
        ...question,
        options: [
          { label: "A", recommended: true },
          { label: "B", recommended: true },
        ],
      },
      {
        ...question,
        options: [{ label: "A", recommended: "yes" }, { label: "B" }],
      },
      { ...question, url: "https://example.com" },
    ]) {
      expect(() =>
        validateEditPlan(
          { ...plan([]), questions: [bad] },
          f.tracks(),
          TICKS_PER_SECOND,
        ),
      ).toThrow();
    }
  });
  it("clears a caption with an empty string and keeps an explanatory empty plan harmless", () => {
    const f = fixture();
    applyEditPlan({
      editor: f.editor,
      plan: plan([{ kind: "set_text", element_id: "text", text: "" }]),
    });
    expect(f.tracks().overlay[0].elements[0].params.content).toBe("");
    f.editor.command.undo();
    expect(f.tracks().overlay[0].elements[0].params.content).toBe("Original");
    applyEditPlan({ editor: f.editor, plan: plan([]) });
    expect(f.editor.command.canUndo()).toBe(false);
  });
  it("applies a multi-action plan with native commands and restores everything in one Undo/Redo", () => {
    const f = fixture();
    const before = structuredClone(f.tracks());
    applyEditPlan({
      editor: f.editor,
      plan: plan([
        { kind: "rename_project", text: "Launch" },
        { kind: "set_aspect_ratio", aspect_ratio: "9:16" },
        { kind: "set_text", element_id: "text", text: "New title" },
        { kind: "set_volume", element_id: "a", volume: 0.5 },
        { kind: "set_speed", element_id: "a", speed: 2 },
      ]),
    });
    expect(f.project().metadata.name).toBe("Launch");
    expect(f.project().settings.canvasSize.width).toBe(1080);
    expect(f.tracks().main.elements[0].duration).toBe(time(4));
    expect(f.tracks().main.elements[0].params.volume).toBeCloseTo(-6.0206);
    expect(f.tracks().overlay[0].elements[0].params.content).toBe("New title");
    f.editor.command.undo();
    expect(f.tracks()).toEqual(before);
    expect(f.project().metadata.name).toBe("Original");
    expect(f.project().settings.canvasSize.width).toBe(1920);
    expect(f.editor.command.canUndo()).toBe(false);
    f.editor.command.redo();
    expect(f.tracks().main.elements[0].duration).toBe(time(4));
    expect(f.project().metadata.name).toBe("Launch");
  });
  it("trims relative to the current visible clip and respects source speed and bounds", () => {
    const f = fixture();
    f.tracks().main.elements[0] = {
      ...f.tracks().main.elements[0],
      retime: { rate: 2 },
      duration: time(4),
    };
    const before = structuredClone(f.tracks());
    applyEditPlan({
      editor: f.editor,
      plan: plan([
        {
          kind: "trim_clip",
          element_id: "a",
          start_seconds: 1,
          duration_seconds: 2,
        },
      ]),
    });
    expect(f.tracks().main.elements[0]).toMatchObject({
      trimStart: time(4),
      trimEnd: time(4),
      duration: time(2),
    });
    f.editor.command.undo();
    expect(f.tracks()).toEqual(before);
    expect(() =>
      applyEditPlan({
        editor: f.editor,
        plan: plan([
          {
            kind: "trim_clip",
            element_id: "a",
            start_seconds: 3,
            duration_seconds: 2,
          },
        ]),
      }),
    ).toThrow("VIDEO_EDIT_PLAN_INVALID");
  });
  it("inserts text through native placement and restores the original tracks with Undo", () => {
    const f = fixture();
    const before = structuredClone(f.tracks());
    applyEditPlan({
      editor: f.editor,
      plan: plan([
        {
          kind: "add_text",
          text: "New overlay",
          start_seconds: 1,
          duration_seconds: 3,
        },
      ]),
    });
    const texts = f.tracks().overlay.flatMap((track: any) => track.elements);
    expect(texts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          startTime: time(1),
          duration: time(3),
          params: expect.objectContaining({ content: "New overlay" }),
        }),
      ]),
    );
    const inserted = texts.find(
      (item: any) => item.params.content === "New overlay",
    );
    const renderedFontPixels =
      (inserted.params.fontSize * f.project().settings.canvasSize.height) / 90;
    expect(
      renderedFontPixels * "New overlay".length * 0.65,
    ).toBeLessThanOrEqual(f.project().settings.canvasSize.width * 0.84);
    f.editor.command.undo();
    expect(f.tracks()).toEqual(before);
  });
  it("sets only registered adjacent incoming transitions and clamps native duration", () => {
    const f = fixture();
    const before = structuredClone(f.tracks());
    applyEditPlan({
      editor: f.editor,
      plan: plan([
        {
          kind: "set_transition",
          element_id: "b",
          transition_id: "dissolve",
          duration_seconds: 6,
        },
      ]),
    });
    expect(f.tracks().main.elements[1].params).toEqual({
      "bh.transition": "dissolve",
      "bh.transition.duration": time(4),
    });
    expect(f.tracks().main.elements[1].duration).toBe(time(8));
    f.editor.command.undo();
    expect(f.tracks()).toEqual(before);
  });
  it("rejects the entire plan before mutation for invalid, foreign, duplicate or conflicting actions", () => {
    const f = fixture();
    const before = structuredClone(f.tracks());
    const invalid: unknown[] = [
      { kind: "set_text", element_id: "foreign", text: "No" },
      { kind: "set_text", element_id: "a", text: "No" },
      { kind: "set_volume", element_id: "text", volume: 1 },
      { kind: "set_volume", element_id: "a", volume: NaN },
      { kind: "set_volume", element_id: "a", volume: 2.1 },
      { kind: "set_speed", element_id: "a", speed: 0.1 },
      { kind: "set_transition", element_id: "b", transition_id: "invented" },
      { kind: "set_transition", element_id: "a", transition_id: "spin" },
      { kind: "add_text", text: "x".repeat(501) },
      { kind: "add_text", text: "No", start_seconds: -1 },
      { kind: "rename_project", text: "x".repeat(201) },
      { kind: "set_aspect_ratio", aspect_ratio: "4:3" },
      { kind: "add_text", text: "No", url: "https://foreign.test" },
      { kind: "execute", code: "alert(1)" },
    ];
    const conflicting = [
      [
        { kind: "rename_project", text: "One" },
        { kind: "rename_project", text: "Two" },
      ],
      [
        { kind: "trim_clip", element_id: "a", duration_seconds: 2 },
        { kind: "set_speed", element_id: "a", speed: 2 },
      ],
      [
        { kind: "set_speed", element_id: "a", speed: 2 },
        { kind: "set_transition", element_id: "b", transition_id: "spin" },
      ],
    ];
    for (const actions of [
      ...invalid.map((action) => [
        { kind: "rename_project", text: "Must not apply" },
        action,
      ]),
      ...conflicting,
    ]) {
      expect(() =>
        applyEditPlan({
          editor: f.editor,
          plan: { summary: "Bad", base_revision: 1, actions },
        }),
      ).toThrow("VIDEO_EDIT_PLAN_INVALID");
      expect(f.tracks()).toEqual(before);
      expect(f.project().metadata.name).toBe("Original");
      expect(f.editor.command.canUndo()).toBe(false);
    }
    expect(() =>
      validateEditPlan(
        plan(
          Array.from({ length: 11 }, () => ({ kind: "add_text", text: "x" })),
        ),
        f.tracks(),
        TICKS_PER_SECOND,
      ),
    ).toThrow();
  });
  it("includes project identity in the editing basis while ignoring server revision and timestamps", () => {
    const f = fixture();
    const p = {
      ...f.project(),
      scenes: [
        {
          id: "scene",
          tracks: f.tracks(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const basis = editingBasis(p);
    expect(
      editingBasis({
        ...p,
        metadata: {
          ...p.metadata,
          videoSpaceRevision: 2,
          updatedAt: new Date(0),
        },
      }),
    ).toBe(basis);
    expect(
      editingBasis({ ...p, metadata: { ...p.metadata, id: "other" } }),
    ).not.toBe(basis);
  });
});
