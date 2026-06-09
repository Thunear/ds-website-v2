import chroma from "chroma-js";
import {
  STEP_DEFS,
  type ColorMode,
  type ColorScale,
  type ColorStep,
  type ColorStepName,
  type ScaleVariant,
} from "./types";
import {
  contrastRatio,
  luminanceForRatio,
  relativeLuminance,
  setLuminance,
} from "./contrast";
import { lightnessFromHex, luminanceFromLightness } from "./hsluv";

/** The 11 non-base steps that are positioned purely by relative luminance. */
export type ContrastStepName = Exclude<
  ColorStepName,
  | "base-default"
  | "base-hover"
  | "base-active"
  | "base-contrast-subtle"
  | "base-contrast-default"
>;

/**
 * Target WCAG relative luminance for each of the 11 "contrast steps", per mode.
 *
 * These are the heart of the system: every scale uses the same target per step,
 * so a given step has identical luminance across all scales and the contrast
 * between any two steps is constant theme-wide. Values taken from Designsystemet:
 * packages/cli/src/colors/colorMetadata.ts (the `luminance` field).
 */
export const STEP_LUMINANCE: Record<
  ColorMode,
  Record<ContrastStepName, number>
> = {
  light: {
    "background-default": 1,
    "background-tinted": 0.9,
    "surface-default": 1,
    "surface-tinted": 0.81,
    "surface-hover": 0.7,
    "surface-active": 0.59,
    "border-subtle": 0.5,
    "border-default": 0.19,
    "border-strong": 0.11,
    "text-subtle": 0.11,
    "text-default": 0.0245,
  },
  dark: {
    "background-default": 0.009,
    "background-tinted": 0.014,
    "surface-default": 0.021,
    "surface-tinted": 0.027,
    "surface-hover": 0.036,
    "surface-active": 0.056,
    "border-subtle": 0.08,
    "border-default": 0.22,
    "border-strong": 0.39,
    "text-subtle": 0.39,
    "text-default": 0.84,
  },
};

/** OKLCH chroma multiplier applied to the dark-mode reference colour. */
const DARK_CHROMA_MODIFIER = 0.7;

/** Minimum contrast base-contrast-subtle must keep against base-default. */
const SUBTLE_MIN_RATIO = 4.5;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A colour that keeps base-default's hue but sits at >= 4.5:1 against it, so
 * subtle text/elements on a base-default background stay readable while still
 * carrying some of the brand colour. We aim for the 4.5:1 boundary (which
 * retains the most colour) and nudge toward the extreme only if rounding leaves
 * us just short.
 */
function subtleContrastColor(
  baseHex: string,
  side: "lighter" | "darker",
): string {
  const baseLum = relativeLuminance(baseHex);
  let target = clamp01(luminanceForRatio(baseLum, SUBTLE_MIN_RATIO, side));
  const extreme = side === "lighter" ? 1 : 0;
  let hex = chroma(baseHex).luminance(target).hex();
  for (let i = 0; i < 50 && contrastRatio(hex, baseHex) < SUBTLE_MIN_RATIO; i++) {
    target = clamp01(target + (extreme - target) * 0.05);
    hex = chroma(baseHex).luminance(target).hex();
  }
  return hex;
}

/**
 * The reference colour the 11 contrast steps are generated from. In dark mode
 * its OKLCH chroma is reduced (−30%) so the dark scale reads less saturated,
 * matching Designsystemet. The base group keeps the user's full-chroma colour.
 */
export function interpolationColor(baseHex: string, mode: ColorMode): string {
  if (mode !== "dark") return baseHex;
  const [l, c, h] = chroma(baseHex).oklch();
  return chroma
    .oklch(l, c * DARK_CHROMA_MODIFIER, Number.isNaN(h) ? 0 : h)
    .hex();
}

/** A full set of target luminances for the 11 contrast steps. */
export type LuminanceMap = Record<ContrastStepName, number>;

/** Contrast step names in grid order (the x-axis of the lightness curve). */
export const CONTRAST_STEP_NAMES = Object.keys(
  STEP_LUMINANCE.light,
) as ContrastStepName[];

/** The default luminance targets for a mode (Designsystemet values). */
export function defaultLuminances(mode: ColorMode): LuminanceMap {
  return { ...STEP_LUMINANCE[mode] };
}

/** Ordered luminance values (config storage form) → keyed map. */
export function luminanceArrayToMap(values: number[]): LuminanceMap {
  const map = {} as LuminanceMap;
  CONTRAST_STEP_NAMES.forEach((name, i) => {
    map[name] = values[i];
  });
  return map;
}

/** Default luminances for a mode as an ordered array. */
export function defaultLuminanceArray(mode: ColorMode): number[] {
  return CONTRAST_STEP_NAMES.map((n) => STEP_LUMINANCE[mode][n]);
}

/**
 * Generate the full 16-step scale for a chosen colour in a given mode.
 * Pass `luminances` to override the per-step targets (e.g. a custom curve).
 */
export function generateColorScale(
  name: string,
  baseHex: string,
  mode: ColorMode = "light",
  luminances: LuminanceMap = STEP_LUMINANCE[mode],
  variant: ScaleVariant = "normal",
): ColorScale {
  const colourRef = interpolationColor(baseHex, mode);
  // base-only paints the 11 contrast steps neutral grey; the base steps stay
  // coloured. Other variants colour the contrast steps from the source colour.
  const contrastRef =
    variant === "base-only" ? chroma(colourRef).set("hsl.s", 0).hex() : colourRef;

  const stepByName = (n: ColorStepName) => STEP_DEFS.find((s) => s.name === n)!;

  // Inverted: anchor backgrounds to the source colour's own luminance and mirror
  // the canonical (light) luminance shape into [L0, 1]. This keeps backgrounds +
  // surfaces clustered near the colour (as the normal scale clusters them near
  // white) and ramps borders/text up to white — preserving contrast
  // relationships close to the normal scale instead of a flat linear ramp.
  const baseLuminance = relativeLuminance(colourRef);
  const shapeMax = STEP_LUMINANCE.light["background-default"]; // 1
  const shapeMin = STEP_LUMINANCE.light["text-default"]; // ~0.0245
  // Inverted keeps the surfaces close to surface-default (= the colour): their
  // upward step toward white is compressed so the surface group stays cohesive.
  const SURFACE_COMPRESS = 0.4;
  const targetFor = (n: ContrastStepName) => {
    if (variant !== "inverted") return luminances[n];
    let frac = (shapeMax - STEP_LUMINANCE.light[n]) / (shapeMax - shapeMin);
    if (n.startsWith("surface-")) frac *= SURFACE_COMPRESS;
    return baseLuminance + (1 - baseLuminance) * frac;
  };

  const contrastSteps = CONTRAST_STEP_NAMES.map((n) => {
    const def = stepByName(n);
    const hex = setLuminance(contrastRef, targetFor(n));
    return { ...def, hex, luminance: relativeLuminance(hex) };
  });

  const baseSteps =
    variant === "inverted"
      ? generateInvertedBaseSteps(baseHex)
      : generateBaseSteps(baseHex, mode);

  return {
    name,
    baseHex,
    mode,
    steps: [...contrastSteps, ...baseSteps],
  };
}

/**
 * The 5 base steps, following Designsystemet's generator: positioned in HSLuv
 * lightness so hover/active are perceptually even. In non-light modes the
 * lightness is inverted so a dark brand colour becomes a light base.
 */
function generateBaseSteps(baseHex: string, mode: ColorMode): ColorStep[] {
  let colorLightness = lightnessFromHex(baseHex);
  if (mode !== "light") {
    colorLightness = colorLightness <= 30 ? 70 : 100 - colorLightness;
  }

  // Direction + size of the hover/active lightness shift.
  const modifier =
    colorLightness <= 30 || (colorLightness >= 49 && colorLightness <= 65)
      ? -8
      : 8;
  const atLightness = (l: number) =>
    chroma(baseHex).luminance(luminanceFromLightness(l)).hex();

  const baseDefault =
    mode === "light" ? chroma(baseHex).hex() : atLightness(colorLightness);
  const baseHover = atLightness(colorLightness - modifier);
  const baseActive = atLightness(colorLightness - modifier * 2);

  // Contrast colours read against the actual base-default. Subtle keeps the
  // base hue at >= 4.5:1; default is the pure black/white that reads best.
  const preferWhite =
    contrastRatio(baseDefault, "#ffffff") >=
    contrastRatio(baseDefault, "#000000");
  const contrastDefault = preferWhite ? "#ffffff" : "#000000";
  const contrastSubtle = subtleContrastColor(
    baseDefault,
    preferWhite ? "lighter" : "darker",
  );

  const mk = (name: ColorStepName, hex: string): ColorStep => {
    const def = STEP_DEFS.find((s) => s.name === name)!;
    return { ...def, hex, luminance: relativeLuminance(hex) };
  };

  return [
    mk("base-default", baseDefault),
    mk("base-hover", baseHover),
    mk("base-active", baseActive),
    mk("base-contrast-subtle", contrastSubtle),
    mk("base-contrast-default", contrastDefault),
  ];
}

/**
 * Base steps for an inverted scale: the base swaps to the contrasting colour
 * (white for dark sources), with the source colour carried into the contrast
 * steps — i.e. a white fill on the coloured surface, with the colour as its text.
 */
function generateInvertedBaseSteps(baseHex: string): ColorStep[] {
  const preferWhite =
    contrastRatio(baseHex, "#ffffff") >= contrastRatio(baseHex, "#000000");
  const baseDefault = preferWhite ? "#ffffff" : "#000000";

  const baseHover = chroma.mix(baseDefault, baseHex, 0.1, "rgb").hex();
  const baseActive = chroma.mix(baseDefault, baseHex, 0.2, "rgb").hex();
  // Text/elements on the white base: full colour, plus a readable subtle tint.
  const contrastDefault = baseHex;
  const contrastSubtle = subtleContrastColor(baseHex, "darker");

  const mk = (name: ColorStepName, hex: string): ColorStep => {
    const def = STEP_DEFS.find((s) => s.name === name)!;
    return { ...def, hex, luminance: relativeLuminance(hex) };
  };

  return [
    mk("base-default", baseDefault),
    mk("base-hover", baseHover),
    mk("base-active", baseActive),
    mk("base-contrast-subtle", contrastSubtle),
    mk("base-contrast-default", contrastDefault),
  ];
}

/** Validate a scale name: lowercase a–z, 0–9 and hyphens. */
export function isValidScaleName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

export { contrastRatio, relativeLuminance };
