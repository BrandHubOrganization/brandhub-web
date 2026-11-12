import type { EffectDefinition } from "@/effects/types";
import {
  blurEffectDefinition,
  buildGaussianBlurPasses,
  intensityToSigma,
} from "./blur";
import { colorDefinition } from "./color";
function directionalBlur(
  type: string,
  name: string,
  horizontal: boolean,
): EffectDefinition {
  return {
    ...blurEffectDefinition,
    type,
    name,
    keywords: [name, "blur", "directional"],
    params: blurEffectDefinition.params.map((param) =>
      param.type === "number" ? { ...param, default: 40 } : param,
    ),
    renderer: {
      passes: [],
      buildPasses: ({ effectParams, width, height }) => {
        const intensity = Number(effectParams.intensity ?? 40);
        return buildGaussianBlurPasses({
          sigmaX: horizontal
            ? intensityToSigma({
                intensity,
                resolution: width,
                reference: 1920,
              })
            : 0,
          sigmaY: horizontal
            ? 0
            : intensityToSigma({
                intensity,
                resolution: height,
                reference: 1080,
              }),
        }).filter((pass) => Number(pass.uniforms.u_sigma) > 0);
      },
    },
  };
}
export const effectPresets: EffectDefinition[] = [
  directionalBlur("blur-horizontal", "Horizontal blur", true),
  directionalBlur("blur-vertical", "Vertical blur", false),
  colorDefinition({
    type: "effect-brighten",
    name: "Brighten",
    category: "adjustment",
    defaults: { brightness: 120 },
  }),
  colorDefinition({
    type: "effect-contrast",
    name: "High contrast",
    category: "adjustment",
    defaults: { contrast: 140, saturation: 110 },
  }),
  colorDefinition({
    type: "effect-faded",
    name: "Faded",
    category: "adjustment",
    defaults: { brightness: 110, contrast: 75, saturation: 70 },
  }),
];
