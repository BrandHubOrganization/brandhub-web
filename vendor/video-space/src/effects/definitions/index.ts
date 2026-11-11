import { effectsRegistry } from "../registry";
import { blurEffectDefinition } from "./blur";
import { colorEffectDefinitions } from "./color";

import { effectPresets } from "./presets";

const defaultEffects = [
	blurEffectDefinition,
	...colorEffectDefinitions,
	...effectPresets,
];

export function registerDefaultEffects(): void {
	for (const definition of defaultEffects) {
		if (effectsRegistry.has(definition.type)) {
			continue;
		}
		effectsRegistry.register({
			key: definition.type,
			definition,
		});
	}
}
