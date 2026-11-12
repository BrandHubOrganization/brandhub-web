import { ACTIONS } from "./definitions";
import type { TActionWithArgs, TActionWithOptionalArgs } from "./types";

export * from "./definitions";
export * from "./types";
export * from "./registry";

const REQUIRED_ARGUMENT_ACTIONS = {
	"remove-media-asset": true,
	"remove-media-assets": true,
} satisfies Record<Exclude<TActionWithArgs, TActionWithOptionalArgs>, true>;

export function isActionWithOptionalArgs(
	value: string,
): value is TActionWithOptionalArgs {
	return (
		Object.hasOwn(ACTIONS, value) &&
		!Object.hasOwn(REQUIRED_ARGUMENT_ACTIONS, value)
	);
}
