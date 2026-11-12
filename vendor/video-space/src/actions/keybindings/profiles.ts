import { getDefaultShortcuts } from "../definitions";
import type { ShortcutKey } from "../keybinding";
import type { TActionWithOptionalArgs } from "../types";

export const SHORTCUT_PROFILES = {
	"capcut-windows": "CapCut Windows",
	opencut: "OpenCut",
} as const;

export type ShortcutProfile = keyof typeof SHORTCUT_PROFILES;

export function isShortcutProfile(value: unknown): value is ShortcutProfile {
	return value === "capcut-windows" || value === "opencut";
}

export function getProfileShortcuts({ profile }: { profile: ShortcutProfile }) {
	if (profile === "opencut") {
		const shortcuts = getDefaultShortcuts();
		shortcuts.set("ctrl+b", "split");
		return shortcuts;
	}
	return new Map<ShortcutKey, TActionWithOptionalArgs>([
		["space", "toggle-play"],
		["left", "frame-step-backward"],
		["right", "frame-step-forward"],
		["up", "previous-cut"],
		["down", "next-cut"],
		["home", "goto-start"],
		["end", "goto-end"],
		["a", "selection-tool"],
		["b", "razor-tool"],
		["ctrl+b", "split"],
		["ctrl+shift+b", "split-all"],
		["q", "split-left"],
		["w", "split-right"],
		["ctrl+c", "copy-selected"],
		["ctrl+v", "paste-copied"],
		["ctrl+x", "cut-selected"],
		["delete", "delete-selected"],
		["backspace", "delete-selected"],
		["ctrl+z", "undo"],
		["ctrl+shift+z", "redo"],
		["ctrl+a", "select-all"],
		["escape", "cancel-interaction"],
		["n", "toggle-snapping"],
		["p", "toggle-main-track-magnet"],
		["v", "toggle-elements-enabled-selected"],
		["m", "toggle-bookmark"],
		["ctrl+s", "save-project"],
		["ctrl+e", "export-project"],
		["ctrl+i", "import-media"],
		["ctrl+=", "zoom-timeline-in"],
		["ctrl+shift+=", "zoom-timeline-in"],
		["ctrl+-", "zoom-timeline-out"],
	]);
}
