/**
 * Builds the export config from the builder state. This is the source-of-truth
 * file the Designsystemet CLI consumes to generate tokens + CSS.
 *
 * Colour entry shapes:
 *  - "#hex"                         → semantic-scale with no overrides (shorthand)
 *  - { value, type:"semantic-scale", output? }
 *      `output` holds only the steps the user changed (a hex override OR a
 *      saturation tweak, baked to a final hex). A step value is a string when it
 *      is the same in both modes, else { light, dark }. Steps not listed are
 *      generated from `value` (+ the theme's lightness curve).
 *  - { value, type:"lightness-scale", output }   → a custom hue across a ramp
 *      `output` maps step name → relative luminance.
 *  - { type:"custom-scale", output }             → freely defined colours
 *      `output` maps step name → final hex (used when a custom colour also has
 *      per-step saturation, so it can't be regenerated from a single value).
 */
import type { ColorMode } from "@/themebuilder/color/types";
import { STEP_DEFS } from "@/themebuilder/color/types";
import { CONTRAST_STEP_NAMES } from "@/themebuilder/color/scale";
import { deriveCustomColor, deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import { resolveFontSize } from "./typography";
import {
  SEVERITY_DEFAULTS,
  SEVERITY_NAMES,
  type BuilderConfig,
  type ColorScaleConfig,
  type CustomColor,
  type CustomGroup,
  type ThemeConfig,
} from "./config";

const SCHEMA = "packages/cli/dist/config.schema.json";

type StepOverride = string | { light: string; dark: string };

function slug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tema"
  );
}

/** A semantic scale: base value + only the steps the user overrode. */
function semanticEntry(
  theme: ThemeConfig,
  scale: ColorScaleConfig,
): string | object {
  const light = deriveScale(scale, "light", resolveLuminances(theme, "light"));
  const dark = deriveScale(scale, "dark", resolveLuminances(theme, "dark"));
  const lightHex = new Map(light.steps.map((s) => [s.name, s.hex]));
  const darkHex = new Map(dark.steps.map((s) => [s.name, s.hex]));

  const output: Record<string, StepOverride> = {};
  for (const def of STEP_DEFS) {
    const changed =
      scale.overrides?.light?.[def.name] !== undefined ||
      scale.overrides?.dark?.[def.name] !== undefined ||
      (scale.chroma?.light?.[def.name] ?? 1) !== 1 ||
      (scale.chroma?.dark?.[def.name] ?? 1) !== 1;
    if (!changed) continue;
    const l = lightHex.get(def.name)!;
    const d = darkHex.get(def.name)!;
    output[def.name] =
      l.toLowerCase() === d.toLowerCase() ? l : { light: l, dark: d };
  }

  if (Object.keys(output).length === 0) return scale.hex;
  return { value: scale.hex, type: "semantic-scale", output };
}

/** A custom-group colour: a lightness ramp, or baked hexes if it has saturation. */
function customEntry(group: CustomGroup, color: CustomColor): object {
  const hasChroma = color.chroma?.some((c) => c !== 1) ?? false;
  if (hasChroma) {
    const steps = deriveCustomColor(group.lightness, color);
    const output: Record<string, string> = {};
    steps.forEach((s, i) => {
      output[String(i + 1)] = s.hex;
    });
    return { type: "custom-scale", output };
  }
  const output: Record<string, number> = {};
  group.lightness.forEach((lum, i) => {
    output[String(i + 1)] = lum;
  });
  return { value: color.hex, type: "lightness-scale", output };
}

function lightnessForMode(
  theme: ThemeConfig,
  mode: ColorMode,
): Record<string, number> | null {
  const arr = theme.lightness?.[mode];
  if (!arr) return null;
  const obj: Record<string, number> = {};
  CONTRAST_STEP_NAMES.forEach((name, i) => {
    obj[name] = arr[i];
  });
  return obj;
}

function themeEntry(theme: ThemeConfig): object {
  const colors: Record<string, unknown> = {};

  for (const scale of theme.colors) {
    colors[scale.name] = semanticEntry(theme, scale);
  }
  for (const name of SEVERITY_NAMES) {
    colors[name] = theme.severity?.[name] ?? SEVERITY_DEFAULTS[name];
  }
  for (const group of theme.customGroups) {
    for (const color of group.colors) {
      colors[`${group.name}-${color.name}`] = customEntry(group, color);
    }
  }

  const entry: Record<string, unknown> = { colors };

  // The global lightness curve is only emitted when the user customised it.
  const light = lightnessForMode(theme, "light");
  const dark = lightnessForMode(theme, "dark");
  if (light || dark) {
    entry.lightnessCurve = {
      ...(light ? { light } : {}),
      ...(dark ? { dark } : {}),
    };
  }

  entry.borderRadius = theme.borderRadius;

  entry.size = sizeEntry(theme.sizing);

  if (theme.typography) {
    entry.typography = typographyEntry(theme.typography, theme.sizing);
  }
  return entry;
}

/** The sizing system: base/step + per-mode font-size; tokens generate from these. */
function sizeEntry(sizing: ThemeConfig["sizing"]): object {
  const modes: Record<string, { fontSize: number }> = {};
  for (const m of sizing.modes) modes[m.name] = { fontSize: m.fontSize };
  return {
    base: sizing.base,
    step: sizing.step,
    activeMode: sizing.activeMode,
    modes,
  };
}

function typographyEntry(
  typo: ThemeConfig["typography"],
  sizing: ThemeConfig["sizing"],
): object {
  const fonts: Record<string, unknown> = {};
  for (const font of typo.fonts) {
    const fontWeight: Record<string, string> = {};
    for (const w of font.weights) fontWeight[w.name] = w.value;
    // Sizes are generated from the modular scale (overrides baked in).
    const size: Record<string, Record<string, number>> = {};
    for (const m of sizing.modes) {
      size[m.name] = {};
      for (const step of typo.steps) {
        size[m.name][step] = resolveFontSize(
          typo.steps,
          font,
          m.name,
          m.fontSize,
          step,
        );
      }
    }
    fonts[font.name] = {
      fontFamily: font.fontFamily,
      fontWeight,
      scale: { anchor: font.scale.anchorStep, ratio: font.scale.ratio },
      size,
    };
  }

  const components: Record<string, unknown> = {};
  for (const comp of typo.components) {
    const font = typo.fonts.find((f) => f.id === comp.fontId);
    components[comp.name] = {
      font: font?.name ?? comp.fontId,
      size: comp.step,
      weight: comp.weight,
      ...(comp.mode ? { mode: comp.mode } : {}),
    };
  }

  return { fonts, components };
}

export function buildConfig(config: BuilderConfig): object {
  const themes: Record<string, unknown> = {};
  for (const theme of config.themes) {
    themes[slug(theme.name)] = themeEntry(theme);
  }
  return { $schema: SCHEMA, outDir: "design-tokens", clean: true, themes };
}

export function buildConfigJson(config: BuilderConfig): string {
  return JSON.stringify(buildConfig(config), null, 2);
}
