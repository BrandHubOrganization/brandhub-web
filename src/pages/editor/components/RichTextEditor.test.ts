import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Editor } from "@tiptap/core";
import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  effects: [] as (() => void)[],
  editor: null as unknown,
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useEffect: (effect: () => void) => {
    harness.effects.push(effect);
  },
}));
vi.mock("@tiptap/react", () => ({
  useEditor: () => harness.editor,
  EditorContent: () => null,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
import { RichTextEditor } from "@/pages/editor/components/RichTextEditor";

beforeEach(() => {
  harness.effects = [];
});

it("ignores an editor destroyed before external-value effects reconnect", () => {
  const editor = {
    isDestroyed: false,
    schema: null,
    state: { doc: {} },
    isActive: () => false,
    getText: Editor.prototype.getText,
    commands: { setContent: vi.fn() },
  };
  harness.editor = editor;
  renderToStaticMarkup(
    createElement(RichTextEditor, { value: "AI caption", onChange: vi.fn() }),
  );
  editor.isDestroyed = true;
  expect(() => harness.effects.forEach((effect) => effect())).not.toThrow();
  expect(editor.commands.setContent).not.toHaveBeenCalled();
});

it("syncs external captions into a live editor without emitting user updates", () => {
  const setContent = vi.fn();
  harness.editor = {
    isDestroyed: false,
    isActive: () => false,
    getText: () => "Old caption",
    commands: { setContent },
  };
  renderToStaticMarkup(
    createElement(RichTextEditor, { value: "AI caption", onChange: vi.fn() }),
  );
  harness.effects.forEach((effect) => effect());
  expect(setContent).toHaveBeenCalledWith("AI caption", { emitUpdate: false });
});
