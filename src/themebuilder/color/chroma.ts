import chroma from "chroma-js";
import { relativeLuminance, setLuminance } from "./contrast";

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

/**
 * Muting: how much colour the "muted" steps keep of their source step.
 *
 * Two limits combine so every scale mutes to a similar, near-neutral level:
 *  - the factor halves the source chroma, so already-quiet colours (a navy
 *    neutral, a pale surface) still read as a touch less colourful;
 *  - the cap flattens vivid hues (a saturated red border sits around 0.16)
 *    down to roughly the chroma of Designsystemet's neutral scale (~0.02–0.03),
 *    i.e. grey with a clear hint of the hue rather than the hue itself.
 */
export const MUTED_CHROMA_FACTOR = 0.5;
export const MUTED_CHROMA_MAX = 0.03;

/**
 * A "muted" version of a step: same WCAG luminance (so identical contrast),
 * hue kept, chroma reduced toward neutral without going fully grey.
 */
export function muteColor(hex: string): string {
  const [l, c, h] = chroma(hex).oklch();
  const current = Number.isNaN(c) ? 0 : c;
  const target = Math.min(current * MUTED_CHROMA_FACTOR, MUTED_CHROMA_MAX);
  const adjusted = chroma.oklch(l, target, Number.isNaN(h) ? 0 : h).hex();
  return setLuminance(adjusted, relativeLuminance(hex));
}
