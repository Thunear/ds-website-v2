import chroma from "chroma-js";
import type { ColorScaleConfig, CustomColor, ThemeConfig } from "@/themebuilder/theme/config";
import {
  defaultLuminances,
  generateColorScale,
  luminanceArrayToMap,
  type LuminanceMap,
} from "./scale";
import { relativeLuminance, setLuminance } from "./contrast";
import type { ColorMode, ColorScale, ColorStep } from "./types";

export interface CustomStep {
  index: number;
  hex: string;
  luminance: number;
}

/**
 * Generate one custom colour across a group's shared lightness ramp: the colour
 * hue forced to each step's luminance, then any per-step chroma applied.
 */
export function deriveCustomColor(
  lightness: number[],
  color: CustomColor,
): CustomStep[] {
  return lightness.map((lum, index) => {
    let hex = setLuminance(color.hex, lum);
    const mult = color.chroma?.[index];
    if (mult !== undefined && mult !== 1) {
      hex = applyChromaMultiplier(hex, mult);
    }
    return { index, hex, luminance: relativeLuminance(hex) };
  });
}

/** Resample a luminance ramp to a new length, preserving its shape. */
export function resampleLightness(values: number[], length: number): number[] {
  if (length === values.length) return values;
  if (values.length <= 1) return Array.from({ length }, () => values[0] ?? 0.5);
  return Array.from({ length }, (_, i) => {
    const t = (i / (length - 1)) * (values.length - 1);
    const lo = Math.floor(t);
    const hi = Math.ceil(t);
    const f = t - lo;
    return Number((values[lo] * (1 - f) + values[hi] * f).toFixed(3));
  });
}

/** Resize a per-step multiplier array, padding new slots with 1 (no change). */
export function resizeChroma(values: number[], length: number): number[] {
  return Array.from({ length }, (_, i) => values[i] ?? 1);
}

/**
 * Scale a colour's OKLCH chroma while keeping its WCAG luminance, so contrast
 * against other steps is preserved (the "safe mode" guarantee).
 */
export function applyChromaMultiplier(hex: string, multiplier: number): string {
  const [l, c, h] = chroma(hex).oklch();
  const adjusted = chroma.oklch(
    l,
    Math.max(0, c * multiplier),
    Number.isNaN(h) ? 0 : h,
  );
  return setLuminance(adjusted.hex(), relativeLuminance(hex));
}

/** The OKLCH chroma of a colour (for display readouts). */
export function chromaOf(hex: string): number {
  const c = chroma(hex).oklch()[1];
  return Number.isNaN(c) ? 0 : c;
}

/** CSS custom-property name for a step, e.g. --ds-color-accent-border-default. */
export function cssVarName(scaleName: string, stepName: string): string {
  return `--ds-color-${scaleName}-${stepName}`;
}

/** The effective lightness curve for a theme + mode (custom or DS defaults). */
export function resolveLuminances(
  theme: ThemeConfig,
  mode: ColorMode,
): LuminanceMap {
  const custom = theme.lightness?.[mode];
  return custom ? luminanceArrayToMap(custom) : defaultLuminances(mode);
}

/**
 * Build the full generated scale for a config entry, applying the theme's
 * lightness curve and any manual per-step overrides on top.
 */
export function deriveScale(
  cfg: ColorScaleConfig,
  mode: ColorMode,
  luminances: LuminanceMap,
): ColorScale {
  const generated = generateColorScale(cfg.name, cfg.hex, mode, luminances);
  const overrides = cfg.overrides?.[mode];
  const chromaAdjust = cfg.chroma?.[mode];
  if (!overrides && !chromaAdjust) return generated;

  const steps: ColorStep[] = generated.steps.map((step) => {
    // An explicit hex override wins outright.
    const override = overrides?.[step.name];
    if (override) {
      return { ...step, hex: override, luminance: relativeLuminance(override) };
    }
    // Otherwise apply a chroma multiplier (luminance preserved).
    const mult = chromaAdjust?.[step.name];
    if (mult !== undefined && mult !== 1) {
      const hex = applyChromaMultiplier(step.hex, mult);
      return { ...step, hex, luminance: relativeLuminance(hex) };
    }
    return step;
  });
  return { ...generated, steps };
}
