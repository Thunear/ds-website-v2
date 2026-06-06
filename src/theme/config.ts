/**
 * The theme config model. This mirrors the config file that is the source of
 * truth for the whole pipeline (themebuilder → code → Figma). The themebuilder
 * only ever reads/writes this shape; everything else (the colour grid, etc.) is
 * derived from it.
 */
import type { ColorMode, ColorStepName } from "@/color/types";

/**
 * A semantic scale (the main grid): the user picks a source colour and the 16
 * named steps are generated, following the theme's global lightness curve.
 */
export interface ColorScaleConfig {
  /** Stable id, independent of the (renameable) name. */
  id: string;
  name: string;
  /** The source colour the user picked; the 16 steps are generated from it. */
  hex: string;
  /** Manual per-step hex overrides (per mode) that win over generated values. */
  overrides?: Partial<Record<ColorMode, Partial<Record<ColorStepName, string>>>>;
  /** Per-step chroma multiplier (per mode), default 1; preserves luminance. */
  chroma?: Partial<Record<ColorMode, Partial<Record<ColorStepName, number>>>>;
}

/** Alias for readability where a value is specifically a semantic scale. */
export type SemanticScaleConfig = ColorScaleConfig;

/**
 * One colour inside a custom group: a base hue rendered across the group's
 * shared lightness ramp, optionally with a per-step saturation multiplier.
 */
export interface CustomColor {
  id: string;
  name: string;
  hex: string;
  /** Per-step chroma multiplier (length = group steps); absent = all 1. */
  chroma?: number[];
}

/**
 * A custom colour group: a free ramp for charts/graphics. The group owns the
 * step count and the lightness of every step; each colour in it is drawn across
 * that shared ramp. Not bound by the semantic contrast curve.
 */
export interface CustomGroup {
  id: string;
  name: string;
  /** Shared target relative luminance (0–1) per step; length = step count. */
  lightness: number[];
  colors: CustomColor[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  /** Semantic scales shown in the main grid. */
  colors: ColorScaleConfig[];
  /** Custom colour groups (charts/graphics). */
  customGroups: CustomGroup[];
  /**
   * Per-mode lightness curve for the semantic scales (the 11 contrast steps in
   * grid order). Absent = the Designsystemet defaults.
   */
  lightness?: Partial<Record<ColorMode, number[]>>;
  /** Room for the other tabs — populated later. */
  borderRadius: number;
}

export interface BuilderConfig {
  activeThemeId: string;
  mode: ColorMode;
  appTheme: ColorMode;
  themes: ThemeConfig[];
}

let idCounter = 0;
export function makeId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createScale(name: string, hex: string): ColorScaleConfig {
  return { id: makeId("scale"), name, hex };
}

/** Evenly spaced luminance ramp (lightest → darkest) for a new custom group. */
export function defaultCustomLightness(steps: number): number[] {
  const top = 0.95;
  const bottom = 0.08;
  if (steps <= 1) return [top];
  return Array.from({ length: steps }, (_, i) =>
    Number((top - (i / (steps - 1)) * (top - bottom)).toFixed(3)),
  );
}

export function createCustomColor(name: string, hex: string): CustomColor {
  return { id: makeId("color"), name, hex };
}

export function createCustomGroup(
  name: string,
  hex: string,
  steps = 9,
): CustomGroup {
  return {
    id: makeId("group"),
    name,
    lightness: defaultCustomLightness(steps),
    colors: [createCustomColor("farge-1", hex)],
  };
}

export function createTheme(name: string): ThemeConfig {
  return {
    id: makeId("theme"),
    name,
    colors: [
      createScale("accent", "#0062BA"),
      createScale("neutral", "#24272B"),
      createScale("brand1", "#0D7A5F"),
      createScale("brand2", "#5B3FA0"),
    ],
    customGroups: [],
    borderRadius: 4,
  };
}

export function defaultBuilderConfig(): BuilderConfig {
  const first = createTheme("Mitt flotte tema");
  const second = createTheme("Mitt andre tema");
  return {
    activeThemeId: first.id,
    mode: "light",
    appTheme: "light",
    themes: [first, second],
  };
}
