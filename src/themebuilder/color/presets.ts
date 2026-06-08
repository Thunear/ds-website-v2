import type { ColorMode } from "./types";
import {
  CONTRAST_STEP_NAMES,
  defaultLuminanceArray,
  defaultLuminances,
  type ContrastStepName,
} from "./scale";

/** A named lightness curve covering both modes. */
export interface LightnessPreset {
  id: string;
  label: string;
  description: string;
  light: number[];
  dark: number[];
}

/** Build a curve from the mode defaults, overriding specific steps. */
function curve(
  mode: ColorMode,
  overrides: Partial<Record<ContrastStepName, number>>,
): number[] {
  const base = defaultLuminances(mode);
  return CONTRAST_STEP_NAMES.map((n) => overrides[n] ?? base[n]);
}

/**
 * AAA raises contrast for the steps people read/interact with against the main
 * backgrounds and surfaces:
 *  - text-subtle / text-default clear 7:1 (vs 4.5:1 AA).
 *  - border-default reaches ~4.5:1 against surface-tinted (vs ~3:1 AA), so
 *    component outlines stay clearly visible.
 */
export const LIGHTNESS_PRESETS: LightnessPreset[] = [
  {
    id: "aa",
    label: "AA",
    description: "Standard kontrast (WCAG AA).",
    light: defaultLuminanceArray("light"),
    dark: defaultLuminanceArray("dark"),
  },
  {
    id: "aaa",
    label: "AAA",
    description: "Høyere tekst- og kantkontrast mot bakgrunn og flate.",
    light: curve("light", {
      "text-subtle": 0.07,
      "text-default": 0.012,
      "border-subtle": 0.44,
      "border-default": 0.14,
      "border-strong": 0.085,
    }),
    dark: curve("dark", {
      "text-subtle": 0.46,
      "text-default": 0.93,
      "border-subtle": 0.1,
      "border-default": 0.3,
      "border-strong": 0.45,
    }),
  },
];

const approxEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 0.0005);

/** Identify which preset a theme's curves match, or null if customised. */
export function matchPreset(
  light: number[],
  dark: number[],
): LightnessPreset | null {
  return (
    LIGHTNESS_PRESETS.find(
      (p) => approxEqual(p.light, light) && approxEqual(p.dark, dark),
    ) ?? null
  );
}
