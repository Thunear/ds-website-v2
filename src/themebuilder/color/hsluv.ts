import chroma from "chroma-js";
import { Hsluv } from "hsluv";

/**
 * Perceptually-uniform lightness helpers, matching Designsystemet's generator
 * (packages/cli/src/colors/utils.ts). The base group is positioned in HSLuv
 * lightness (0–100) rather than WCAG luminance because it spaces hover/active
 * states evenly to the eye.
 */

/** HSLuv lightness (0–100) of a colour. */
export function lightnessFromHex(hex: string): number {
  const conv = new Hsluv();
  conv.hex = hex;
  conv.hexToHsluv();
  return conv.hsluv_l;
}

/** WCAG relative luminance of the neutral grey at a given HSLuv lightness. */
export function luminanceFromLightness(lightness: number): number {
  const conv = new Hsluv();
  conv.hsluv_h = 0;
  conv.hsluv_s = 0;
  conv.hsluv_l = Math.min(100, Math.max(0, lightness));
  conv.hsluvToHex();
  return chroma(conv.hex).luminance();
}
