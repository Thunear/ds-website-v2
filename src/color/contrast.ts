import chroma from "chroma-js";

/** WCAG relative luminance (0–1). chroma computes this in sRGB/RGB space. */
export function relativeLuminance(hex: string): number {
  return chroma(hex).luminance();
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  return chroma.contrast(a, b);
}

/**
 * Force a colour to a target WCAG relative luminance while keeping its hue.
 * chroma mixes toward black/white in RGB space to hit the target, which both
 * preserves the perceived hue and naturally desaturates the extremes.
 */
export function setLuminance(hex: string, targetLuminance: number): string {
  const clamped = Math.min(1, Math.max(0, targetLuminance));
  return chroma(hex).luminance(clamped, "rgb").hex();
}

/**
 * The luminance at which white and black yield equal contrast (~0.179).
 * Below it, white text/contrast wins; above it, black wins.
 */
export const CONTRAST_FLIP_LUMINANCE = Math.sqrt(1.05 * 0.05) - 0.05;

/** Pick black or white for best contrast against `hex`. */
export function bestContrastColor(hex: string): "#ffffff" | "#000000" {
  return relativeLuminance(hex) < CONTRAST_FLIP_LUMINANCE
    ? "#ffffff"
    : "#000000";
}

/**
 * Target luminance needed to reach `ratio` against a reference luminance,
 * on the given side (lighter or darker than the reference).
 */
export function luminanceForRatio(
  referenceLuminance: number,
  ratio: number,
  side: "lighter" | "darker",
): number {
  return side === "lighter"
    ? ratio * (referenceLuminance + 0.05) - 0.05
    : (referenceLuminance + 0.05) / ratio - 0.05;
}
